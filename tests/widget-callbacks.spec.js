/**
 * Tests for the optional embedder lifecycle callbacks in js/blink-pay-button.js
 * (onSuccess / onError / onTimeout), added in 1.4.0.
 *
 * Contract guarded here:
 *  - Callbacks are only registered when they are functions (bad values ignored).
 *  - onSuccess fires once per settled invoice with a rich payload
 *    ({ username, amount, currency, paymentRequest }) and is double-fire safe
 *    across the three settlement detectors.
 *  - onError fires when a donation attempt fails.
 *  - onTimeout fires once when the invoice countdown reaches 0:00.
 *  - A throwing embedder handler is swallowed (never breaks the widget).
 *  - Omitting the callbacks is null-safe.
 *
 * The widget is loaded by executing its IIFE source (the same approach the other
 * specs use) so we exercise the real shipped file.
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
    // jsdom has no ResizeObserver; the widget guards on it but stub anyway.
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    window.ResizeObserver = global.ResizeObserver;

    document.body.innerHTML = '<div id="blink-pay-button-container"></div>';
    widget = loadWidget();
});

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    delete global.ResizeObserver;
    delete window.ResizeObserver;
});

function initWidget(extra = {}) {
    widget.init({
        username: 'alice',
        containerId: 'blink-pay-button-container',
        debug: false,
        ...extra,
    });
    widget.log = () => {};
}

describe('callback registration', () => {
    it('registers function callbacks', () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const onTimeout = vi.fn();
        initWidget({ onSuccess, onError, onTimeout });

        expect(widget.onSuccess).toBe(onSuccess);
        expect(widget.onError).toBe(onError);
        expect(widget.onTimeout).toBe(onTimeout);
    });

    it('ignores non-function callback values', () => {
        initWidget({ onSuccess: 'nope', onError: 42, onTimeout: {} });

        expect(widget.onSuccess).toBeNull();
        expect(widget.onError).toBeNull();
        expect(widget.onTimeout).toBeNull();
    });

    it('defaults to null when omitted', () => {
        initWidget();
        expect(widget.onSuccess).toBeNull();
        expect(widget.onError).toBeNull();
        expect(widget.onTimeout).toBeNull();
    });
});

describe('fireCallback', () => {
    it('passes the payload through to the handler', () => {
        const onSuccess = vi.fn();
        initWidget({ onSuccess });
        widget.fireCallback('onSuccess', { foo: 'bar' });
        expect(onSuccess).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('swallows errors thrown by the embedder handler', () => {
        const onError = vi.fn(() => {
            throw new Error('embedder blew up');
        });
        initWidget({ onError });
        // Must not throw out of fireCallback.
        expect(() => widget.fireCallback('onError', {})).not.toThrow();
        expect(onError).toHaveBeenCalled();
    });

    it('is a no-op when no handler is registered', () => {
        initWidget();
        expect(() => widget.fireCallback('onSuccess', {})).not.toThrow();
    });
});

describe('onSuccess', () => {
    it('fires once with the rich payload on payment success', () => {
        const onSuccess = vi.fn();
        initWidget({ onSuccess });

        // Simulate the state stashed during a donation + invoice display.
        widget.lastDonation = { amount: 1000, currency: 'sats' };
        widget.currentPaymentRequest = 'lnbc1test';
        widget.successFired = false;

        widget.handlePaymentSuccess();

        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith({
            username: 'alice',
            amount: 1000,
            currency: 'sats',
            paymentRequest: 'lnbc1test',
        });
    });

    it('does not double-fire if handlePaymentSuccess runs twice', () => {
        const onSuccess = vi.fn();
        initWidget({ onSuccess });
        widget.lastDonation = { amount: 5, currency: 'USD' };
        widget.currentPaymentRequest = 'lnbc1twice';
        widget.successFired = false;

        widget.handlePaymentSuccess();
        widget.handlePaymentSuccess();

        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('still completes the success UI when no callback is set', () => {
        initWidget();
        widget.currentPaymentRequest = 'lnbc1nocb';
        widget.successFired = false;
        expect(() => widget.handlePaymentSuccess()).not.toThrow();
        const success = document.getElementById('blink-pay-success');
        expect(success.classList.contains('blink-pay-show')).toBe(true);
    });
});

describe('onTimeout', () => {
    it('fires once when displayInvoice countdown reaches zero', () => {
        vi.useFakeTimers();
        try {
            const onTimeout = vi.fn();
            initWidget({ onTimeout });

            // 0-minute expiry: the first countdown tick is already <= 0.
            widget.displayInvoice('lnbc1expire', 0);

            // Advance enough to run the initial tick + a couple of intervals.
            vi.advanceTimersByTime(3000);

            expect(onTimeout).toHaveBeenCalledTimes(1);
            expect(onTimeout).toHaveBeenCalledWith({ paymentRequest: 'lnbc1expire' });
        } finally {
            vi.useRealTimers();
        }
    });
});

describe('onError', () => {
    it('fires when a donation attempt throws', async () => {
        const onError = vi.fn();
        initWidget({ onError });

        // Force an early failure inside handleDonate's try block.
        const boom = new Error('wallet lookup failed');
        widget.getAccountDefaultWallet = vi.fn(() => {
            throw boom;
        });

        // Provide a valid sats amount so we reach the processing try/catch.
        document.getElementById('blink-pay-amount').value = '1000';
        widget.selectedCurrency = 'sats';

        await widget.handleDonate();

        expect(onError).toHaveBeenCalledTimes(1);
        const arg = onError.mock.calls[0][0];
        expect(arg.message).toBe('wallet lookup failed');
        expect(arg.error).toBe(boom);
    });
});
