# SEO Release Checklist

- [x] Build passed: static deploy file check passed; no build command required.
- [x] Tests passed: `scripts/seo-audit.mjs` completed with 0 errors.
- [x] Lint passed: JavaScript syntax checks passed for site JS and SEO scripts.
- [x] Sitemap accessible: `sitemap.xml` generated in project root with 46 canonical URLs.
- [x] robots.txt accessible: allows all crawlers and references sitemap.
- [x] Canonicals correct: one canonical per public page.
- [x] Metadata unique: titles and meta descriptions are unique across audited public pages.
- [x] One H1 per page: verified by audit.
- [x] Alt texts reviewed: no missing alt attributes; decorative images use empty alt.
- [x] Structured data valid: JSON-LD parses successfully.
- [x] Broken links checked: no broken internal links reported.
- [x] Mobile layout checked: homepage and app page checked at 390px viewport with no horizontal overflow.
- [x] Microsoft Store links checked: product IDs preserved and URLs use `gl=US` where present.
- [x] Analytics preserved: no analytics/tracking existed and none were added.
- [x] No test data visible: no visible placeholder/TODO content was added.
- [x] Deployment configuration reviewed: project remains plain static HTML/CSS/JS/XML/TXT plus local data/report/script files; no backend or runtime service added.

## Known non-blocking notes

- External Microsoft Store CDN images for OTP Password Manager Pro still lack explicit dimensions because dimensions could not be fetched locally and were not guessed.
- Price, rating, review, version, file size, and offer schema remain omitted until verified real data is supplied.
