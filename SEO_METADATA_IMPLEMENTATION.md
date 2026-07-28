# SEO Metadata Implementation

Generated on 2026-07-28.

## Metadata generation structure

Metadata is maintained in `data/apps-seo.json` and rendered into static HTML by `scripts/apply-seo-model.mjs`. The rendered pages remain plain HTML and do not require a backend or build service on Cloudflare Pages.

## Implemented tags

- One unique `<title>` per public page.
- One unique meta description per public page.
- One canonical URL per public page using clean HTTPS URLs with trailing slashes.
- `<meta name="robots" content="index, follow">` on public pages.
- Open Graph: `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:site_name`, `og:locale`.
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- One visible H1 per public page.
- Breadcrumb titles now come from the same app/category model.

## Example app page

- URL: https://ariavisionapps.com/apps/trading-journal-pro/
- Title: Trading Journal Pro - Plan Trades and Review Risk for Windows | Aria Vision
- Description: Plan trades, manage risk, record setups, and review performance in a focused Windows trading journal with reports, screenshots, and guardrails.
- H1: Trading Journal Pro
- Canonical: https://ariavisionapps.com/apps/trading-journal-pro/
- Open Graph image: https://ariavisionapps.com/apps/trading-journal-pro/screenshots/screenshot-1.jpg

## Title and description rules

- Titles include the app name, a short human-readable Windows benefit, and Aria Vision where length allows.
- Descriptions describe the real app workflow and avoid fake claims, ratings, prices, or exaggerated superlatives.
- Metadata values are unique across app pages and category pages.
- Meta keywords are intentionally not used.

## Files changed for metadata

- `index.html`
- `privacy/index.html`
- `apps/*/index.html`
- `apps/subtitle-generator-pro/privacy/index.html`
- `apps/subtitle-generator-pro/support/index.html`
- `categories/*/index.html`
- `data/apps-seo.json`
- `scripts/apply-seo-model.mjs`
- `scripts/seo-audit.mjs`

## Testing

Run these local checks with Node:

`node --check js/main.js`
`node --check scripts/seo-audit.mjs`
`node --check scripts/apply-seo-model.mjs`
`node scripts/seo-audit.mjs`

The audit checks that each public page has one title, one description, one canonical, one H1, valid JSON-LD, crawlable internal links, and sitemap coverage.
