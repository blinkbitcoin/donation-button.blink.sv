/**
 * Tests for the username deep-link helpers in js/generator.js.
 *
 * The generator supports username-customized URLs (e.g.
 * https://donation-button.blink.sv/pretyflaco) so external surfaces like the
 * Blink app's "Ways to get paid" section can link straight to a pre-generated
 * donation button. 404.html captures the path and hands the username to the
 * generator via sessionStorage; these helpers turn a raw path into a candidate
 * username and resolve the deep-link username for a page load.
 *
 * generator.js is a plain browser script (not UMD), but it exports its pure
 * helpers via `module.exports` and guards its DOM wiring behind
 * `typeof document`. We load it through the same sandbox helper used for the
 * UMD modules so we can exercise the helpers without a real DOM.
 */
import { describe, it, expect } from 'vitest';
import { loadUmd } from './load-umd.js';

const { parseUsernameFromPath, resolveDeepLinkUsername } = loadUmd('../js/generator.js');

describe('parseUsernameFromPath', () => {
    it('extracts a plain single-segment username', () => {
        expect(parseUsernameFromPath('/pretyflaco')).toBe('pretyflaco');
    });

    it('handles a segment without a leading slash', () => {
        expect(parseUsernameFromPath('pretyflaco')).toBe('pretyflaco');
    });

    it('tolerates a trailing slash', () => {
        expect(parseUsernameFromPath('/pretyflaco/')).toBe('pretyflaco');
    });

    it('allows underscores and digits', () => {
        expect(parseUsernameFromPath('/satoshi_21')).toBe('satoshi_21');
    });

    it('decodes percent-encoded segments', () => {
        expect(parseUsernameFromPath('/pretyflaco%20')).toBeNull(); // space -> invalid char
        expect(parseUsernameFromPath('/prety%66laco')).toBe('pretyflaco'); // %66 = 'f'
    });

    it('returns null for the root path', () => {
        expect(parseUsernameFromPath('/')).toBeNull();
        expect(parseUsernameFromPath('')).toBeNull();
    });

    it('returns null for nested paths', () => {
        expect(parseUsernameFromPath('/foo/bar')).toBeNull();
    });

    it('returns null for file-like segments (has an extension)', () => {
        expect(parseUsernameFromPath('/index.html')).toBeNull();
        expect(parseUsernameFromPath('/favicon.ico')).toBeNull();
        expect(parseUsernameFromPath('/robots.txt')).toBeNull();
        expect(parseUsernameFromPath('/blink-pay-button.js')).toBeNull();
    });

    it('returns null for reserved site paths', () => {
        for (const p of ['/index', '/img', '/js', '/css', '/tests', '/404', '/CNAME']) {
            expect(parseUsernameFromPath(p)).toBeNull();
        }
    });

    it('returns null for segments with invalid characters', () => {
        expect(parseUsernameFromPath('/hello world')).toBeNull();
        expect(parseUsernameFromPath('/alice@blink.sv')).toBeNull();
        expect(parseUsernameFromPath('/foo?bar')).toBeNull();
    });

    it('returns null for non-string input', () => {
        expect(parseUsernameFromPath(null)).toBeNull();
        expect(parseUsernameFromPath(undefined)).toBeNull();
        expect(parseUsernameFromPath(42)).toBeNull();
    });

    it('rejects overly long segments (>50 chars)', () => {
        expect(parseUsernameFromPath('/' + 'a'.repeat(51))).toBeNull();
        expect(parseUsernameFromPath('/' + 'a'.repeat(50))).toBe('a'.repeat(50));
    });
});

describe('resolveDeepLinkUsername', () => {
    function makeWindow({ stored = null, pathname = '/' } = {}) {
        const store = {};
        if (stored !== null) store.blinkRedirectUsername = stored;
        return {
            location: { pathname },
            sessionStorage: {
                getItem: (k) => (k in store ? store[k] : null),
                setItem: (k, v) => { store[k] = String(v); },
                removeItem: (k) => { delete store[k]; },
                _store: store,
            },
        };
    }

    it('prefers a valid username stashed by 404.html and consumes it', () => {
        const win = makeWindow({ stored: 'pretyflaco', pathname: '/' });
        expect(resolveDeepLinkUsername(win)).toBe('pretyflaco');
        // Consumed once so a reload/re-run does not re-trigger.
        expect(win.sessionStorage.getItem('blinkRedirectUsername')).toBeNull();
    });

    it('falls back to location.pathname when nothing is stored', () => {
        const win = makeWindow({ pathname: '/satoshi' });
        expect(resolveDeepLinkUsername(win)).toBe('satoshi');
    });

    it('returns null when neither source yields a username', () => {
        const win = makeWindow({ pathname: '/' });
        expect(resolveDeepLinkUsername(win)).toBeNull();
    });

    it('ignores an invalid stored value and still clears it, then tries the path', () => {
        const win = makeWindow({ stored: 'bad name', pathname: '/goodname' });
        expect(resolveDeepLinkUsername(win)).toBe('goodname');
        expect(win.sessionStorage.getItem('blinkRedirectUsername')).toBeNull();
    });

    it('survives sessionStorage throwing (private mode / disabled)', () => {
        const win = {
            location: { pathname: '/satoshi' },
            sessionStorage: {
                getItem() { throw new Error('denied'); },
                setItem() { throw new Error('denied'); },
                removeItem() { throw new Error('denied'); },
            },
        };
        expect(resolveDeepLinkUsername(win)).toBe('satoshi');
    });

    it('returns null when no window is available', () => {
        expect(resolveDeepLinkUsername(undefined)).toBeNull();
    });
});
