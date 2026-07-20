/**
 * Regression test for the deep-link bootstrap firing reliably.
 *
 * Bug: js/generator.js is loaded via a plain <script> at the end of <body>
 * (no `defer`) and can also be reached through the 404.html ->
 * location.replace('/') deep-link redirect. In that redirect/bfcache path the
 * DOM is often already fully parsed when generator.js runs, so
 * `DOMContentLoaded` has ALREADY fired. The old code registered its init only
 * via addEventListener('DOMContentLoaded', ...), which then never ran — the
 * deep-link username was silently swallowed and the visitor landed on the
 * plain generator.
 *
 * Fix: guard on document.readyState and call initGenerator() immediately when
 * the DOM is already available.
 *
 * These tests execute the real browser code path of generator.js against jsdom
 * and assert the deep-link username is prefilled (a synchronous side effect at
 * the very start of the bootstrap, before the async existence check), proving
 * initGenerator() actually ran.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const generatorSrc = readFileSync(resolve(here, '../js/generator.js'), 'utf8');

// Minimal DOM matching the ids/structure initGenerator() queries. Missing
// elements would make initGenerator throw before the deep-link bootstrap.
const GENERATOR_DOM = `
    <button id="theme-toggle"></button>
    <img id="header-logo" />
    <input id="blinkUsername" />
    <button id="generateBtn"></button>
    <input id="currencyInput" />
    <div id="currencyValidation"></div>
    <select id="languageSelect"></select>
    <input id="buttonWidth" />
    <div class="mode-options">
        <label><input type="radio" name="widget-theme" value="light" checked></label>
        <label><input type="radio" name="widget-theme" value="dark"></label>
    </div>
    <div id="result-container" style="display: none;">
        <pre id="generatedCode"></pre>
        <button id="copyBtn"></button>
        <div id="widget-preview"></div>
    </div>
`;

function setReadyState(value) {
    // jsdom's document.readyState is a getter; override it for the test.
    Object.defineProperty(document, 'readyState', {
        configurable: true,
        get: () => value,
    });
}

function runGenerator() {
    // Execute the browser path exactly as a <script> tag would. `module` is
    // undefined inside new Function(), so the UMD export branch is skipped —
    // we only care about the DOM side effects here.
    new Function(generatorSrc)();
}

beforeEach(() => {
    document.body.innerHTML = GENERATOR_DOM;
    try {
        window.sessionStorage.clear();
    } catch {
        /* ignore */
    }

    // Make the async existence check deterministic and non-networked. The
    // deep-link prefill we assert on happens BEFORE this resolves, but we stub
    // it so no real fetch is attempted and no unhandled rejection occurs.
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
            ok: true,
            status: 200,
            json: async () => ({ data: { usernameAvailable: false } }),
        }))
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
    // Restore a sane readyState for other tests.
    setReadyState('complete');
});

describe('deep-link bootstrap: DOMContentLoaded already fired', () => {
    it('runs initGenerator immediately when readyState is "complete" (redirect/bfcache path)', () => {
        setReadyState('complete');
        window.sessionStorage.setItem('blinkRedirectUsername', 'pretyflaco');

        runGenerator();

        // initGenerator ran synchronously -> deep-link username prefilled.
        expect(document.getElementById('blinkUsername').value).toBe('pretyflaco');
        // And the one-time handoff was consumed so a manual reload won't repeat.
        expect(window.sessionStorage.getItem('blinkRedirectUsername')).toBeNull();
    });

    it('also runs when readyState is "interactive"', () => {
        setReadyState('interactive');
        window.sessionStorage.setItem('blinkRedirectUsername', 'satoshi');

        runGenerator();

        expect(document.getElementById('blinkUsername').value).toBe('satoshi');
    });

    it('does nothing to the input when there is no deep-link username', () => {
        setReadyState('complete');
        // no sessionStorage, path is "/"
        runGenerator();

        expect(document.getElementById('blinkUsername').value).toBe('');
    });
});

describe('deep-link bootstrap: DOMContentLoaded not yet fired', () => {
    it('defers init until DOMContentLoaded when readyState is "loading"', () => {
        setReadyState('loading');
        window.sessionStorage.setItem('blinkRedirectUsername', 'pretyflaco');

        runGenerator();

        // Still "loading" -> init deferred, input untouched so far.
        expect(document.getElementById('blinkUsername').value).toBe('');

        // Now the DOM finishes parsing and fires the event.
        setReadyState('complete');
        document.dispatchEvent(new window.Event('DOMContentLoaded'));

        expect(document.getElementById('blinkUsername').value).toBe('pretyflaco');
    });
});
