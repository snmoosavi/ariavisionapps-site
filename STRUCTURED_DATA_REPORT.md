# Structured Data Report

Date: 2026-07-29

## Schema Types In Use

- Organization
- WebSite
- SoftwareApplication
- BreadcrumbList
- FAQPage where FAQ content is visible
- CollectionPage for category pages
- ItemList for homepage/category app lists
- WebPage for privacy, support, and 404 pages

## Corrections

- BreadcrumbList now matches visible breadcrumbs.
- App screenshot URLs are serialized as absolute URLs without corrupting external Microsoft Store URLs.
- Null and undefined values are pruned before JSON-LD serialization.
- Offer, aggregateRating, review, and softwareVersion are omitted unless real data exists.

## Validation

SEO audit: 46 public pages, 32 app pages, 10 category pages.
Errors: 0
Warnings: 0
