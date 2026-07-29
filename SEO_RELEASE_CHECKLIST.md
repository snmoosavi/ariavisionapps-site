# SEO Release Checklist

Date: 2026-07-29

- [x] Static generation completed.
- [x] App pages regenerated.
- [x] Category pages regenerated.
- [x] sitemap.xml regenerated with canonical URLs.
- [x] robots.txt allows crawlers and points to sitemap.xml.
- [x] 404.html exists at the project root.
- [x] Old URLs are covered by 301 redirects in _redirects.
- [x] SEO audit passes with zero errors and zero warnings.
- [x] Route audit passes for valid routes, redirects, and invalid routes.
- [x] JavaScript and Node scripts pass syntax checks.
- [x] Browser QA passes for desktop and mobile key routes without horizontal overflow, visible broken images, or console errors.
- [x] Homepage search and Developer tools filter work after category cleanup.
- [x] No backend, database, cookies, analytics, tracking, or paid external services were added.

## Validation Results

Build/static generation: PASS - 32 app pages and 10 category pages regenerated with scripts/apply-seo-model.mjs.
Test: PASS - Route audit passed: 46 valid routes, 2 redirects, 3 invalid routes..
Lint/static validation: PASS - node --check passed for js/main.js, scripts/apply-seo-model.mjs, scripts/seo-audit.mjs, and scripts/route-audit.mjs.
SEO audit: PASS - SEO audit: 46 public pages, 32 app pages, 10 category pages. Errors: 0 Warnings: 0
Browser QA: PASS - homepage, app pages, Developer tools category, privacy, redirects, and 404 checked at desktop and mobile widths.

## Owner Follow-Up

- Keep app-data.json updated when Microsoft Store listings change.
- Add verified version, pricing, trial, and release-note data only when available from a reliable source.
