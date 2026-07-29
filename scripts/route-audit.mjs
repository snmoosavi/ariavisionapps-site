import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://ariavisionapps.com";

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizePath(route) {
  const [pathname] = route.split(/[?#]/);
  if (!pathname || pathname === "/") return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

async function publicAppSlugs() {
  const entries = await fs.readdir(path.join(ROOT, "apps"), { withFileTypes: true });
  const slugs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (await exists(path.join(ROOT, "apps", entry.name, "index.html"))) {
      slugs.push(entry.name);
    }
  }
  return slugs.sort();
}

async function publicCategorySlugs() {
  const entries = await fs.readdir(path.join(ROOT, "categories"), { withFileTypes: true });
  const slugs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (await exists(path.join(ROOT, "categories", entry.name, "index.html"))) {
      slugs.push(entry.name);
    }
  }
  return slugs.sort();
}

async function loadRedirects() {
  const file = path.join(ROOT, "_redirects");
  if (!await exists(file)) return [];
  const source = await fs.readFile(file, "utf8");
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [from, to, status = "301"] = line.split(/\s+/);
      return { from, to, status: Number(status) };
    });
}

function routeToFile(route) {
  const pathname = normalizePath(route);
  if (pathname === "/") return path.join(ROOT, "index.html");
  if (pathname.endsWith("/")) return path.join(ROOT, pathname.slice(1), "index.html");
  const ext = path.extname(pathname);
  return path.join(ROOT, ext ? pathname.slice(1) : pathname.slice(1), ext ? "" : "index.html");
}

async function resolveRoute(route, redirects) {
  const pathname = normalizePath(route);
  const redirect = redirects.find((item) => item.from === pathname);
  if (redirect) return { status: redirect.status, location: redirect.to };
  if (await exists(routeToFile(pathname))) return { status: 200 };
  if (await exists(path.join(ROOT, "404.html"))) return { status: 404 };
  return { status: 200, soft404: true };
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

const redirects = await loadRedirects();
const appSlugs = await publicAppSlugs();
const categorySlugs = await publicCategorySlugs();
const sitemap = await fs.readFile(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => match[1].trim());
const errors = [];

const validRoutes = [
  "/",
  "/privacy/",
  "/apps/subtitle-generator-pro/privacy/",
  "/apps/subtitle-generator-pro/support/",
  ...appSlugs.map((slug) => `/apps/${slug}/`),
  ...categorySlugs.map((slug) => `/categories/${slug}/`),
];

for (const route of validRoutes) {
  const result = await resolveRoute(route, redirects);
  assert(result.status === 200, `${route} should resolve as 200, got ${result.status}`, errors);
}

const expectedRedirects = [
  ["/apps/voice-to-text/", "/apps/voice-to-text-converter-pro/"],
  ["/apps/pyinstaller/guides/", "/apps/pyinstaller/"],
];

for (const [from, to] of expectedRedirects) {
  const result = await resolveRoute(from, redirects);
  assert(result.status === 301, `${from} should be a 301 redirect, got ${result.status}`, errors);
  assert(result.location === to, `${from} should redirect to ${to}, got ${result.location}`, errors);
  assert(!sitemapUrls.includes(`${SITE_URL}${from}`), `${from} must not be listed in sitemap.xml`, errors);
  assert(sitemapUrls.includes(`${SITE_URL}${to}`), `${to} should be listed in sitemap.xml`, errors);
}

for (const route of ["/apps/not-a-real-app/", "/old-page-that-does-not-exist/", "/apps/pyinstaller/guides/layout/"]) {
  const result = await resolveRoute(route, redirects);
  assert(result.status === 404, `${route} should resolve as 404, got ${result.status}`, errors);
  assert(!result.soft404, `${route} is behaving like a soft 404`, errors);
}

assert(await exists(path.join(ROOT, "404.html")), "404.html is missing at project root", errors);

if (errors.length) {
  console.error(`Route audit failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Route audit passed: ${validRoutes.length} valid routes, ${expectedRedirects.length} redirects, 3 invalid routes.`);
}
