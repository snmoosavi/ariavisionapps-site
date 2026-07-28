import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://ariavisionapps.com";
const APP_PAGE_RE = /^apps\/[^/]+\/index\.html$/;
const CATEGORY_PAGE_RE = /^categories\/[^/]+\/index\.html$/;

const args = new Set(process.argv.slice(2));
const jsonOnly = args.has("--json");
const allowMissingData = args.has("--allow-missing-data");

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if ([".git", "node_modules", "__pycache__"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function cleanText(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAttributes(raw = "") {
  const attrs = {};
  const attrRe = /([:\w-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
  for (const match of raw.matchAll(attrRe)) {
    let value = match[2] || "";
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    attrs[match[1].toLowerCase()] = value;
  }
  return attrs;
}

function getMeta(html, name) {
  const re = new RegExp(`<meta\\s+[^>]*name=["']${escapeRegex(name)}["'][^>]*>`, "gi");
  const matches = [...html.matchAll(re)].map((match) => extractAttributes(match[0]).content || "");
  return matches;
}

function getPropertyMeta(html, property) {
  const re = new RegExp(`<meta\\s+[^>]*property=["']${escapeRegex(property)}["'][^>]*>`, "gi");
  const matches = [...html.matchAll(re)].map((match) => extractAttributes(match[0]).content || "");
  return matches;
}

function getLinks(html, rel) {
  const re = new RegExp(`<link\\s+[^>]*rel=["']${escapeRegex(rel)}["'][^>]*>`, "gi");
  return [...html.matchAll(re)].map((match) => extractAttributes(match[0]).href || "");
}

function extractPage(file, html) {
  const rel = toPosix(path.relative(ROOT, file));
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) => cleanText(match[1]));
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => cleanText(match[1]));
  const h2s = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => cleanText(match[1]));
  const imgs = [...html.matchAll(/<img\b([^>]*)>/gi)].map((match) => extractAttributes(match[1]));
  const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
    ...extractAttributes(match[1]),
    text: cleanText(match[2]),
  }));
  const jsonLd = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .map((match) => ({ attrs: extractAttributes(match[1]), body: match[2].trim() }))
    .filter((script) => /application\/ld\+json/i.test(script.attrs.type || ""));
  const microsoftStoreUrls = anchors
    .map((anchor) => anchor.href || "")
    .filter((href) => /apps\.microsoft\.com/i.test(href));
  const words = cleanText(html).split(/\s+/).filter(Boolean).length;

  return {
    file,
    rel,
    publicUrl: rel === "index.html"
      ? `${SITE_URL}/`
      : `${SITE_URL}/${rel.replace(/index\.html$/, "")}`,
    isAppPage: APP_PAGE_RE.test(rel),
    isCategoryPage: CATEGORY_PAGE_RE.test(rel),
    titles,
    descriptions: getMeta(html, "description"),
    robots: getMeta(html, "robots"),
    canonicals: getLinks(html, "canonical"),
    og: {
      type: getPropertyMeta(html, "og:type"),
      title: getPropertyMeta(html, "og:title"),
      description: getPropertyMeta(html, "og:description"),
      url: getPropertyMeta(html, "og:url"),
      image: getPropertyMeta(html, "og:image"),
    },
    twitter: {
      card: getMeta(html, "twitter:card"),
      title: getMeta(html, "twitter:title"),
      description: getMeta(html, "twitter:description"),
      image: getMeta(html, "twitter:image"),
    },
    h1s,
    h2s,
    words,
    images: imgs,
    anchors,
    jsonLd,
    microsoftStoreUrls,
    hasFAQ: /class=["'][^"']*faq|FAQ|Frequently Asked/i.test(html),
    hasRelatedApps: /related-grid|Related apps|More Aria Vision apps/i.test(html),
    hasBreadcrumb: /breadcrumb|BreadcrumbList/i.test(html),
    hasNoindex: /noindex/i.test(html),
  };
}

function resolveInternalHref(pageFile, href) {
  if (!href || href.startsWith("#")) return null;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  if (/^https?:\/\//i.test(href)) {
    if (!href.startsWith(SITE_URL)) return null;
    href = href.slice(SITE_URL.length) || "/";
  }
  const cleanHref = href.split("#")[0].split("?")[0];
  if (!cleanHref) return null;

  let target;
  if (cleanHref.startsWith("/")) {
    target = path.join(ROOT, cleanHref);
  } else {
    target = path.resolve(path.dirname(pageFile), cleanHref);
  }

  if (toPosix(target).endsWith("/")) target = path.join(target, "index.html");
  if (!path.extname(target)) target = path.join(target, "index.html");
  return target;
}

function resolveLocalAsset(pageFile, src) {
  if (!src || /^(https?:|data:|mailto:|tel:|javascript:|#)/i.test(src)) return null;
  const cleanSrc = src.split("#")[0].split("?")[0];
  if (!cleanSrc) return null;
  if (cleanSrc.startsWith("/")) return path.join(ROOT, cleanSrc);
  return path.resolve(path.dirname(pageFile), cleanSrc);
}

function hasNullValue(value) {
  if (value === null) return true;
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasNullValue);
  return Object.values(value).some(hasNullValue);
}

async function loadSeoData() {
  const dataPath = path.join(ROOT, "data", "apps-seo.json");
  if (!await exists(dataPath)) return null;
  return JSON.parse(await fs.readFile(dataPath, "utf8"));
}

async function audit() {
  const files = await walk(ROOT);
  const htmlFiles = files.filter((file) => path.basename(file).toLowerCase() === "index.html");
  const pages = [];
  const errors = [];
  const warnings = [];

  for (const file of htmlFiles) {
    pages.push(extractPage(file, await fs.readFile(file, "utf8")));
  }

  const publicPages = pages.filter((page) =>
    page.rel === "index.html"
    || page.rel === "privacy/index.html"
    || page.isAppPage
    || page.isCategoryPage
    || page.rel === "apps/subtitle-generator-pro/privacy/index.html"
    || page.rel === "apps/subtitle-generator-pro/support/index.html"
  );
  const appPages = pages.filter((page) => page.isAppPage);
  const categoryPages = pages.filter((page) => page.isCategoryPage);

  const titleCounts = new Map();
  const descCounts = new Map();
  for (const page of publicPages) {
    for (const title of page.titles) titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
    for (const desc of page.descriptions) descCounts.set(desc, (descCounts.get(desc) || 0) + 1);

    if (page.titles.length !== 1) errors.push(`${page.rel}: expected one <title>, found ${page.titles.length}.`);
    if (page.descriptions.length !== 1) errors.push(`${page.rel}: expected one meta description, found ${page.descriptions.length}.`);
    if (page.canonicals.length !== 1) errors.push(`${page.rel}: expected one canonical, found ${page.canonicals.length}.`);
    if (page.h1s.length !== 1) errors.push(`${page.rel}: expected one H1, found ${page.h1s.length}.`);
    if (page.hasNoindex && (page.isAppPage || page.isCategoryPage || page.rel === "index.html")) {
      errors.push(`${page.rel}: public page contains noindex.`);
    }
    if (!page.og.title.length || !page.og.description.length || !page.og.url.length || !page.og.image.length) {
      warnings.push(`${page.rel}: Open Graph metadata is incomplete.`);
    }
    if (!page.twitter.card.length || !page.twitter.title.length || !page.twitter.description.length || !page.twitter.image.length) {
      warnings.push(`${page.rel}: Twitter Card metadata is incomplete.`);
    }
    for (const image of page.images) {
      if (!("alt" in image)) errors.push(`${page.rel}: image ${image.src || "(unknown)"} is missing alt.`);
      const localImage = resolveLocalAsset(page.file, image.src || "");
      if (localImage && !await exists(localImage)) {
        errors.push(`${page.rel}: broken local image ${image.src}`);
      }
      if (!("width" in image) || !("height" in image)) {
        warnings.push(`${page.rel}: image ${image.src || "(unknown)"} is missing width or height.`);
      }
    }
    for (const [index, script] of page.jsonLd.entries()) {
      try {
        const data = JSON.parse(script.body);
        if (hasNullValue(data)) warnings.push(`${page.rel}: JSON-LD block ${index + 1} contains null values.`);
      } catch (error) {
        errors.push(`${page.rel}: JSON-LD block ${index + 1} is invalid JSON (${error.message}).`);
      }
    }
    for (const anchor of page.anchors) {
      const target = resolveInternalHref(page.file, anchor.href || "");
      if (!target) continue;
      if (!await exists(target)) errors.push(`${page.rel}: broken internal link ${anchor.href}`);
    }
  }

  for (const [title, count] of titleCounts) {
    if (title && count > 1) errors.push(`Duplicate title (${count} pages): ${title}`);
  }
  for (const [desc, count] of descCounts) {
    if (desc && count > 1) errors.push(`Duplicate meta description (${count} pages): ${desc}`);
  }

  const sitemapPath = path.join(ROOT, "sitemap.xml");
  const sitemapExists = await exists(sitemapPath);
  let sitemapUrls = [];
  if (!sitemapExists) {
    errors.push("sitemap.xml is missing.");
  } else {
    const sitemap = await fs.readFile(sitemapPath, "utf8");
    sitemapUrls = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => match[1].trim());
    for (const page of publicPages.filter((page) => !page.hasNoindex)) {
      if (!sitemapUrls.includes(page.publicUrl)) errors.push(`sitemap.xml missing ${page.publicUrl}`);
    }
  }

  const robotsPath = path.join(ROOT, "robots.txt");
  if (!await exists(robotsPath)) {
    errors.push("robots.txt is missing.");
  } else {
    const robots = await fs.readFile(robotsPath, "utf8");
    if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots)) warnings.push("robots.txt does not clearly allow all crawlers.");
    if (!new RegExp(`Sitemap:\\s*${escapeRegex(SITE_URL)}/sitemap\\.xml`, "i").test(robots)) {
      errors.push("robots.txt does not reference the canonical sitemap URL.");
    }
    if (/Disallow:\s*\//i.test(robots)) errors.push("robots.txt contains a broad Disallow: / rule.");
  }

  const seoData = await loadSeoData();
  if (!seoData) {
    if (!allowMissingData) warnings.push("data/apps-seo.json is not present yet.");
  } else {
    const records = Array.isArray(seoData.apps) ? seoData.apps : [];
    const slugs = new Set(records.map((app) => app.slug));
    const primaryKeywords = new Map();
    for (const app of records) {
      for (const field of ["slug", "appName", "seoTitle", "metaDescription", "canonicalUrl", "microsoftStoreUrl", "primaryKeyword"]) {
        if (!app[field]) errors.push(`data/apps-seo.json: ${app.slug || "(missing slug)"} is missing ${field}.`);
      }
      if (app.canonicalUrl && !app.canonicalUrl.startsWith(`${SITE_URL}/apps/`)) {
        errors.push(`data/apps-seo.json: ${app.slug} has a non-canonical canonicalUrl.`);
      }
      if (app.microsoftStoreUrl && !/^https:\/\/apps\.microsoft\.com\/detail\//i.test(app.microsoftStoreUrl)) {
        errors.push(`data/apps-seo.json: ${app.slug} has an invalid Microsoft Store URL.`);
      }
      for (const related of app.relatedAppSlugs || []) {
        if (!slugs.has(related)) errors.push(`data/apps-seo.json: ${app.slug} related app does not exist: ${related}`);
        if (related === app.slug) errors.push(`data/apps-seo.json: ${app.slug} links to itself as related app.`);
      }
      if (app.primaryKeyword) primaryKeywords.set(app.primaryKeyword, (primaryKeywords.get(app.primaryKeyword) || 0) + 1);
    }
    for (const [keyword, count] of primaryKeywords) {
      if (count > 1) warnings.push(`Primary keyword reused ${count} times: ${keyword}`);
    }
    for (const page of appPages) {
      const slug = page.rel.split("/")[1];
      if (!slugs.has(slug)) errors.push(`data/apps-seo.json missing app page slug: ${slug}`);
    }
  }

  return {
    root: ROOT,
    generatedAt: new Date().toISOString(),
    counts: {
      publicPages: publicPages.length,
      appPages: appPages.length,
      categoryPages: categoryPages.length,
      sitemapUrls: sitemapUrls.length,
    },
    pages: publicPages.map((page) => ({
      rel: page.rel,
      publicUrl: page.publicUrl,
      title: page.titles[0] || "",
      description: page.descriptions[0] || "",
      h1: page.h1s[0] || "",
      h2Count: page.h2s.length,
      wordCount: page.words,
      imageCount: page.images.length,
      imagesMissingAlt: page.images.filter((image) => !("alt" in image)).length,
      microsoftStoreLinkCount: page.microsoftStoreUrls.length,
      jsonLdCount: page.jsonLd.length,
      hasFAQ: page.hasFAQ,
      hasRelatedApps: page.hasRelatedApps,
      hasBreadcrumb: page.hasBreadcrumb,
    })),
    errors,
    warnings,
  };
}

const result = await audit();
if (jsonOnly) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`SEO audit: ${result.counts.publicPages} public pages, ${result.counts.appPages} app pages, ${result.counts.categoryPages} category pages.`);
  console.log(`Errors: ${result.errors.length}`);
  for (const error of result.errors) console.log(`ERROR ${error}`);
  console.log(`Warnings: ${result.warnings.length}`);
  for (const warning of result.warnings) console.log(`WARN ${warning}`);
}

if (result.errors.length) process.exitCode = 1;
