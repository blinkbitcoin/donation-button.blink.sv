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

let widget;

beforeEach(() => {
    vi.useFakeTimers();
    widget = loadWidget();
    widget.log = () => {};
    widget.paymentPollTimeout = null;
    widget.invoiceExpiresAt = null;
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
