/**
 * Tests for bounded payment-status polling (C1) in js/blink-pay-button.js.
 *
 * Before C1, pollVerifyStatus (the primary detector on the self-custodial Spark
 * path) and the legacy pollPaymentStatus polled every 2s FOREVER if the donor
 * never paid — hammering the API on long-lived embeds. C1 bounds them with an
 * invoice deadline (this.invoiceExpiresAt, set by displayInvoice) and exposes
 * stopPaymentPolling() for reset/success cleanup.
 *
 * Uses fake timers to advance through poll cycles without real waiting.
 *
 * Also covers the cancellation race (PR #5 review): if a stop/reset happens while
 * a poll request is already in flight, the loop must NOT resume when that request
 * later resolves. Cancellation is enforced by a generation token bumped in
 * nextPollGeneration()/stopPaymentPolling().
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const widgetSrc = readFileSync(resolve(__dirname, '../js/blink-pay-button.js'), 'utf8');

function loadWidget() {
    const run = new Function(widgetSrc);
    run();
    return window.BlinkPayButton;
}

// A promise whose resolve is exposed so a test can interleave other work (e.g.
// stopPaymentPolling) between the await starting and the request resolving.
function deferred() {
    let resolve;
    const promise = new Promise((res) => {
        resolve = res;
    });
    return { promise, resolve };
}

let widget;

beforeEach(() => {
    vi.useFakeTimers();
    widget = loadWidget();
    widget.log = () => {};
    widget.paymentPollTimeout = null;
    widget.invoiceExpiresAt = null;
    widget.pollGeneration = 0;
    // handlePaymentSuccess touches the DOM; stub it so polling tests stay focused.
    widget.handlePaymentSuccess = vi.fn();
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe('isInvoiceExpired', () => {
    it('is false when no deadline is set (never stop early)', () => {
        widget.invoiceExpiresAt = null;
        expect(widget.isInvoiceExpired()).toBe(false);
    });

    it('reflects the deadline relative to now', () => {
        widget.invoiceExpiresAt = Date.now() + 1000;
        expect(widget.isInvoiceExpired()).toBe(false);
        widget.invoiceExpiresAt = Date.now() - 1;
        expect(widget.isInvoiceExpired()).toBe(true);
    });
});

describe('pollVerifyStatus (bounded)', () => {
    it('stops polling once the invoice deadline passes', async () => {
        const verify = vi
            .fn()
            .mockResolvedValue({ settled: false });
        widget.getLnurl = () => ({ verifyLnurlPayment: verify });

        // Deadline 5s out: allows the first poll, then a couple of cycles.
        widget.invoiceExpiresAt = Date.now() + 5000;

        widget.pollVerifyStatus('https://blink.sv/verify/h');

        // Let the initial check + a few 2s cycles run.
        for (let i = 0; i < 5; i++) {
            await vi.advanceTimersByTimeAsync(2000);
        }

        const callsAtExpiry = verify.mock.calls.length;
        expect(callsAtExpiry).toBeGreaterThan(0);

        // Advance well past expiry; polling must NOT continue indefinitely.
        for (let i = 0; i < 10; i++) {
            await vi.advanceTimersByTimeAsync(2000);
        }
        expect(verify.mock.calls.length).toBe(callsAtExpiry);
        expect(widget.paymentPollTimeout).toBeNull();
    });

    it('calls handlePaymentSuccess and stops when settled', async () => {
        const verify = vi
            .fn()
            .mockResolvedValueOnce({ settled: false })
            .mockResolvedValue({ settled: true });
        widget.getLnurl = () => ({ verifyLnurlPayment: verify });
        widget.invoiceExpiresAt = Date.now() + 60000;

        widget.pollVerifyStatus('https://blink.sv/verify/h');
        await vi.advanceTimersByTimeAsync(2000); // second poll => settled

        expect(widget.handlePaymentSuccess).toHaveBeenCalledTimes(1);

        const callsWhenSettled = verify.mock.calls.length;
        await vi.advanceTimersByTimeAsync(10000);
        expect(verify.mock.calls.length).toBe(callsWhenSettled); // stopped
    });

    it('stops immediately on a terminal verify error (status:ERROR), not backing off to expiry', async () => {
        // A genuine {"status":"ERROR"} means the invoice will never settle; keep
        // re-polling it until expiry is pointless. verifyLnurlPayment tags such
        // errors terminal; pollVerifyStatus must stop rather than reschedule.
        const err = new Error('LNURL verify error: not found');
        err.lnurlVerifyTerminal = true;
        const verify = vi.fn().mockRejectedValue(err);
        widget.getLnurl = () => ({ verifyLnurlPayment: verify });
        widget.invoiceExpiresAt = Date.now() + 60000; // far from expiry

        widget.pollVerifyStatus('https://blink.sv/verify/h');
        await vi.advanceTimersByTimeAsync(0); // let the initial check run

        expect(verify).toHaveBeenCalledTimes(1);
        expect(widget.paymentPollTimeout).toBeNull(); // did not reschedule

        // Advancing past both the 2s success cadence and the 5s error backoff
        // proves it truly stopped.
        await vi.advanceTimersByTimeAsync(10000);
        expect(verify).toHaveBeenCalledTimes(1);
    });

    it('keeps backing off and retrying on a transient (non-terminal) error', async () => {
        // A transient network/HTTP blip must NOT stop polling: back off 5s and retry.
        const transient = new Error('LNURL verify returned 502');
        const verify = vi
            .fn()
            .mockRejectedValueOnce(transient) // first poll fails transiently
            .mockResolvedValue({ settled: false }); // subsequent polls unpaid
        widget.getLnurl = () => ({ verifyLnurlPayment: verify });
        widget.invoiceExpiresAt = Date.now() + 60000;

        widget.pollVerifyStatus('https://blink.sv/verify/h');
        await vi.advanceTimersByTimeAsync(0); // initial check throws transiently
        expect(verify).toHaveBeenCalledTimes(1);
        expect(widget.paymentPollTimeout).not.toBeNull(); // scheduled a retry

        await vi.advanceTimersByTimeAsync(5000); // 5s error backoff elapses => retry
        expect(verify.mock.calls.length).toBeGreaterThan(1);

        widget.stopPaymentPolling(); // don't leave it polling
    });

    // Blink's verify route returns status:ERROR for a transient backend failure
    // ("…try again later"). verifyLnurlPayment throws WITHOUT the terminal tag for
    // such reasons, so pollVerifyStatus must keep retrying (not stop), or a later
    // payment would go unobserved. Drives the real inline verifyLnurlPayment via a
    // stubbed fetch so the reason-based classification is exercised end-to-end.
    it('keeps retrying when verify returns a transient "try again later" status:ERROR', async () => {
        const inline = widget.getLnurl(); // real inline verifyLnurlPayment
        widget.getLnurl = () => inline;

        let calls = 0;
        const fetchMock = vi.fn().mockImplementation(async () => {
            calls++;
            // Always the transient ERROR envelope (HTTP 200, status:ERROR).
            return {
                ok: true,
                status: 200,
                statusText: 'OK',
                json: async () => ({
                    status: 'ERROR',
                    reason: 'We could not verify the invoice. Please try again later.',
                }),
            };
        });
        window.fetch = fetchMock;
        global.fetch = fetchMock;
        widget.invoiceExpiresAt = Date.now() + 60000;

        widget.pollVerifyStatus('https://blink.sv/verify/h');
        await vi.advanceTimersByTimeAsync(0); // initial check: transient ERROR thrown
        expect(calls).toBe(1);
        expect(widget.paymentPollTimeout).not.toBeNull(); // scheduled a retry (did NOT stop)

        await vi.advanceTimersByTimeAsync(5000); // 5s error backoff => retry
        expect(calls).toBeGreaterThan(1);

        widget.stopPaymentPolling();
        delete window.fetch;
        delete global.fetch;
    });
});

describe('stopPaymentPolling', () => {
    it('clears a pending poll and the deadline', async () => {
        const verify = vi.fn().mockResolvedValue({ settled: false });
        widget.getLnurl = () => ({ verifyLnurlPayment: verify });
        widget.invoiceExpiresAt = Date.now() + 60000;

        widget.pollVerifyStatus('https://blink.sv/verify/h');
        await vi.advanceTimersByTimeAsync(0); // run the initial check, schedule next
        expect(widget.paymentPollTimeout).not.toBeNull();

        const callsBeforeStop = verify.mock.calls.length;
        widget.stopPaymentPolling();
        expect(widget.paymentPollTimeout).toBeNull();
        expect(widget.invoiceExpiresAt).toBeNull();

        await vi.advanceTimersByTimeAsync(10000);
        expect(verify.mock.calls.length).toBe(callsBeforeStop); // no more polls
    });
});

describe('stop-while-a-poll-is-in-flight (cancellation race, PR #5 review)', () => {
    it('pollVerifyStatus does not resume after stop if the in-flight verify resolves unpaid', async () => {
        const d = deferred();
        const verify = vi.fn().mockReturnValueOnce(d.promise);
        widget.getLnurl = () => ({ verifyLnurlPayment: verify });
        widget.invoiceExpiresAt = Date.now() + 60000;

        widget.pollVerifyStatus('https://blink.sv/verify/h');
        // The first check() has run and is now awaiting verify (request in flight).
        expect(verify).toHaveBeenCalledTimes(1);

        // Stop (e.g. success/reset elsewhere) while the request is still pending.
        widget.stopPaymentPolling();

        // Now the in-flight request resolves as unpaid.
        d.resolve({ settled: false });
        await Promise.resolve();
        await Promise.resolve();

        // It must NOT have scheduled another poll.
        expect(widget.paymentPollTimeout).toBeNull();
        await vi.advanceTimersByTimeAsync(30000);
        expect(verify).toHaveBeenCalledTimes(1);
    });

    it('pollPaymentStatus does not resume after stop if the in-flight request resolves PENDING', async () => {
        const d = deferred();
        // First fetch is the in-flight request; resolve to a PENDING status.
        const fetchMock = vi.fn().mockReturnValueOnce(
            d.promise.then(() => ({
                json: async () => ({ data: { lnInvoicePaymentStatus: { status: 'PENDING' } } }),
            }))
        );
        window.fetch = fetchMock;
        global.fetch = fetchMock;
        widget.invoiceExpiresAt = Date.now() + 60000;

        widget.pollPaymentStatus('lnbc1invoice');
        expect(fetchMock).toHaveBeenCalledTimes(1); // in flight

        // Stop while the request is pending.
        widget.stopPaymentPolling();

        // Resolve the in-flight request as unpaid.
        d.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(widget.paymentPollTimeout).toBeNull();
        await vi.advanceTimersByTimeAsync(30000);
        expect(fetchMock).toHaveBeenCalledTimes(1); // loop did not resume

        delete window.fetch;
        delete global.fetch;
    });

    it('starting a new poll supersedes a previously in-flight loop', async () => {
        const d1 = deferred();
        const verify = vi
            .fn()
            .mockReturnValueOnce(d1.promise) // first (old) loop's in-flight request
            .mockResolvedValue({ settled: false }); // second (new) loop
        widget.getLnurl = () => ({ verifyLnurlPayment: verify });
        widget.invoiceExpiresAt = Date.now() + 60000;

        widget.pollVerifyStatus('https://blink.sv/verify/a'); // old loop, gen N
        widget.pollVerifyStatus('https://blink.sv/verify/b'); // new loop, gen N+1

        const callsAfterStart = verify.mock.calls.length;

        // The old loop's request now resolves; it must not reschedule (stale gen).
        d1.resolve({ settled: false });
        await Promise.resolve();
        await Promise.resolve();

        // Stop the active (new) loop so the test doesn't poll unbounded.
        widget.stopPaymentPolling();
        await vi.advanceTimersByTimeAsync(10000);

        // The old loop never produced an extra scheduled call beyond what the new
        // loop accounts for; key assertion is no runaway growth.
        expect(verify.mock.calls.length).toBe(callsAfterStart);
    });
});
