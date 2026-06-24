/**
 * Characterization tests for the widget's render + success DOM transitions in
 * js/blink-pay-button.js.
 *
 * These guard the planned monolith split / CSS cleanup: they assert the CURRENT
 * DOM contract (element ids the embed relies on, and the show/hide state changes
 * on a successful payment) so a refactor cannot silently break live embeds.
 *
 * We render the widget into a real jsdom container via init(), then drive the
 * success transition directly with handlePaymentSuccess().
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
    // jsdom has no ResizeObserver; the widget guards on it but stub anyway so
    // attachEventListeners' observer path is exercised harmlessly.
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    window.ResizeObserver = global.ResizeObserver;

    document.body.innerHTML = '<div id="blink-pay-button-container"></div>';
    widget = loadWidget();
    widget.init({
        username: 'alice',
        containerId: 'blink-pay-button-container',
        debug: false,
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    delete global.ResizeObserver;
    delete window.ResizeObserver;
});

describe('render() DOM contract', () => {
    it('renders the core elements the embed/flow depends on', () => {
        // These ids are referenced throughout the payment flow; the refactor
        // must keep them stable.
        for (const id of [
            'blink-pay-button',
            'blink-pay-amount',
            'blink-pay-qr',
            'blink-pay-success',
            'blink-pay-status',
        ]) {
            expect(document.getElementById(id), `#${id} should exist`).not.toBeNull();
        }
    });

    it('starts with the success icon hidden (no blink-pay-show)', () => {
        const success = document.getElementById('blink-pay-success');
        expect(success.classList.contains('blink-pay-show')).toBe(false);
    });
});

describe('handlePaymentSuccess() transition', () => {
    it('shows the success icon and hides the QR', () => {
        const success = document.getElementById('blink-pay-success');
        const qr = document.getElementById('blink-pay-qr');

        widget.handlePaymentSuccess();

        expect(success.classList.contains('blink-pay-show')).toBe(true);
        expect(success.style.visibility).toBe('visible');
        expect(success.style.opacity).toBe('1');

        expect(qr.classList.contains('blink-pay-show')).toBe(false);
        expect(qr.style.visibility).toBe('hidden');
    });

    it('hides the amount input group', () => {
        const amount = document.getElementById('blink-pay-amount');
        const inputGroup = amount.parentElement;

        widget.handlePaymentSuccess();

        expect(inputGroup.style.display).toBe('none');
        expect(inputGroup.style.visibility).toBe('hidden');
    });

    it('clears a running countdown interval', () => {
        const spy = vi.spyOn(global, 'clearInterval');
        widget.countdownInterval = setInterval(() => {}, 1000);

        widget.handlePaymentSuccess();

        expect(spy).toHaveBeenCalled();
        expect(widget.countdownInterval).toBeNull();
    });

    it('clicking the success button resets the widget to the input state', () => {
        widget.handlePaymentSuccess();

        const amount = document.getElementById('blink-pay-amount');
        const inputGroup = amount.parentElement;
        expect(inputGroup.style.display).toBe('none');

        // After success, the button was cloned; query the live one and click it.
        document.getElementById('blink-pay-button').click();

        const success = document.getElementById('blink-pay-success');
        expect(success.classList.contains('blink-pay-show')).toBe(false);
        expect(inputGroup.style.display).toBe('flex');
        expect(inputGroup.style.visibility).toBe('visible');
    });
});
