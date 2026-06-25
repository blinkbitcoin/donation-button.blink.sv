/**
 * Blink LNURL helpers (self-custodial Spark receive support)
 *
 * Pure, side-effect-free helpers for the LNURL-pay (LUD-16) + LUD-21 verify flow
 * used to receive donations for self-custodial Blink (Spark) Lightning-address
 * users. Ported from blink-terminal's lib/lnurl.ts.
 *
 * Why a separate file: the donation widget (blink-pay-button.js) is shipped as a
 * single <script> with no build step. These helpers are kept here as a pure
 * module so they can be unit-tested (Vitest) AND consumed by the widget at
 * runtime via `window.BlinkLnurl` (the widget falls back to an inline copy if
 * this file is not loaded, so existing single-file embeds keep working).
 *
 * Production / blink.sv ONLY: callers must reject non-Blink domains before using
 * these helpers (see isBlinkLightningAddress / ALLOWED_BLINK_DOMAINS).
 *
 * `fetch` is injected (last argument) so tests can mock it without globals.
 */
(function (root, factory) {
  // UMD: attach to window/globalThis as `BlinkLnurl` for the browser <script>
  // path, and expose CommonJS/ESM exports for the test runner.
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.BlinkLnurl = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Allowed Blink Lightning-address domains. Anything else is rejected before
  // any network access (the widget runs in the donor's browser, so the SSRF risk
  // is lower than Terminal's server path, but we keep the surface tight and
  // predictable: this widget only serves Blink custodial/Spark receivers).
  const ALLOWED_BLINK_DOMAINS = ['blink.sv'];

  const defaultFetch =
    typeof fetch !== 'undefined' ? (...args) => fetch(...args) : null;

  function getFetch(injected) {
    const f = injected || defaultFetch;
    if (!f) {
      throw new Error('No fetch implementation available');
    }
    return f;
  }

  /**
   * Parse a Lightning address into its LNURL-pay endpoint (LUD-16).
   * @param {string} address - e.g. "alice@blink.sv"
   * @returns {{ localpart: string, domain: string, lnurlEndpoint: string }}
   */
  function parseLightningAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid Lightning address: address is required');
    }
    const parts = address.trim().split('@');
    if (parts.length !== 2) {
      throw new Error('Invalid Lightning address format: ' + address);
    }
    const localpart = parts[0];
    const domain = parts[1].toLowerCase();
    if (!localpart || !domain) {
      throw new Error('Invalid Lightning address: missing local part or domain');
    }
    return {
      localpart: localpart,
      domain: domain,
      lnurlEndpoint: 'https://' + domain + '/.well-known/lnurlp/' + localpart,
    };
  }

  /**
   * Whether an address (or bare domain) is a known Blink Lightning-address domain.
   * @param {string} address - "alice@blink.sv" or "blink.sv"
   * @returns {boolean}
   */
  function isBlinkLightningAddress(address) {
    if (!address || typeof address !== 'string') return false;
    const domain = address.includes('@')
      ? address.split('@')[1]
      : address;
    return ALLOWED_BLINK_DOMAINS.includes((domain || '').trim().toLowerCase());
  }

  /**
   * Normalize a user-supplied username/address into a bare blink.sv Lightning
   * address. Accepts "alice" or "alice@blink.sv"; rejects non-Blink domains.
   * Strips a leading "lightning:" prefix. Returns the bare address so the LNURL
   * server's default-account routing applies (a "+usd"/"+btc" suffix would force
   * a wallet; we intentionally use the bare form so funds land in the user's
   * current default account).
   * @param {string} input
   * @returns {string} e.g. "alice@blink.sv"
   */
  function normalizeBlinkLightningAddress(input) {
    if (!input || typeof input !== 'string') {
      throw new Error('Username is required');
    }
    let value = input.trim();
    if (value.toLowerCase().startsWith('lightning:')) {
      value = value.slice('lightning:'.length).trim();
    }
    if (value.includes('@')) {
      const parts = value.split('@');
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new Error('Invalid Lightning address format: ' + input);
      }
      const domain = parts[1].toLowerCase();
      if (!ALLOWED_BLINK_DOMAINS.includes(domain)) {
        throw new Error(
          "'" + input + "' is not a Blink address. Only " +
            ALLOWED_BLINK_DOMAINS[0] + ' addresses are supported.'
        );
      }
      return parts[0] + '@' + domain;
    }
    return value + '@' + ALLOWED_BLINK_DOMAINS[0];
  }

  /**
   * Fetch LNURL-pay metadata (LUD-06) from an endpoint.
   * @param {string} lnurlEndpoint
   * @param {Function} [injectedFetch]
   * @returns {Promise<{callback:string,minSendable:number,maxSendable:number,metadata?:string,commentAllowed:number}>}
   */
  async function fetchLnurlPayMetadata(lnurlEndpoint, injectedFetch) {
    const doFetch = getFetch(injectedFetch);
    const response = await doFetch(lnurlEndpoint, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(
        'LNURL endpoint returned ' + response.status + ': ' + response.statusText
      );
    }
    const data = await response.json();
    if (data.tag !== 'payRequest') {
      throw new Error(
        "Invalid LNURL tag: expected 'payRequest', got '" + data.tag + "'"
      );
    }
    if (!data.callback) {
      throw new Error('LNURL response missing callback URL');
    }
    if (
      typeof data.minSendable !== 'number' ||
      typeof data.maxSendable !== 'number'
    ) {
      throw new Error('LNURL response missing min/max sendable amounts');
    }
    return {
      callback: data.callback,
      minSendable: data.minSendable, // millisatoshis
      maxSendable: data.maxSendable, // millisatoshis
      metadata: data.metadata,
      commentAllowed: data.commentAllowed || 0,
    };
  }

  /**
   * Request an invoice from an LNURL-pay callback.
   * @param {string} callbackUrl
   * @param {number} amountMsats
   * @param {string} [comment]
   * @param {Function} [injectedFetch]
   * @returns {Promise<{paymentRequest:string, verify?:string}>}
   */
  async function requestInvoiceFromCallback(
    callbackUrl,
    amountMsats,
    comment,
    injectedFetch
  ) {
    const doFetch = getFetch(injectedFetch);
    const url = new URL(callbackUrl);
    url.searchParams.set('amount', String(amountMsats));
    if (comment) {
      url.searchParams.set('comment', comment);
    }
    const response = await doFetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(
        'LNURL callback returned ' + response.status + ': ' + response.statusText
      );
    }
    const data = await response.json();
    if (data.status === 'ERROR') {
      throw new Error('LNURL error: ' + (data.reason || 'Unknown error'));
    }
    if (!data.pr) {
      throw new Error('LNURL callback did not return a payment request');
    }
    return { paymentRequest: data.pr, verify: data.verify };
  }

  /**
   * Complete flow: resolve a Lightning address -> metadata -> invoice.
   * Spark/Blink always receive in sats; `amountSats` is the donation amount.
   * @param {string} lightningAddress - e.g. "alice@blink.sv"
   * @param {number} amountSats
   * @param {string} [memo]
   * @param {Function} [injectedFetch]
   * @returns {Promise<{paymentRequest:string, verifyUrl?:string}>}
   */
  async function getInvoiceFromLightningAddress(
    lightningAddress,
    amountSats,
    memo,
    injectedFetch
  ) {
    if (!isBlinkLightningAddress(lightningAddress)) {
      throw new Error(
        "'" + lightningAddress + "' is not a Blink address. Only " +
          ALLOWED_BLINK_DOMAINS[0] + ' addresses are supported.'
      );
    }
    const parsed = parseLightningAddress(lightningAddress);
    const lnurlData = await fetchLnurlPayMetadata(
      parsed.lnurlEndpoint,
      injectedFetch
    );

    const amountMsats = Math.round(amountSats) * 1000;
    if (amountMsats < lnurlData.minSendable) {
      throw new Error(
        'Amount ' + amountSats + ' sats is below minimum ' +
          Math.ceil(lnurlData.minSendable / 1000) + ' sats'
      );
    }
    if (amountMsats > lnurlData.maxSendable) {
      throw new Error(
        'Amount ' + amountSats + ' sats exceeds maximum ' +
          Math.floor(lnurlData.maxSendable / 1000) + ' sats'
      );
    }

    let comment = memo || '';
    if (lnurlData.commentAllowed > 0 && comment.length > lnurlData.commentAllowed) {
      comment = comment.substring(0, lnurlData.commentAllowed);
    } else if (lnurlData.commentAllowed === 0) {
      comment = '';
    }

    const invoice = await requestInvoiceFromCallback(
      lnurlData.callback,
      amountMsats,
      comment,
      injectedFetch
    );
    return {
      paymentRequest: invoice.paymentRequest,
      verifyUrl: invoice.verify,
    };
  }

  /**
   * Poll a LUD-21 verify URL to check whether an invoice has been paid.
   *
   * Self-custodial (Spark) note: the verify endpoint is populated by the Spark
   * SSP webhook server-side (no synchronous status pull), so `settled` only
   * flips to true once that webhook lands. Polling tolerates the lag.
   * @param {string} verifyUrl
   * @param {Function} [injectedFetch]
   * @returns {Promise<{settled:boolean, preimage?:string, pr?:string}>}
   */
  async function verifyLnurlPayment(verifyUrl, injectedFetch) {
    const doFetch = getFetch(injectedFetch);
    const response = await doFetch(verifyUrl, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(
        'LNURL verify returned ' + response.status + ': ' + response.statusText
      );
    }
    const data = await response.json();
    if (data.status === 'ERROR') {
      throw new Error('LNURL verify error: ' + (data.reason || 'Unknown error'));
    }
    return {
      settled: data.settled === true,
      preimage: data.preimage == null ? undefined : data.preimage,
      pr: data.pr,
    };
  }

  return {
    ALLOWED_BLINK_DOMAINS: ALLOWED_BLINK_DOMAINS,
    parseLightningAddress: parseLightningAddress,
    isBlinkLightningAddress: isBlinkLightningAddress,
    normalizeBlinkLightningAddress: normalizeBlinkLightningAddress,
    fetchLnurlPayMetadata: fetchLnurlPayMetadata,
    requestInvoiceFromCallback: requestInvoiceFromCallback,
    getInvoiceFromLightningAddress: getInvoiceFromLightningAddress,
    verifyLnurlPayment: verifyLnurlPayment,
  };
});
