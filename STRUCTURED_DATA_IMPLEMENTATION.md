# Structured Data Implementation

Generated on 2026-07-28.

## Implemented schemas

- Homepage: Organization, WebSite, ItemList.
- App pages: Organization, SoftwareApplication, BreadcrumbList, FAQPage.
- Category pages: Organization, CollectionPage, BreadcrumbList, ItemList.
- Privacy/support pages: Organization and WebPage.

## Generation location

Structured data is generated from `data/apps-seo.json` by `scripts/apply-seo-model.mjs` and rendered directly into static HTML as JSON-LD. Each page uses a single JSON-LD block with an `@graph` to avoid duplicate entity blocks.

## Sample SoftwareApplication

Sample page: apps/trading-journal-pro/index.html

Types present: Organization, SoftwareApplication, BreadcrumbList, FAQPage

Required SoftwareApplication fields are populated from real project data: name, description, applicationCategory, operatingSystem, url, downloadUrl, image, screenshot, publisher, dateModified, and featureList.

## Category schema sample

Sample page: categories/developer-tools/index.html

Types present: Organization, CollectionPage, BreadcrumbList, ItemList

## Homepage schema sample

Types present: Organization, WebSite, ItemList

## Optional fields intentionally omitted

- AggregateRating and Review were not added because no visible verified rating/review data exists in the project.
- Offer, price, and currency were not added because reliable pricing data is not stored for every app.
- softwareVersion, fileSize, and releaseNotes were not added because the current project does not contain reliable values.
- sameAs was not added because no official social profile list is present.

## Adding schema for a new app

1. Add the app record to `data/apps-seo.json`.
2. Include the real Microsoft Store URL and visible FAQ items.
3. Add screenshot references and alt text.
4. Run `node scripts/apply-seo-model.mjs`.
5. Run `node scripts/seo-audit.mjs` and optionally validate the page with Google Rich Results Test and Schema.org Validator.

## Validation

- JSON-LD syntax is checked by `scripts/seo-audit.mjs`.
- The audit rejects invalid JSON-LD and checks that public pages are covered by sitemap.
- FAQPage schema is generated only from FAQ items visible in the same static HTML page.

## Coverage

- App pages with SoftwareApplication schema: 32
- Category pages with CollectionPage/ItemList schema: 10
