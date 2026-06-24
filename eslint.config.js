import js from '@eslint/js';
import globals from 'globals';

/**
 * Flat ESLint config for the donation-button widget.
 *
 * Three environments:
 *   - js/**          browser source served as-is (IIFE / UMD; no build step).
 *   - tests/**       Vitest + jsdom (Node + browser-ish globals).
 *   - *.config.js    Node ESM tooling config.
 *
 * Kept intentionally light: this is a dormant, single-file-embed codebase, so the
 * goal is to catch real bugs (undefined vars, unused code) without forcing a large
 * stylistic churn on the ~2.6k-LOC widget. Formatting is delegated to Prettier.
 */
export default [
    {
        ignores: ['node_modules/**', 'coverage/**'],
    },
    js.configs.recommended,
    {
        // Browser source. UMD module (blink-lnurl.js) also touches CommonJS globals.
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                define: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { args: 'none' }],
            'no-empty': ['warn', { allowEmptyCatch: true }],
        },
    },
    {
        // Test suite.
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
    },
    {
        // ESM tooling config files.
        files: ['*.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
    },
];
