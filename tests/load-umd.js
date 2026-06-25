/**
 * Test helper: load a UMD file (like js/blink-lnurl.js) and return its exports.
 *
 * The widget ships its helpers as a single-file UMD (browser <script> +
 * module.exports), and package.json sets "type": "module", which makes a bare
 * `require('../js/foo.js')` treat the file as ESM (returning an empty namespace).
 * To exercise the exact CommonJS export path the file declares, we evaluate it
 * in a minimal module sandbox.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export function loadUmd(relativePath) {
  const src = readFileSync(resolve(here, relativePath), 'utf8');
  const moduleObj = { exports: {} };
  const run = new Function('module', 'exports', 'globalThis', src);
  run(moduleObj, moduleObj.exports, globalThis);
  return moduleObj.exports;
}
