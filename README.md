# Command Code — Models & Plans Matrix

A single-page comparison of every model and plan on [Command Code](https://commandcode.ai): price per 1M tokens, the real cost of an agent request, per-model credit ceilings, usage windows and value indexes.

**Live:** https://matriz-modelos-command-code.netlify.app

The page is available in **Portuguese and English** (toggle in the header), ships a dark theme by default with a light mode, and has no runtime dependencies beyond the Tailwind CDN and htmx.

## What the page answers

- Which model gives the most Intelligence per dollar, with and without a deal
- What **one typical agent request** costs across all 70 models
- How much of the GOAT monthly allowance each model consumes, and how many requests that buys
- What the free models are actually worth, compared against their closest benchmark neighbours
- Where the $70 ceilings are, and why most models stop at $20

## How the numbers are computed

| Metric | Formula |
|---|---|
| Cost per request | `800 input + 50,000 cache read + 160 output` (the agent profile documented by Command Code) |
| Cost per 1M (blend) | the same profile, normalised to 1M tokens |
| Value index | `Intelligence ÷ cost per 1M` |
| Balance (0–100) | geometric mean of intelligence (linear) and cheapness (log), both normalised — demands both ends |
| 5h / weekly windows | 20% and 50% of the model's monthly ceiling (proportions confirmed by the official numbers) |

**‡** marks estimated Intelligence. The plan table leaves some models unscored, but each model page publishes a newer version of the same index (Artificial Analysis v4.3). The offset of **5.6 points** was measured across **53 models** present in both scales (sd 1.4, range 2.0–8.1). Estimates take part in Intelligence sorting and in the IQ floor, but are kept out of the value and balance indexes, which require an official score.

## Project structure

```
index.html          page shell: static markup + data-i18n attributes (PT is the no-JS fallback)
src/
  data.js           the 70-model dataset (facts only)
  core.js           metrics, rankings, picks — pure, no DOM
  i18n/             pt.js · en.js dictionaries + t()/applyTranslations
  partials.js       (model, lang) → detail HTML fragment
  ui.js             rendering and interactions
  app.js            boot: theme, language, htmx wiring
build.mjs           generates /partials/<lang>/<slug>.html
tests/              node:test suite
partials/           generated — not versioned
```

## The detail panel (htmx)

Clicking a model name in the table or in a recommendation issues an
`hx-get="/partials/<lang>/<slug>.html"` and swaps the fragment into the detail panel.
The fragments are static files generated at build time from the same dataset that
feeds the table, so the panel and the matrix can never disagree. Two language
folders exist, so switching language also switches which fragment is fetched.

## Development (TDD)

Tests run on Node's built-in runner — no dependencies to install:

```bash
npm test          # 32 tests: dataset, metrics, i18n, partials, build, i18n coverage
npm run build     # writes partials/ (70 models × 2 languages)
npm run dev       # build + static server on :8000
```

The suite is the guard rail for the analysis itself:

- **dataset** — counts and spot values against the official table (70 models, 50 on GOAT, 6 deals, 3 free)
- **metrics** — cost per request, blend, balance bounds, ceiling bands, window proportions, Max 20× doubling
- **i18n** — key parity between languages, identical HTML tags and `{placeholders}`, interpolation, fallback
- **partials** — unique slugs, language switching, peak/deal pricing, no untranslated key leaking into HTML
- **coverage** — every dictionary key is used somewhere, and every `data-i18n` in the HTML exists in the dictionary

## Data sources

[commandcode.ai/docs](https://commandcode.ai/docs) — Pricing & Limits, the Go/GOAT/Pro/Max plan pages, the model catalogue and each model's own page. Reference date: **Sep 14, 2026**.

Prices and deals change often; the Studio usage page always reflects what is actually charged per request.

## Deploy

```bash
npm run build && netlify deploy --prod --dir=.
```
