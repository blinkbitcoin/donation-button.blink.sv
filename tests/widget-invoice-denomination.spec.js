/**
 * Tests for the unit a donation invoice is denominated in (1.5.3).
 *
 * A recipient's default wallet is either BTC or USD, and the donor picks their
 * own display currency. Those two choices decide which on-behalf-of mutation is
 * used and what `amount` means:
 *
 *   wallet BTC + any donor currency  -> lnInvoiceCreateOnBehalfOfRecipient (sats)
 *   wallet USD + fiat donor currency -> lnUsdInvoiceCreateOnBehalfOfRecipient (cents)
 *   wallet USD + sats donor currency -> lnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipient (sats)
 *
 * The last row is the 1.5.3 fix. Sats used to be converted to USD cents, which
 * rounds to a whole cent (~13 sats at current rates) and then has Blink price
 * those cents back into sats at the stablesats dealer spread — a donor entering
 * 1000 sats was asked for ~1007. Guarded here so it cannot silently come back.
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
    // 1 sat = 0.05 USD cents (=> ~50,000 USD/BTC); EUR slightly different.
    widget.exchangeRates = {
        USD: { satPriceInCurrency: 0.05, usdCentPriceInCurrency: 1 },
        EUR: { satPriceInCurrency: 0.045, usdCentPriceInCurrency: 0.9 },
    };
});

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    delete global.ResizeObserver;
    delete window.ResizeObserver;
});

/**
 * Drive handleDonate with a stubbed wallet lookup and capture the createInvoice
 * call, without touching the network or the invoice/QR UI.
 */
async function donate({ walletCurrency, donorCurrency, amount }) {
    widget.getAccountDefaultWallet = vi.fn(() =>
        Promise.resolve({ id: 'wallet-1', currency: walletCurrency })
    );
    widget.fetchExchangeRate = vi.fn(() => Promise.resolve());
    widget.createInvoice = vi.fn(() =>
        Promise.resolve({ paymentRequest: 'lnbc1fake', expiryMinutes: 5 })
    );
    widget.displayInvoice = vi.fn();
    widget.subscribeToPaymentStatus = vi.fn();

    widget.selectedCurrency = donorCurrency;
    document.getElementById('blink-pay-amount').value = String(amount);

    await widget.handleDonate();
    return widget.createInvoice.mock.calls[0];
}

describe('handleDonate: invoice denomination', () => {
    it('keeps a sats donation in sats for a USD wallet (no cent conversion)', async () => {
        const [walletId, invoiceAmount, walletCurrency, unit] = await donate({
            walletCurrency: 'USD',
            donorCurrency: 'sats',
            amount: 1000,
        });

        expect(walletId).toBe('wallet-1');
        expect(invoiceAmount).toBe(1000); // exact: NOT 78 cents -> ~1007 sats
        expect(walletCurrency).toBe('USD');
        expect(unit).toBe('sats');
    });

    it('does not look up an exchange rate for a sats donation to a USD wallet', async () => {
        widget.exchangeRates = {}; // no cached rates at all
        await donate({ walletCurrency: 'USD', donorCurrency: 'sats', amount: 1000 });

        expect(widget.fetchExchangeRate).not.toHaveBeenCalled();
    });

    it('still converts a fiat donation to USD cents for a USD wallet', async () => {
        const [, invoiceAmount, walletCurrency, unit] = await donate({
            walletCurrency: 'USD',
            donorCurrency: 'EUR',
            amount: 10,
        });

        // 10 EUR = 1000 minor units; 1000 / 0.9 = 1111.1 -> 1111 USD cents
        expect(invoiceAmount).toBe(1111);
        expect(walletCurrency).toBe('USD');
        expect(unit).toBe('cents');
    });

    it('passes sats straight through for a BTC wallet', async () => {
        const [, invoiceAmount, walletCurrency, unit] = await donate({
            walletCurrency: 'BTC',
            donorCurrency: 'sats',
            amount: 2500,
        });

        expect(invoiceAmount).toBe(2500);
        expect(walletCurrency).toBe('BTC');
        expect(unit).toBe('sats');
    });

    it('converts a fiat donation to sats for a BTC wallet', async () => {
        const [, invoiceAmount, walletCurrency, unit] = await donate({
            walletCurrency: 'BTC',
            donorCurrency: 'USD',
            amount: 1,
        });

        // 1 USD = 100 cents; 100 / 0.05 = 2000 sats
        expect(invoiceAmount).toBe(2000);
        expect(walletCurrency).toBe('BTC');
        expect(unit).toBe('sats');
    });
});

describe('createInvoice: mutation selection', () => {
    function stubInvoiceApi(mutationName) {
        const fetchMock = vi.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve({
                        data: {
                            [mutationName]: {
                                invoice: { paymentRequest: 'lnbc1fake', satoshis: 1000 },
                            },
                        },
                    }),
            })
        );
        vi.stubGlobal('fetch', fetchMock);
        return fetchMock;
    }

    function sentBody(fetchMock) {
        return JSON.parse(fetchMock.mock.calls[0][1].body);
    }

    it('USD wallet + sats uses the BTC-denominated mutation with the exact sats', async () => {
        const fetchMock = stubInvoiceApi('lnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipient');

        const result = await widget.createInvoice('wallet-1', 1000, 'USD', 'sats');

        const body = sentBody(fetchMock);
        expect(body.query).toContain('lnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipient');
        expect(body.query).toContain(
            '$input: LnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipientInput!'
        );
        expect(body.variables.input).toEqual({
            amount: '1000',
            recipientWalletId: 'wallet-1',
            memo: 'alice donate button',
            expiresIn: '5',
        });
        expect(result.expiryMinutes).toBe(5);
    });

    it('USD wallet + cents uses the USD cent mutation', async () => {
        const fetchMock = stubInvoiceApi('lnUsdInvoiceCreateOnBehalfOfRecipient');

        const result = await widget.createInvoice('wallet-1', 250, 'USD', 'cents');

        const body = sentBody(fetchMock);
        expect(body.query).toContain('lnUsdInvoiceCreateOnBehalfOfRecipient');
        expect(body.query).not.toContain('BtcDenominated');
        expect(body.variables.input.amount).toBe('250');
        expect(body.variables.input.expiresIn).toBe('5');
        expect(result.expiryMinutes).toBe(5);
    });

    it('BTC wallet uses the sats mutation with a 15 minute expiry', async () => {
        const fetchMock = stubInvoiceApi('lnInvoiceCreateOnBehalfOfRecipient');

        const result = await widget.createInvoice('wallet-1', 2500, 'BTC', 'sats');

        const body = sentBody(fetchMock);
        expect(body.query).toContain('lnInvoiceCreateOnBehalfOfRecipient');
        expect(body.variables.input.amount).toBe('2500');
        expect(body.variables.input.expiresIn).toBe('15');
        expect(result.expiryMinutes).toBe(15);
    });

    it('omitting amountUnit keeps the historical behaviour', async () => {
        const usdFetch = stubInvoiceApi('lnUsdInvoiceCreateOnBehalfOfRecipient');
        await widget.createInvoice('wallet-1', 250, 'USD');
        expect(sentBody(usdFetch).query).toContain('lnUsdInvoiceCreateOnBehalfOfRecipient');
        expect(sentBody(usdFetch).query).not.toContain('BtcDenominated');

        const btcFetch = stubInvoiceApi('lnInvoiceCreateOnBehalfOfRecipient');
        await widget.createInvoice('wallet-1', 2500, 'BTC');
        expect(sentBody(btcFetch).query).toContain('lnInvoiceCreateOnBehalfOfRecipient');
    });

    it('rejects an unsupported wallet currency', async () => {
        await expect(widget.createInvoice('wallet-1', 1, 'DOGE', 'sats')).rejects.toThrow(
            /Unsupported currency/i
        );
    });
});
