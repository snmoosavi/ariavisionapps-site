# Routing And Redirect Report

Date: 2026-07-29

## Static Routing Model

This repository is a plain static Cloudflare Pages site. Public routes are folder-based index.html files. A root 404.html file is included so unknown paths can return a real 404 response on Cloudflare Pages instead of falling back to the homepage.

Cloudflare Pages documentation confirms that a top-level 404.html is used for missing files and avoids the default SPA fallback behavior when no 404 file exists.

## Redirects

- /apps/voice-to-text/ -> /apps/voice-to-text-converter-pro/ (301)
- /apps/pyinstaller/guides/ -> /apps/pyinstaller/ (301)

## 404 Handling

- /apps/not-a-real-app/ => 404
- /old-page-that-does-not-exist/ => 404
- /apps/pyinstaller/guides/layout/ => 404

## Validation

Route audit passed: 46 valid routes, 2 redirects, 3 invalid routes.

## Sitemap Exclusions

Redirect sources and 404/test routes are not listed in sitemap.xml.
