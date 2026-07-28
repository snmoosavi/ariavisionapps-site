# SEO Content Model

Aria Vision Apps is a static HTML/CSS/JS website. The central SEO data model lives in `data/apps-seo.json`. It is a maintenance source for page metadata, category pages, related apps, FAQ content, image metadata, and JSON-LD generation. The deployed website remains plain static files and does not require a backend or runtime data service.

## Files

- `data/apps-seo.json`: site facts, app records, category records, Microsoft Store URLs, FAQ items, screenshots, related apps, and metadata.
- `scripts/seo-audit.mjs`: validates rendered static HTML and the central SEO data.
- `scripts/apply-seo-model.mjs`: reads the central model and updates rendered static HTML files when SEO content needs to be refreshed.

## Required App Fields

Each app record must define `slug`, `appName`, `primaryKeyword`, `seoTitle`, `metaDescription`, `h1`, `category`, `operatingSystem`, `microsoftStoreUrl`, `canonicalUrl`, `heroImage`, `screenshots`, `faqItems`, `relatedAppSlugs`, and `schemaApplicationCategory`.

Optional fields such as `appVersion`, `pricingType`, `price`, `currency`, `supportedFormats`, `offlineSupport`, `privacySummary`, and `publishedDate` are left as `null`, empty strings, or empty arrays when the current project does not contain real information. Do not invent ratings, reviews, prices, offers, file sizes, release notes, or versions.

## Adding a New App

1. Create the app folder under `apps/<app-slug>/` with `index.html`, icon, and screenshots.
2. Add one record to `data/apps-seo.json` using the same slug.
3. Use the real Microsoft Store URL for `microsoftStoreUrl`.
4. Add screenshot objects with `src`, `caption`, and descriptive `alt` text.
5. Add 4 to 8 visible FAQ items only when the answers are supported by the app page or Microsoft Store listing.
6. Choose 3 to 6 related app slugs by category, workflow, user need, or file type.
7. Run `node scripts/apply-seo-model.mjs` locally if Node is available, then run `node scripts/seo-audit.mjs`.

## Related Apps Rules

Related apps should be useful to a visitor evaluating the current app. Prefer same category first, then a connected workflow. Do not link every app to every other app, and do not add unrelated apps only to increase link count.

## FAQ and Images

FAQ items in the model are rendered visibly on the app page before any FAQPage schema is emitted. Screenshot alt text should describe the visible screenshot and app context, not repeat keyword phrases unnaturally. Decorative icons next to visible app names may use empty alt text.

## Schema Generation

Structured data is generated from the same fields used on the page: app name, description, canonical URL, Microsoft Store URL, category, screenshots, FAQ items, related apps, and publisher data. Unknown facts remain omitted rather than represented as incomplete schema.

## Validation

Run `node scripts/seo-audit.mjs` to check required fields, canonical URLs, Microsoft Store URLs, related app slugs, unique metadata, JSON-LD syntax, one H1 per public page, alt attributes, and broken internal links.
