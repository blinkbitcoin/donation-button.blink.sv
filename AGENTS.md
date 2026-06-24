# AGENTS.md

Guidance for AI agents and contributors working in this repository.

## Project overview

`donation-button.blink.sv` is a lightweight, embeddable Bitcoin Lightning donation
widget for [Blink](https://blink.sv/). It is:

- **Vanilla JavaScript, no build step** — the source files are served as-is.
- **No backend** — the browser talks directly to Blink's APIs.
- **GitHub-Pages hosted** — `main` auto-deploys to production.
- **AGPL-3.0 licensed.**

The repo also contains a **generator** (`index.html` + `js/generator.js`) that produces
the embed snippet for a given Blink username.

## Critical guardrails (read before changing anything)

**Live blast radius:** every embed in the wild loads ONE file —
`https://blinkbitcoin.github.io/donation-button.blink.sv/js/blink-pay-button.js` — and
calls `BlinkPayButton.init({...})`. Embeds are **not version-pinned**, so **merging to
`main` redeploys to ALL live sites** via GitHub Pages.

- **Never change the public API** (`BlinkPayButton.init`, its config options, the
  container-id contract, success/QR DOM behavior) without a deliberate, separately
  reviewed decision.
- **Keep the single-file embed working** — no new required `<script>` tags, and no build
  step that changes the served path.
- **Each change = its own small PR**, with `npm test` green and (for payment-path changes)
  a manual smoke via the `*-test.html` pages.
- **Tests first:** add a characterization test before refactoring a behavior.

## Architecture / key files

- `js/blink-pay-button.js` (~2.6k LOC) — the widget. A single IIFE assigning
  `window.BlinkPayButton`. Custodial-first flow with a self-custodial (Spark) LNURL-pay
  fallback. The version header is at the top of the file (`Version: ...`).
- `js/blink-lnurl.js` (~300 LOC) — canonical UMD module: LNURL-pay (LUD-16) +
  LUD-21 verify helpers (`parse` / `metadata` / `invoice` / `verify`). `fetch` is injected
  (last arg) so it is unit-testable. blink.sv-only.
  - The widget carries a **behavior-identical inline copy** of these helpers
    (`BlinkPayButton.getLnurl()`) so single-file embeds work without loading this module.
    **Parity between the two is enforced by tests** — if you change one, change both.
- `js/generator.js` (~580 LOC) — generator UI logic for `index.html`.
- `tests/` — Vitest + jsdom specs (`blink-lnurl.spec.js`, `widget-spark.spec.js`,
  `load-umd.js` helper).
- `.github/workflows/test.yml` — CI: runs `npm ci && npm test` on PRs/pushes to `main`.
- `*-test.html` (root) — manual smoke/test pages (e.g. `spark-test.html`,
  `responsive-test.html`, `widget-width-test.html`).
- `css-cleanup-strategy.md` — plan for reducing `!important` usage in the embedded CSS.

## Payment flow (high level)

1. **Custodial-first:** GraphQL `accountDefaultWallet(username)` returns a wallet `id` ⇒
   create an on-behalf-of invoice; detect settlement via WebSocket
   (`wss://ws.blink.sv/graphql`), with a GraphQL poll fallback.
2. **Self-custodial (Spark) fallback:** no custodial wallet ⇒ resolve the bare
   `username@blink.sv` via LNURL-pay (`GET https://blink.sv/.well-known/lnurlp/{username}`),
   request an invoice from the advertised callback, and detect settlement by polling the
   LUD-21 `verify` URL.

Endpoints called directly from the browser: `api.blink.sv/graphql`,
`wss://ws.blink.sv/graphql`, `blink.sv/.well-known/lnurlp/...`, and `api.qrserver.com`
(QR rendering). Only **blink.sv** Lightning addresses are supported.

## Commands

```bash
npm install        # install dev deps (Vitest + jsdom)
npm test           # vitest run (CI uses this)
npm run test:watch # vitest watch
```

Manual end-to-end testing: open `spark-test.html` (Spark fallback) or the other
`*-test.html` pages in a browser. Payment-path changes should be validated with a real
small donation when possible.

## Conventions

- 4-space indentation in `js/`.
- Logging is debug-gated: route messages through the widget's `this.log` (enabled by the
  `debug: true` init option). Avoid raw `console.*` that fires regardless of `debug`.
- Keep helpers pure and `fetch`-injectable so they unit-test without globals.
- blink.sv-only: reject explicit non-Blink Lightning-address domains.

## PR mechanics

- `origin = blinkbitcoin/donation-button.blink.sv` (no fork). Branch off `main`, PR into
  `main`.
- Bump the version header in `js/blink-pay-button.js` (and the analytics `widget_version`)
  for behavior changes.
- `npm test` (and lint, once configured) must be green.
- AGPL-3.0 — no license changes.

## Environment gotcha

A local `~/.npmrc` setting `min-release-age` can break `npm install` (the version is
mis-converted into a bogus `before` date → `ETARGET`/`ENOVERSIONS`, every version filtered
out). Work around per-command without touching the global config:

```bash
npm install --before= --min-release-age=0
```

CI runs on a clean runner, so `npm ci` is unaffected.

## Local-only docs

`button_spark_plan.md` and `button_cleanup_plan.md` are working plans and are
**gitignored** (not published). The cleanup backlog is intended to be worked **after** the
self-custodial (Spark) PR merges, since that PR adds the repo's first tests + CI (the
refactor safety net).
