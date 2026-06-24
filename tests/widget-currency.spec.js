/**
 * Characterization tests for the widget's currency math in
 * js/blink-pay-button.js (convertToSatoshis / convertToUsdCents).
 *
 * These functions had NO coverage before. They are pure given a populated
 * `this.exchangeRates` cache, so we exercise them directly on the loaded
 * BlinkPayButton object with a stubbed exchange-rate cache and a no-op logger.
 *
 * Purpose: lock in the CURRENT observable behaviour (including rounding) so the
 * planned monolith refactor cannot silently change donation amounts. If a future
 * change intends to alter this math, these tests must be updated deliberately.
 *
 * The Blink rate model used here:
 *   - satPriceInCurrency      = price of 1 sat, in the currency's MINOR units.
 *   - usdCentPriceInCurrency  = price of 1 USD cent, in the currency's MINOR units.
 * Fiat major units are converted to minor units (×100) before dividing.
 */
import { describe, it, expect, beforeEach } from 'vitest';
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
    // Rates: 1 sat = 0.05 USD cents (=> ~50,000 USD/BTC); EUR slightly different.
    widget.exchangeRates = {
        USD: { satPriceInCurrency: 0.05, usdCentPriceInCurrency: 1 },
        EUR: { satPriceInCurrency: 0.045, usdCentPriceInCurrency: 0.9 },
    };
});

describe('convertToSatoshis', () => {
    it('returns the amount unchanged when already in sats', () => {
        expect(widget.convertToSatoshis(1234, 'sats')).toBe(1234);
    });

    it('converts a fiat major amount to sats and rounds', () => {
        // 1 USD = 100 cents; 100 / 0.05 = 2000 sats
        expect(widget.convertToSatoshis(1, 'USD')).toBe(2000);
        // 10 EUR = 1000 cents; 1000 / 0.045 = 22222.2 -> 22222
        expect(widget.convertToSatoshis(10, 'EUR')).toBe(22222);
    });

    it('rounds to the nearest sat (half-up via Math.round)', () => {
        // 0.01 USD = 1 cent; 1 / 0.05 = 20 sats exactly
        expect(widget.convertToSatoshis(0.01, 'USD')).toBe(20);
    });

    it('throws when no exchange rate is cached for the currency', () => {
        expect(() => widget.convertToSatoshis(1, 'GBP')).toThrow(/exchange rate not available/i);
    });

    it('throws when the cached rate lacks satPriceInCurrency', () => {
        widget.exchangeRates.JPY = { usdCentPriceInCurrency: 1 };
        expect(() => widget.convertToSatoshis(1, 'JPY')).toThrow(/exchange rate not available/i);
    });
});

describe('convertToUsdCents', () => {
    it('converts sats to USD cents using the USD rate', () => {
        // 2000 sats * 0.05 cents/sat = 100 cents
        expect(widget.convertToUsdCents(2000, 'sats')).toBe(100);
    });

    it('throws converting sats when USD rate is missing', () => {
        delete widget.exchangeRates.USD;
        expect(() => widget.convertToUsdCents(2000, 'sats')).toThrow(
            /USD exchange rate not available/i
        );
    });

    it('converts a fiat major amount to USD cents and rounds', () => {
        // 1 USD = 100 cents; 100 / 1 = 100 USD cents
        expect(widget.convertToUsdCents(1, 'USD')).toBe(100);
        // 10 EUR = 1000 minor; 1000 / 0.9 = 1111.1 -> 1111 USD cents
        expect(widget.convertToUsdCents(10, 'EUR')).toBe(1111);
    });

    it('throws when no usdCentPriceInCurrency is cached for the fiat currency', () => {
        widget.exchangeRates.GBP = { satPriceInCurrency: 0.05 };
        expect(() => widget.convertToUsdCents(1, 'GBP')).toThrow(/exchange rate not available/i);
    });
});
