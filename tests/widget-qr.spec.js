/**
 * Tests for client-side QR generation in js/blink-pay-button.js (1.5.0).
 *
 * The widget now renders the invoice QR locally via an inlined, MIT-licensed
 * qrcode-generator instead of fetching an image from api.qrserver.com. These
 * tests lock in:
 *  - buildQrDataUrl() returns a base64 data URI (no network), or null on failure.
 *  - displayInvoice() puts an <img> in #blink-pay-qr whose src is a local data:
 *    URI — NOT an http(s) URL (guards against reintroducing a third-party call).
 *  - The QR <img> keeps its click-to-copy wiring and accessible alt text.
 *  - The source no longer references api.qrserver.com in any code path.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const widgetPath = resolve(__dirname, '../js/blink-pay-button.js');
const widgetSrc = readFileSync(widgetPath, 'utf8');

function loadWidget() {
    const run = new Function(widgetSrc);
    run();
    return window.BlinkPayButton;
}

let widget;

beforeEach(() => {
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
    widget.log = () => {};
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
    delete global.ResizeObserver;
    delete window.ResizeObserver;
});

describe('buildQrDataUrl', () => {
    it('returns a base64 image data URI for an invoice string', () => {
        const url = widget.buildQrDataUrl('lnbc1ptestinvoice0123456789abcdef');
        expect(typeof url).toBe('string');
        expect(url.startsWith('data:image/')).toBe(true);
        expect(url).toContain('base64,');
        expect(url.length).toBeGreaterThan(100);
    });

    it('does not produce an http(s) URL', () => {
        const url = widget.buildQrDataUrl('lnbc1pabc');
        expect(url.startsWith('http')).toBe(false);
    });

    it('returns null (no throw) if the generator fails', () => {
        // addData with a non-string triggers an internal error path.
        const url = widget.buildQrDataUrl(undefined);
        expect(url).toBeNull();
    });
});

describe('displayInvoice QR rendering', () => {
    it('renders a local data-URI <img> into #blink-pay-qr (no third-party URL)', () => {
        vi.useFakeTimers();
        widget.displayInvoice('lnbc1pdisplaytest0123456789', 15);

        const qr = document.getElementById('blink-pay-qr');
        const img = qr.querySelector('img');
        expect(img).not.toBeNull();
        expect(img.src.startsWith('data:image/')).toBe(true);
        expect(img.src).not.toContain('qrserver');
        expect(img.src.startsWith('http')).toBe(false);
    });

    it('keeps the accessible alt text and click-to-copy affordance', () => {
        vi.useFakeTimers();
        widget.displayInvoice('lnbc1paltcopy', 15);

        const img = document.getElementById('blink-pay-qr').querySelector('img');
        expect(img.alt).toBeTruthy();
        expect(img.title).toMatch(/copy/i);
        expect(img.style.cursor).toBe('pointer');
    });

    it('copies the payment request when the QR is clicked', () => {
        vi.useFakeTimers();
        const writeText = vi.fn().mockResolvedValue(undefined);
        // jsdom may not define navigator.clipboard; install a stub.
        Object.defineProperty(global.navigator, 'clipboard', {
            value: { writeText },
            configurable: true,
        });

        const pr = 'lnbc1pclickcopy';
        widget.displayInvoice(pr, 15);
        document.getElementById('blink-pay-qr').querySelector('img').click();

        expect(writeText).toHaveBeenCalledWith(pr);
    });
});

describe('no third-party QR service', () => {
    it('source contains no api.qrserver.com calls', () => {
        // Allow descriptive comments mentioning the former dependency, but no
        // actual request URL should remain.
        expect(widgetSrc).not.toMatch(/https?:\/\/api\.qrserver\.com/);
    });

    it('dead generateQRWithLogo helper definition is removed', () => {
        // The changelog comment may still mention it; assert the function
        // definition itself is gone.
        expect(widgetSrc).not.toMatch(/generateQRWithLogo\s*:\s*function/);
        expect(widget.generateQRWithLogo).toBeUndefined();
    });
});
