/**
 * Tests for js/blink-lnurl.js — the canonical, browser-and-test shared LNURL
 * helpers used for self-custodial (Spark) donation receive.
 *
 * The helper file is UMD (attaches to globalThis.BlinkLnurl and sets
 * module.exports). We load it via createRequire so the CommonJS export path is
 * exercised exactly as Node/test consumers see it.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadUmd } from './load-umd.js';

const BlinkLnurl = loadUmd('../js/blink-lnurl.js');

// Helper to build a fake fetch returning a JSON body with a given ok/status.
function jsonResponse(body, { ok = true, status = 200, statusText = 'OK' } = {}) {
  return {
    ok,
    status,
    statusText,
    json: async () => body,
  };
}

describe('blink-lnurl helpers', () => {
  describe('parseLightningAddress', () => {
    it('parses a valid blink.sv address into a LUD-16 endpoint', () => {
      const r = BlinkLnurl.parseLightningAddress('alice@blink.sv');
      expect(r.localpart).toBe('alice');
      expect(r.domain).toBe('blink.sv');
      expect(r.lnurlEndpoint).toBe('https://blink.sv/.well-known/lnurlp/alice');
    });

    it('throws on malformed addresses', () => {
      expect(() => BlinkLnurl.parseLightningAddress('no-at-sign')).toThrow();
      expect(() => BlinkLnurl.parseLightningAddress('a@b@c')).toThrow();
      expect(() => BlinkLnurl.parseLightningAddress('')).toThrow();
    });
  });

  describe('isBlinkLightningAddress', () => {
    it('accepts blink.sv (address or bare domain), case-insensitive', () => {
      expect(BlinkLnurl.isBlinkLightningAddress('alice@blink.sv')).toBe(true);
      expect(BlinkLnurl.isBlinkLightningAddress('alice@BLINK.SV')).toBe(true);
      expect(BlinkLnurl.isBlinkLightningAddress('blink.sv')).toBe(true);
    });

    it('rejects non-Blink domains', () => {
      expect(BlinkLnurl.isBlinkLightningAddress('alice@evil.com')).toBe(false);
      expect(BlinkLnurl.isBlinkLightningAddress('evil.com')).toBe(false);
      expect(BlinkLnurl.isBlinkLightningAddress('')).toBe(false);
    });
  });

  describe('normalizeBlinkLightningAddress', () => {
    it('turns a bare username into username@blink.sv', () => {
      expect(BlinkLnurl.normalizeBlinkLightningAddress('alice')).toBe('alice@blink.sv');
    });

    it('preserves an explicit blink.sv address (lowercased domain)', () => {
      expect(BlinkLnurl.normalizeBlinkLightningAddress('alice@BLINK.SV')).toBe('alice@blink.sv');
    });

    it('strips a lightning: prefix', () => {
      expect(BlinkLnurl.normalizeBlinkLightningAddress('lightning:alice')).toBe('alice@blink.sv');
    });

    it('rejects an explicit non-Blink domain', () => {
      expect(() => BlinkLnurl.normalizeBlinkLightningAddress('alice@evil.com')).toThrow(/not a Blink address/i);
    });

    it('rejects empty input', () => {
      expect(() => BlinkLnurl.normalizeBlinkLightningAddress('')).toThrow();
    });
  });

  describe('fetchLnurlPayMetadata', () => {
    it('returns parsed metadata for a valid payRequest', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          tag: 'payRequest',
          callback: 'https://blink.sv/lnurlp/alice/invoice',
          minSendable: 1000,
          maxSendable: 100000000,
          metadata: '[["text/plain","pay alice"]]',
          commentAllowed: 120,
        })
      );
      const meta = await BlinkLnurl.fetchLnurlPayMetadata(
        'https://blink.sv/.well-known/lnurlp/alice',
        fetchMock
      );
      expect(meta.callback).toBe('https://blink.sv/lnurlp/alice/invoice');
      expect(meta.minSendable).toBe(1000);
      expect(meta.maxSendable).toBe(100000000);
      expect(meta.commentAllowed).toBe(120);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws on a non-payRequest tag', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ tag: 'withdrawRequest' }));
      await expect(
        BlinkLnurl.fetchLnurlPayMetadata('https://blink.sv/x', fetchMock)
      ).rejects.toThrow(/payRequest/);
    });

    it('throws on a non-ok HTTP response', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({}, { ok: false, status: 404, statusText: 'Not Found' })
      );
      await expect(
        BlinkLnurl.fetchLnurlPayMetadata('https://blink.sv/x', fetchMock)
      ).rejects.toThrow(/404/);
    });
  });

  describe('requestInvoiceFromCallback', () => {
    it('appends amount + comment and returns pr/verify', async () => {
      let calledUrl = '';
      const fetchMock = vi.fn().mockImplementation((url) => {
        calledUrl = url;
        return Promise.resolve(
          jsonResponse({ pr: 'lnbc1invoice', verify: 'https://blink.sv/verify/h' })
        );
      });
      const result = await BlinkLnurl.requestInvoiceFromCallback(
        'https://blink.sv/lnurlp/alice/invoice',
        5000000,
        'hello',
        fetchMock
      );
      expect(result.paymentRequest).toBe('lnbc1invoice');
      expect(result.verify).toBe('https://blink.sv/verify/h');
      expect(calledUrl).toContain('amount=5000000');
      expect(calledUrl).toContain('comment=hello');
    });

    it('throws on an LNURL ERROR status', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ status: 'ERROR', reason: 'amount out of range' })
      );
      await expect(
        BlinkLnurl.requestInvoiceFromCallback('https://blink.sv/cb', 1000, '', fetchMock)
      ).rejects.toThrow(/amount out of range/);
    });

    it('throws when no pr is returned', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ routes: [] }));
      await expect(
        BlinkLnurl.requestInvoiceFromCallback('https://blink.sv/cb', 1000, '', fetchMock)
      ).rejects.toThrow(/payment request/);
    });
  });

  describe('getInvoiceFromLightningAddress', () => {
    function metaFetch(meta) {
      // First call: metadata. Second call: callback invoice.
      return vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(meta))
        .mockResolvedValueOnce(
          jsonResponse({ pr: 'lnbc1sparkinvoice', verify: 'https://blink.sv/verify/abc' })
        );
    }

    const goodMeta = {
      tag: 'payRequest',
      callback: 'https://blink.sv/lnurlp/yasar/invoice',
      minSendable: 1000, // 1 sat
      maxSendable: 100000000, // 100k sat
      commentAllowed: 120,
    };

    it('resolves a blink.sv address end-to-end and returns paymentRequest + verifyUrl', async () => {
      const fetchMock = metaFetch(goodMeta);
      const result = await BlinkLnurl.getInvoiceFromLightningAddress(
        'yasar@blink.sv',
        5000,
        'yasar donation button',
        fetchMock
      );
      expect(result.paymentRequest).toBe('lnbc1sparkinvoice');
      expect(result.verifyUrl).toBe('https://blink.sv/verify/abc');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('rejects a non-Blink domain WITHOUT any network call (SSRF-tightening)', async () => {
      const fetchMock = vi.fn();
      await expect(
        BlinkLnurl.getInvoiceFromLightningAddress('alice@evil.com', 5000, '', fetchMock)
      ).rejects.toThrow(/not a Blink address/i);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects an amount below minSendable', async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(goodMeta));
      await expect(
        BlinkLnurl.getInvoiceFromLightningAddress('yasar@blink.sv', 0, '', fetchMock)
      ).rejects.toThrow(/below minimum/i);
    });

    it('rejects an amount above maxSendable', async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(goodMeta));
      await expect(
        BlinkLnurl.getInvoiceFromLightningAddress('yasar@blink.sv', 200000, '', fetchMock)
      ).rejects.toThrow(/exceeds maximum/i);
    });
  });

  describe('verifyLnurlPayment', () => {
    it('reports settled=true when the verify endpoint says so', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ status: 'OK', settled: true, preimage: 'deadbeef', pr: 'lnbc1' })
      );
      const r = await BlinkLnurl.verifyLnurlPayment('https://blink.sv/verify/h', fetchMock);
      expect(r.settled).toBe(true);
      expect(r.preimage).toBe('deadbeef');
    });

    it('reports settled=false while unpaid', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ status: 'OK', settled: false, preimage: null, pr: 'lnbc1' })
      );
      const r = await BlinkLnurl.verifyLnurlPayment('https://blink.sv/verify/h', fetchMock);
      expect(r.settled).toBe(false);
      expect(r.preimage).toBeUndefined();
    });

    it('throws on an ERROR status', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ status: 'ERROR', reason: 'not found' })
      );
      await expect(
        BlinkLnurl.verifyLnurlPayment('https://blink.sv/verify/h', fetchMock)
      ).rejects.toThrow(/not found/);
    });

    it('throws on a non-ok HTTP response', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({}, { ok: false, status: 502, statusText: 'Bad Gateway' })
      );
      await expect(
        BlinkLnurl.verifyLnurlPayment('https://blink.sv/verify/h', fetchMock)
      ).rejects.toThrow(/502/);
    });
  });
});
