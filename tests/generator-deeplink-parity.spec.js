/**
 * Parity test: the username path parser is intentionally DUPLICATED between
 *   - js/generator.js  (modern JS, exported + unit-tested)
 *   - 404.html         (inline ES5, dependency-free, runs before render)
 *
 * The duplication is deliberate: 404.html must not load a module on GitHub
 * Pages (no build step, must run before render). The tradeoff is drift risk —
 * if the validation rules change in one place but not the other, deep links
 * would behave differently depending on whether the visitor hit the 404 bounce
 * or landed on "/" directly.
 *
 * This spec extracts the inline parseUsernameFromPath() from 404.html, runs it
 * side-by-side with the js/generator.js implementation over a shared fixture
 * table, and fails CI if they ever disagree. Mirrors the parity-enforcement
 * approach AGENTS.md describes for the widget's inline LNURL copy.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadUmd } from './load-umd.js';

const here = dirname(fileURLToPath(import.meta.url));

// The exported (module) implementation.
const { parseUsernameFromPath: moduleParse } = loadUmd('../js/generator.js');

/**
 * Extract the inline `function parseUsernameFromPath(pathname) { ... }` from
 * 404.html and turn it into a callable function. The closing brace is matched
 * at the source's 12-space indentation (the function is nested inside an IIFE
 * inside a <script>), which is shallower than any brace in its body.
 */
function loadInline404Parser() {
    const html = readFileSync(resolve(here, '../404.html'), 'utf8');
    const match = html.match(
        /function parseUsernameFromPath\(pathname\)\s*\{[\s\S]*?\n {12}\}/
    );
    if (!match) {
        throw new Error(
            'Could not locate parseUsernameFromPath() in 404.html — did the ' +
            'function definition or its indentation change?'
        );
    }
    // eslint-disable-next-line no-new-func
    const factory = new Function(match[0] + '\nreturn parseUsernameFromPath;');
    return factory();
}

const inlineParse = loadInline404Parser();

// Shared fixture table covering the meaningful branches of the parser.
const CASES = [
    '/pretyflaco',
    'pretyflaco',
    '/pretyflaco/',
    '/satoshi_21',
    '/prety%66laco',   // percent-encoded 'f'
    '/pretyflaco%20',  // decodes to a trailing space -> invalid
    '/',
    '',
    '/foo/bar',
    '/index.html',
    '/favicon.ico',
    '/robots.txt',
    '/blink-pay-button.js',
    '/index',
    '/img',
    '/js',
    '/css',
    '/tests',
    '/404',
    '/CNAME',
    '/hello world',
    '/alice@blink.sv',
    '/foo?bar',
    '/' + 'a'.repeat(50),
    '/' + 'a'.repeat(51),
    '/UPPER',
    '/_leading_underscore',
];

describe('parseUsernameFromPath parity: js/generator.js vs 404.html', () => {
    it('extracts an inline parser from 404.html', () => {
        expect(typeof inlineParse).toBe('function');
        // Sanity: the extracted parser actually works.
        expect(inlineParse('/pretyflaco')).toBe('pretyflaco');
    });

    it.each(CASES)('agrees on %j', (input) => {
        // Normalize undefined/null to a comparable form; both should return the
        // same string-or-null for every input.
        const a = moduleParse(input);
        const b = inlineParse(input);
        expect(b).toBe(a);
    });

    it('agrees on non-string inputs', () => {
        for (const bad of [null, undefined, 42, {}, []]) {
            expect(inlineParse(bad)).toBe(moduleParse(bad));
        }
    });
});
