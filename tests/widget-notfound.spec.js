/**
 * Tests for the friendly "username not found" UX (C2) in js/blink-pay-button.js.
 *
 * Before C2, a truly non-existent username fell through custodial (no wallet) to
 * the self-custodial LNURL path, whose .well-known lookup 404s, surfacing the raw
 * "LNURL endpoint returned 404" to the donor. C2 detects the not-found case and
 * shows a clear, translated message (t('usernameNotFound')).
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
    widget = loadWidget();
    widget.log = () => {};
    widget.language = 'en';
    widget.username = 'doesnotexist';
    widget.selectedCurrency = 'sats';
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('isUsernameNotFoundError', () => {
    it('matches a 404 LNURL error', () => {
        expect(widget.isUsernameNotFoundError(new Error('LNURL endpoint returned 404'))).toBe(true);
    });

    it('matches a "not found" message', () => {
        expect(widget.isUsernameNotFoundError(new Error('Account not found'))).toBe(true);
    });

    it('does not match unrelated errors', () => {
        expect(widget.isUsernameNotFoundError(new Error('Network timeout'))).toBe(false);
        expect(widget.isUsernameNotFoundError(new Error('LNURL endpoint returned 500'))).toBe(false);
        expect(widget.isUsernameNotFoundError(null)).toBe(false);
    });
});

describe('handleSelfCustodialDonate not-found handling', () => {
    it('rethrows the friendly message when the LNURL lookup 404s', async () => {
        widget.getLnurl = () => ({
            normalizeBlinkLightningAddress: (u) => `${u}@blink.sv`,
            getInvoiceFromLightningAddress: async () => {
                throw new Error('LNURL endpoint returned 404');
            },
        });

        await expect(widget.handleSelfCustodialDonate(1000)).rejects.toThrow(
            widget.t('usernameNotFound')
        );
        // The friendly message should not leak the raw technical text.
        await expect(widget.handleSelfCustodialDonate(1000)).rejects.not.toThrow(/404/);
    });

    it('passes through non-not-found errors unchanged', async () => {
        widget.getLnurl = () => ({
            normalizeBlinkLightningAddress: (u) => `${u}@blink.sv`,
            getInvoiceFromLightningAddress: async () => {
                throw new Error('LNURL endpoint returned 500');
            },
        });

        await expect(widget.handleSelfCustodialDonate(1000)).rejects.toThrow(/500/);
    });

    it('t(usernameNotFound) returns a non-key, donor-facing string', () => {
        const msg = widget.t('usernameNotFound');
        expect(msg).not.toBe('usernameNotFound');
        expect(msg.length).toBeGreaterThan(0);
    });
});
