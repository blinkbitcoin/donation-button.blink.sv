/**
 * Contract tests for the widget's self-custodial (Spark) path in
 * js/blink-pay-button.js.
 *
 * The widget ships as a single <script>, so it carries an INLINE copy of the
 * LNURL helpers (BlinkPayButton.getLnurl()) used when js/blink-lnurl.js is not
 * separately loaded. These tests:
 *   1. load the widget into jsdom (it assigns window.BlinkPayButton),
 *   2. exercise the inline helpers via a stubbed window.fetch, and
 *   3. assert the inline behaviour matches the canonical js/blink-lnurl.js module
 *      (so the two cannot silently drift).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadUmd } from './load-umd.js';

const Canonical = loadUmd('../js/blink-lnurl.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const widgetSrc = readFileSync(
  resolve(__dirname, '../js/blink-pay-button.js'),
  'utf8'
);

// Load the widget IIFE into the current (jsdom) realm so it assigns
// window.BlinkPayButton. Runs once; the object is stateless for our purposes.
function loadWidget() {
  const run = new Function(widgetSrc);
  run();
  return window.BlinkPayButton;
}

function jsonResponse(body, { ok = true, status = 200, statusText = 'OK' } = {}) {
  return { ok, status, statusText, json: async () => body };
}

let widget;

beforeEach(() => {
  // Ensure the inline path is used (canonical global not present).
  delete window.BlinkLnurl;
  widget = loadWidget();
  // Fresh inline helper cache per test.
  widget._inlineLnurl = null;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete window.fetch;
  delete global.fetch;
});

describe('widget inline Spark helpers (getLnurl)', () => {
  it('uses window.BlinkLnurl when present (prefers the canonical module)', () => {
    window.BlinkLnurl = Canonical;
    widget._inlineLnurl = null;
    expect(widget.getLnurl()).toBe(Canonical);
    delete window.BlinkLnurl;
  });

  it('inline normalizeBlinkLightningAddress matches the canonical module', () => {
    const inline = widget.getLnurl();
    for (const input of ['alice', 'alice@blink.sv', 'lightning:alice', 'bob@BLINK.SV']) {
      expect(inline.normalizeBlinkLightningAddress(input)).toBe(
        Canonical.normalizeBlinkLightningAddress(input)
      );
    }
    expect(() => inline.normalizeBlinkLightningAddress('a@evil.com')).toThrow(/not a Blink address/i);
  });

  it('inline isBlinkLightningAddress matches the canonical module', () => {
    const inline = widget.getLnurl();
    for (const a of ['alice@blink.sv', 'alice@evil.com', 'blink.sv', '']) {
      expect(inline.isBlinkLightningAddress(a)).toBe(Canonical.isBlinkLightningAddress(a));
    }
  });

  it('inline getInvoiceFromLightningAddress resolves end-to-end via stubbed fetch', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          tag: 'payRequest',
          callback: 'https://blink.sv/lnurlp/yasar/invoice',
          minSendable: 1000,
          maxSendable: 100000000,
          commentAllowed: 120,
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({ pr: 'lnbc1sparkinvoice', verify: 'https://blink.sv/verify/abc' })
      );
    window.fetch = fetchMock;
    global.fetch = fetchMock;

    const inline = widget.getLnurl();
    const result = await inline.getInvoiceFromLightningAddress(
      'yasar@blink.sv',
      5000,
      'yasar donation button'
    );
    expect(result.paymentRequest).toBe('lnbc1sparkinvoice');
    expect(result.verifyUrl).toBe('https://blink.sv/verify/abc');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('inline getInvoiceFromLightningAddress rejects a non-Blink domain with no fetch', async () => {
    const fetchMock = vi.fn();
    window.fetch = fetchMock;
    global.fetch = fetchMock;
    const inline = widget.getLnurl();
    await expect(
      inline.getInvoiceFromLightningAddress('alice@evil.com', 5000, '')
    ).rejects.toThrow(/not a Blink address/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('inline verifyLnurlPayment reports settled state', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ status: 'OK', settled: false }))
      .mockResolvedValueOnce(jsonResponse({ status: 'OK', settled: true, preimage: 'p' }));
    window.fetch = fetchMock;
    global.fetch = fetchMock;

    const inline = widget.getLnurl();
    expect((await inline.verifyLnurlPayment('https://blink.sv/verify/h')).settled).toBe(false);
    const paid = await inline.verifyLnurlPayment('https://blink.sv/verify/h');
    expect(paid.settled).toBe(true);
    expect(paid.preimage).toBe('p');
  });
});

describe('widget getAccountDefaultWallet (custodial probe)', () => {
  it('returns { id: null } for a self-custodial username (no custodial wallet)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: { accountDefaultWallet: null } })
    );
    window.fetch = fetchMock;
    global.fetch = fetchMock;
    widget.username = 'yasar';
    widget.debug = false;

    const info = await widget.getAccountDefaultWallet('yasar');
    expect(info.id).toBeNull();
  });

  it('returns the wallet id for a custodial username', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: { accountDefaultWallet: { id: 'wallet-123', currency: 'BTC' } } })
    );
    window.fetch = fetchMock;
    global.fetch = fetchMock;
    widget.username = 'pretyflaco';
    widget.debug = false;

    const info = await widget.getAccountDefaultWallet('pretyflaco');
    expect(info.id).toBe('wallet-123');
    expect(info.currency).toBe('BTC');
  });

  it('returns { id: null } (not throw) when the API returns GraphQL errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ errors: [{ message: 'no account' }] })
    );
    window.fetch = fetchMock;
    global.fetch = fetchMock;
    widget.username = 'ghost';
    widget.debug = false;

    const info = await widget.getAccountDefaultWallet('ghost');
    expect(info.id).toBeNull();
  });
});
