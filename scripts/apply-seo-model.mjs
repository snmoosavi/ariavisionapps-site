import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://ariavisionapps.com";
const CURRENT_DATE = "2026-07-28";

function html(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function text(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prune(value) {
  if (Array.isArray(value)) {
    return value.map(prune).filter((item) => item !== undefined);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      const pruned = prune(child);
      if (pruned !== undefined) out[key] = pruned;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (value === null || value === undefined || value === "") return undefined;
  return value;
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(prune(data))}</script>`;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveImage(pageFile, src) {
  if (!src || /^(https?:|data:|mailto:|#)/i.test(src)) return null;
  return path.resolve(path.dirname(pageFile), src);
}

function pngSize(buffer) {
  if (buffer.length < 24) return null;
  if (buffer.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

function svgSize(source) {
  const width = source.match(/\bwidth=["']?([\d.]+)/i)?.[1];
  const height = source.match(/\bheight=["']?([\d.]+)/i)?.[1];
  if (width && height) return { width: Math.round(Number(width)), height: Math.round(Number(height)) };
  const viewBox = source.match(/\bviewBox=["'][\d.\s-]+\s+([\d.]+)\s+([\d.]+)["']/i);
  if (viewBox) return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
  return null;
}

async function imageSize(filePath) {
  if (!filePath || !await exists(filePath)) return null;
  const buffer = await fs.readFile(filePath);
  const byPng = pngSize(buffer);
  if (byPng) return byPng;
  const byJpeg = jpegSize(buffer);
  if (byJpeg) return byJpeg;
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".svg") return svgSize(buffer.toString("utf8"));
  return null;
}

function setAttr(tag, name, value) {
  const attr = `${name}="${html(value)}"`;
  const re = new RegExp(`\\s${name}=(?:"[^"]*"|'[^']*'|[^\\s>]+)`, "i");
  if (re.test(tag)) return tag.replace(re, ` ${attr}`);
  return tag.replace(/\s*\/?>$/, (end) => ` ${attr}${end}`);
}

async function enhanceImages(pageFile, source, app) {
  const knownAlt = new Map();
  if (app) {
    knownAlt.set("icon.png", `${app.appName} icon`);
    for (const shot of app.screenshots || []) {
      knownAlt.set(shot.src, app.imageAltTexts?.[shot.src] || shot.alt || `${app.appName} screenshot`);
    }
  }

  let output = source.replace(/<img\b[^>]*\ssrc=["']\s*["'][^>]*>/gi, "");
  const matches = [...output.matchAll(/<img\b[^>]*>/gi)];
  for (const match of matches.reverse()) {
    let tag = match[0];
    const src = tag.match(/\ssrc=["']([^"']+)["']/i)?.[1] || "";
    const resolved = resolveImage(pageFile, src);
    const size = await imageSize(resolved);
    const alt = knownAlt.get(src);

    if (alt !== undefined) tag = setAttr(tag, "alt", alt);
    if (size) {
      tag = setAttr(tag, "width", String(size.width));
      tag = setAttr(tag, "height", String(size.height));
    }
    if (!/\bloading=/i.test(tag) && !/hero|mainScreenshot|brand-mark/i.test(tag)) {
      tag = setAttr(tag, "loading", "lazy");
    }

    output = output.slice(0, match.index) + tag + output.slice(match.index + match[0].length);
  }
  return output;
}

function organization(site) {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: site.publisherName,
    url: site.url,
    logo: `${SITE_URL}/assets/icons/aria-vision.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      email: site.contactEmail,
      contactType: "customer support",
    },
  };
}

function website(site) {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.name,
    url: site.url,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

function appSchema(app) {
  const schema = {
    "@type": "SoftwareApplication",
    "@id": `${app.canonicalUrl}#softwareapplication`,
    name: app.appName,
    description: app.metaDescription,
    applicationCategory: app.schemaApplicationCategory,
    operatingSystem: app.operatingSystem,
    url: app.canonicalUrl,
    downloadUrl: app.microsoftStoreUrl,
    image: app.ogImage,
    screenshot: (app.screenshots || []).map((shot) => `${app.canonicalUrl}${shot.src}`),
    publisher: { "@id": `${SITE_URL}/#organization` },
    dateModified: app.lastUpdated,
    datePublished: app.publishedDate,
    featureList: app.keyFeatures,
  };
  if (app.appVersion) schema.softwareVersion = app.appVersion;
  if (app.pricingType && app.price !== null && app.currency) {
    schema.offers = {
      "@type": "Offer",
      price: app.price,
      priceCurrency: app.currency,
      availability: "https://schema.org/InStock",
      url: app.microsoftStoreUrl,
    };
  }
  return schema;
}

function breadcrumbSchema(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function faqSchema(app) {
  if (!app.faqItems?.length) return undefined;
  return {
    "@type": "FAQPage",
    "@id": `${app.canonicalUrl}#faq`,
    mainEntity: app.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function appJsonLd(model, app, category) {
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      organization(model.site),
      appSchema(app),
      breadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: category.name, url: category.canonicalUrl },
        { name: app.appName, url: app.canonicalUrl },
      ]),
      faqSchema(app),
    ],
  });
}

function categoryJsonLd(model, category, apps) {
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      organization(model.site),
      {
        "@type": "CollectionPage",
        "@id": `${category.canonicalUrl}#collection`,
        name: category.h1,
        description: category.description,
        url: category.canonicalUrl,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      breadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: category.name, url: category.canonicalUrl },
      ]),
      {
        "@type": "ItemList",
        "@id": `${category.canonicalUrl}#itemlist`,
        itemListElement: apps.map((app, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: app.canonicalUrl,
          name: app.appName,
        })),
      },
    ],
  });
}

function homeJsonLd(model) {
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      organization(model.site),
      website(model.site),
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#apps-list`,
        name: "Aria Vision Windows apps",
        itemListElement: model.apps.map((app, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: app.canonicalUrl,
          name: app.appName,
        })),
      },
    ],
  });
}

function head({ title, description, canonical, prefix, ogImage, ogType = "website", schema }) {
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${html(title)}</title>
  <meta name="description" content="${html(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${html(canonical)}">
  <meta property="og:type" content="${html(ogType)}">
  <meta property="og:title" content="${html(title)}">
  <meta property="og:description" content="${html(description)}">
  <meta property="og:url" content="${html(canonical)}">
  <meta property="og:image" content="${html(ogImage)}">
  <meta property="og:site_name" content="Aria Vision Apps">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${html(title)}">
  <meta name="twitter:description" content="${html(description)}">
  <meta name="twitter:image" content="${html(ogImage)}">
  <meta name="theme-color" content="#f7f9ff">
  <link rel="icon" href="${prefix}assets/icons/aria-vision.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}css/style.css">
  ${schema}
</head>`;
}

function replaceHead(source, newHead) {
  return source.replace(/<head>[\s\S]*?<\/head>/i, newHead);
}

function categoryByName(model, name) {
  return model.categories.find((category) => category.name === name);
}

function renderBreadcrumb(app, category) {
  return `<nav class="container breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="../../">Home</a></li>
          <li><a href="../../categories/${category.slug}/">${html(category.name)}</a></li>
          <li aria-current="page">${html(app.appName)}</li>
        </ol>
        <a class="back-link" href="../../#apps">Back to all apps</a>
      </nav>`;
}

function renderGuide(app) {
  const paragraphs = (app.fullDescription || app.shortDescription)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, 3);
  const targetUsers = app.targetUsers?.length ? app.targetUsers : ["Windows users evaluating this workflow"];
  const featureFallback = app.keyFeatures?.length ? app.keyFeatures : [app.shortDescription];
  const benefits = featureFallback.slice(0, 5);
  const steps = featureFallback.slice(0, 4);
  const capabilities = (app.supportedFormats?.length ? app.supportedFormats : featureFallback.slice(0, 6));
  const privacy = app.privacySummary || "This page does not claim a specific cloud, offline, or storage behavior for this app. Review the Microsoft Store listing and app-specific privacy information before installing.";
  const offline = app.offlineSupport || "Offline support is not stated in the current project content.";

  return `<section class="section editorial-section app-guide" id="workflow-guide">
      <div class="container guide-stack">
        <article class="workflow-article">
          <p class="eyebrow">App guide</p>
          <h2>What is ${html(app.appName)}?</h2>
          ${paragraphs.map((paragraph) => `<p>${html(paragraph)}</p>`).join("\n          ")}
        </article>
        <div class="guide-grid">
          <article class="workflow-notes guide-card">
            <h2>Who is it for?</h2>
            <ul>${targetUsers.map((item) => `<li>${html(item)}</li>`).join("")}</ul>
          </article>
          <article class="workflow-notes guide-card">
            <h2>Key benefits</h2>
            <ul>${benefits.map((item) => `<li>${html(item)}</li>`).join("")}</ul>
          </article>
          <article class="workflow-notes guide-card">
            <h2>How it works</h2>
            <ol>${steps.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${html(item)}</li>`).join("")}</ol>
          </article>
          <article class="workflow-notes guide-card">
            <h2>Capabilities and requirements</h2>
            <p>${html(privacy)} ${html(offline)} Exact device requirements should be confirmed on the Microsoft Store listing.</p>
            <ul>${capabilities.map((item) => `<li>${html(item)}</li>`).join("")}</ul>
          </article>
        </div>
      </div>
    </section>`;
}

function renderScreenshots(app) {
  const shots = app.screenshots?.length ? app.screenshots : [{ src: app.heroImage, caption: `${app.appName} main screen` }];
  return `<section class="section soft" id="screenshots">
      <div class="container section-heading center">
        <p class="eyebrow">Screenshots</p>
        <h2>See the product in action</h2>
        <p>Click any screenshot to open a large preview.</p>
      </div>
      <div class="container screenshot-grid">
        ${shots.map((shot, index) => `<button class="screenshot-thumb${index === 0 ? " is-active" : ""}" type="button" data-image="${html(shot.src)}" data-caption="${html(shot.caption)}" aria-label="Open ${html(shot.caption || app.appName)}">
          <img src="${html(shot.src)}" alt="${html(app.imageAltTexts?.[shot.src] || shot.alt || `${app.appName} screenshot for Windows`)}" loading="${index === 0 ? "eager" : "lazy"}">
          <span>${html(shot.caption || `${app.appName} screenshot ${index + 1}`)}</span>
        </button>`).join("\n        ")}
      </div>
    </section>`;
}

function renderFaq(app) {
  return `<section class="section soft" id="faq">
      <div class="container section-heading center">
        <p class="eyebrow">FAQ</p>
        <h2>Questions about ${html(app.appName)}</h2>
      </div>
      <div class="container value-grid faq-grid">
        ${app.faqItems.map((item, index) => `<article>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${html(item.question)}</h3>
          <p>${html(item.answer)}</p>
        </article>`).join("\n        ")}
      </div>
    </section>`;
}

function relatedReason(current, related) {
  if (current.category === related.category) {
    return `${related.appName} is another ${related.category.toLowerCase()} app that supports a nearby Windows workflow.`;
  }
  return `${related.appName} pairs with ${current.appName} for users who want connected Windows tools across related tasks.`;
}

function appAsset(prefix, app, asset) {
  if (!asset) return "";
  if (/^https?:\/\//i.test(asset)) return asset;
  return `${prefix}apps/${app.slug}/${asset}`;
}

function renderRelated(app, appMap) {
  return `<section class="section">
      <div class="container section-heading center">
        <p class="eyebrow">Related apps</p>
        <h2>More Aria Vision apps for this workflow</h2>
      </div>
      <div class="container related-grid">
        ${app.relatedAppSlugs.map((slug) => {
          const related = appMap.get(slug);
          return `<a class="related-link related-card" href="../${related.slug}/" aria-label="View ${html(related.appName)} for ${html(related.category)} Windows workflows">
          <img src="../${related.slug}/${html(related.icon || "icon.png")}" alt="" loading="lazy">
          <span><strong>${html(related.appName)}</strong><small>${html(relatedReason(app, related))}</small></span>
        </a>`;
        }).join("\n        ")}
      </div>
      <div class="container card-actions">
        <a class="button secondary" href="../../#apps">Back to all apps</a>
      </div>
    </section>`;
}

function replaceSection(source, startRe, nextRe, replacement) {
  const start = source.search(startRe);
  if (start < 0) return source;
  const rest = source.slice(start);
  const next = rest.search(nextRe);
  if (next < 0) return source;
  return source.slice(0, start) + replacement + "\n\n    " + rest.slice(next);
}

function updateAppContent(source, app, category, appMap) {
  let output = source;
  output = output.replace(
    /<div class="container breadcrumb">[\s\S]*?<\/div>/i,
    renderBreadcrumb(app, category),
  );
  output = output.replace(
    /<p class="eyebrow">[^<]*<\/p>\s*<h1>[\s\S]*?<\/h1>\s*<p class="lead">[\s\S]*?<\/p>/i,
    `<p class="eyebrow">${html(category.name)}</p>
          <h1>${html(app.h1)}</h1>
          <p class="lead">${html(app.shortDescription)}</p>`,
  );
  output = replaceSection(
    output,
    /<section class="section editorial-section[^"]*" id="workflow-guide">/i,
    /<section class="section soft" id="screenshots">/i,
    renderGuide(app),
  );
  output = replaceSection(
    output,
    /<section class="section soft" id="screenshots">/i,
    /<section class="section">\s*<div class="container feature-stage">/i,
    renderScreenshots(app),
  );
  output = replaceSection(
    output,
    /<section class="section soft"[^>]*>\s*<div class="container section-heading center">\s*<p class="eyebrow">FAQ<\/p>/i,
    /<section class="section dark-section">/i,
    renderFaq(app),
  );
  output = replaceSection(
    output,
    /<section class="section">\s*<div class="container section-heading center">\s*<p class="eyebrow">Related apps<\/p>/i,
    /<\/main>/i,
    renderRelated(app, appMap),
  );
  output = output.replace(/mailto:support@ariavisionapps\.com/gi, `mailto:${appMap.site?.contactEmail || "sn.moosavi@gmail.com"}`);
  output = output.replace(/support@ariavisionapps\.com/gi, appMap.site?.contactEmail || "sn.moosavi@gmail.com");
  return output;
}

function renderControls(model) {
  return `<div class="container controls" aria-label="Product filters">
        <label class="search-box">
          <span>Search catalog</span>
          <input type="search" id="appSearch" placeholder="Try Python packaging, audio cleanup, trading journal, backup, JSON...">
        </label>
        <div class="filter-row">
          <button class="filter-pill is-active" type="button" data-filter="all">All</button>
          ${model.categories.map((category) => `<button class="filter-pill" type="button" data-filter="${html(category.name.toLowerCase())}">${html(category.name)}</button>`).join("")}
        </div>
        <nav class="category-page-links" aria-label="Browse app categories">
          ${model.categories.map((category) => `<a href="categories/${category.slug}/">${html(category.name)}</a>`).join("")}
        </nav>
      </div>`;
}

function renderProductCard(app) {
  const dataDescription = `${app.appName} ${app.category} ${app.shortDescription} ${(app.keyFeatures || []).slice(0, 6).join(" ")}`.toLowerCase();
  const screenshot = app.heroImage || app.screenshots?.[0]?.src || "icon.png";
  return `<article class="product-card reveal" data-title="${html(app.appName.toLowerCase())}" data-category="${html(app.category.toLowerCase())}" data-description="${html(dataDescription)}">
      <div class="card-glow" aria-hidden="true"></div>
      <div class="card-top">
        <img class="app-icon" src="${html(appAsset("", app, app.icon || "icon.png"))}" alt="" loading="lazy">
        <span class="category-tag">${html(app.category)}</span>
      </div>
      <h3>${html(app.appName)}</h3>
      <p>${html(app.shortDescription)}</p>
      <a class="card-preview" href="apps/${app.slug}/" aria-label="View ${html(app.appName)} product page">
        <img src="${html(appAsset("", app, screenshot))}" alt="${html(app.imageAltTexts?.[screenshot] || `${app.appName} screenshot for Windows`)}" loading="lazy">
      </a>
      <div class="card-meta">
        <span>Windows app</span>
        <span>${html(app.publishedDate || "Microsoft Store")}</span>
      </div>
      <div class="card-actions">
        <a class="button small primary" href="apps/${app.slug}/">View Details</a>
        <a class="button small ghost" href="${html(app.microsoftStoreUrl)}" target="_blank" rel="noopener">Microsoft Store</a>
      </div>
    </article>`;
}

function renderFooter(prefix, model) {
  const mainCategories = ["Developer tools", "Productivity", "Utilities & tools", "Photo & video", "Security", "Education"]
    .map((name) => model.categories.find((category) => category.name === name))
    .filter(Boolean);
  return `<footer class="footer">
    <div class="container footer-grid">
      <div>
        <a class="brand footer-brand" href="${prefix}">
          <span class="brand-mark">AV</span>
          <span><strong>Aria Vision</strong><small>Windows apps on Microsoft Store</small></span>
        </a>
        <p>Official portfolio for Aria Vision Windows apps, with clear product pages, screenshots, FAQs, and Microsoft Store links.</p>
      </div>
      <div>
        <strong>Explore</strong>
        <a href="${prefix}#apps">Apps</a>
        <a href="${prefix}#solutions">Solutions</a>
        <a href="${prefix}#about">About</a>
        <a href="${prefix}#contact">Contact</a>
        <a href="${prefix}privacy/">Privacy</a>
      </div>
      <div>
        <strong>Categories</strong>
        ${mainCategories.map((category) => `<a href="${prefix}categories/${category.slug}/">${html(category.name)}</a>`).join("\n        ")}
      </div>
      <div>
        <strong>Store</strong>
        <a href="${html(model.site.microsoftStorePublisherUrl)}" target="_blank" rel="noopener">Publisher page</a>
        <a href="${prefix}sitemap.xml">Sitemap</a>
        <a href="mailto:${html(model.site.contactEmail)}">${html(model.site.contactEmail)}</a>
      </div>
    </div>
    <div class="container footer-bottom">&copy; 2026 Aria Vision. Windows apps published on Microsoft Store.</div>
  </footer>`;
}

async function updateHomepage(model) {
  const file = path.join(ROOT, "index.html");
  let source = await fs.readFile(file, "utf8");
  const title = "Aria Vision Apps - Practical Windows Apps on Microsoft Store";
  const description = "Explore practical Windows apps by Aria Vision for productivity, development, media, trading, automation, utilities, education, and security.";
  const ogImage = `${SITE_URL}/apps/pomodoro-pro/screenshots/screenshot-1.jpg`;
  source = replaceHead(source, head({
    title,
    description,
    canonical: `${SITE_URL}/`,
    prefix: "",
    ogImage,
    schema: homeJsonLd(model),
  }));
  source = source.replace(/<div class="container controls"[\s\S]*?<div class="container product-grid" id="productGrid">/i, `${renderControls(model)}
      <div class="container product-grid" id="productGrid">`);
  const start = source.indexOf('<div class="container product-grid" id="productGrid">');
  const end = source.indexOf('<div class="container empty-state"', start);
  if (start >= 0 && end > start) {
    const grid = `<div class="container product-grid" id="productGrid">
    ${model.apps.map(renderProductCard).join("\n    ")}
      </div>
      `;
    source = source.slice(0, start) + grid + source.slice(end);
  }
  source = source.replace(/<footer class="footer">[\s\S]*?<\/footer>/i, renderFooter("", model));
  source = await enhanceImages(file, source, null);
  await fs.writeFile(file, source, "utf8");
}

async function updateAppPage(model, app, appMap, category) {
  const file = path.join(ROOT, "apps", app.slug, "index.html");
  if (!await exists(file)) return;
  let source = await fs.readFile(file, "utf8");
  source = replaceHead(source, head({
    title: app.seoTitle,
    description: app.metaDescription,
    canonical: app.canonicalUrl,
    prefix: "../../",
    ogImage: app.ogImage,
    ogType: "article",
    schema: appJsonLd(model, app, category),
  }));
  appMap.site = model.site;
  source = updateAppContent(source, app, category, appMap);
  source = source.replace(/<footer class="footer">[\s\S]*?<\/footer>/i, renderFooter("../../", model));
  source = await enhanceImages(file, source, app);
  await fs.writeFile(file, source, "utf8");
}

function renderCategoryCard(app) {
  const shot = app.heroImage || app.screenshots?.[0]?.src || "icon.png";
  return `<article class="product-card reveal">
          <div class="card-glow" aria-hidden="true"></div>
          <div class="card-top">
            <img class="app-icon" src="${html(appAsset("../../", app, app.icon || "icon.png"))}" alt="" loading="lazy">
            <span class="category-tag">${html(app.category)}</span>
          </div>
          <h2>${html(app.appName)}</h2>
          <p>${html(app.shortDescription)}</p>
          <a class="card-preview" href="../../apps/${app.slug}/" aria-label="View ${html(app.appName)} product page">
            <img src="${html(appAsset("../../", app, shot))}" alt="${html(app.imageAltTexts?.[shot] || `${app.appName} screenshot for Windows`)}" loading="lazy">
          </a>
          <div class="card-actions">
            <a class="button small primary" href="../../apps/${app.slug}/">View ${html(app.appName)}</a>
            <a class="button small ghost" href="${html(app.microsoftStoreUrl)}" target="_blank" rel="noopener">Microsoft Store</a>
          </div>
        </article>`;
}

function renderCategoryPage(model, category, apps) {
  return `<!doctype html>
<html lang="en">
${head({
  title: category.title,
  description: category.metaDescription,
  canonical: category.canonicalUrl,
  prefix: "../../",
  ogImage: category.ogImage,
  schema: categoryJsonLd(model, category, apps),
})}
<body>
  <header class="site-header">
    <a class="brand" href="../../">
      <span class="brand-mark">AV</span>
      <span>
        <strong>Aria Vision</strong>
        <small>Premium Windows apps</small>
      </span>
    </a>
    <nav class="nav-links" aria-label="Main navigation">
      <a href="../../#apps">Apps</a>
      <a href="../../#solutions">Solutions</a>
      <a href="../../#about">About</a>
      <a href="../../#contact">Contact</a>
    </nav>
  </header>
  <main>
    <section class="product-hero category-hero">
      <div class="hero-aurora" aria-hidden="true"></div>
      <nav class="container breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="../../">Home</a></li>
          <li aria-current="page">${html(category.name)}</li>
        </ol>
      </nav>
      <div class="container section-heading">
        <p class="eyebrow">Category</p>
        <h1>${html(category.h1)}</h1>
        <p>${html(category.description)}</p>
      </div>
    </section>
    <section class="section" id="apps">
      <div class="container product-grid category-product-grid">
        ${apps.map(renderCategoryCard).join("\n        ")}
      </div>
      <div class="container card-actions">
        <a class="button secondary" href="../../#apps">Back to all apps</a>
      </div>
    </section>
  </main>
  ${renderFooter("../../", model)}
  <script src="../../js/main.js"></script>
</body>
</html>`;
}

async function writeCategoryPages(model, appMap) {
  for (const category of model.categories) {
    const dir = path.join(ROOT, "categories", category.slug);
    await fs.mkdir(dir, { recursive: true });
    const apps = category.appSlugs.map((slug) => appMap.get(slug)).filter(Boolean);
    let source = renderCategoryPage(model, category, apps);
    source = await enhanceImages(path.join(dir, "index.html"), source, null);
    await fs.writeFile(path.join(dir, "index.html"), source, "utf8");
  }
}

async function updatePrivacy(model) {
  const file = path.join(ROOT, "privacy", "index.html");
  if (!await exists(file)) return;
  let source = await fs.readFile(file, "utf8");
  const title = "Privacy Policy | Aria Vision Apps";
  const description = "Privacy policy for the Aria Vision Apps static website, contact details, and where to review app-specific Microsoft Store privacy information.";
  source = replaceHead(source, head({
    title,
    description,
    canonical: `${SITE_URL}/privacy/`,
    prefix: "../",
    ogImage: `${SITE_URL}/assets/icons/aria-vision.svg`,
    schema: jsonLd({
      "@context": "https://schema.org",
      "@graph": [
        organization(model.site),
        {
          "@type": "WebPage",
          "@id": `${SITE_URL}/privacy/#webpage`,
          name: title,
          description,
          url: `${SITE_URL}/privacy/`,
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
      ],
    }),
  }));
  source = source.replace(/<footer class="footer">[\s\S]*?<\/footer>/i, renderFooter("../", model));
  source = source.replace(/mailto:support@ariavisionapps\.com/gi, `mailto:${model.site.contactEmail}`);
  source = source.replace(/support@ariavisionapps\.com/gi, model.site.contactEmail);
  await fs.writeFile(file, source, "utf8");
}

async function updateSpecialSubtitlePages(model) {
  for (const rel of ["apps/subtitle-generator-pro/privacy/index.html", "apps/subtitle-generator-pro/support/index.html"]) {
    const file = path.join(ROOT, ...rel.split("/"));
    if (!await exists(file)) continue;
    let source = await fs.readFile(file, "utf8");
    const isPrivacy = rel.includes("/privacy/");
    const title = isPrivacy ? "Subtitle Generator Pro Privacy Policy | Aria Vision" : "Subtitle Generator Pro Support | Aria Vision";
    const description = isPrivacy
      ? "Privacy details for Subtitle Generator Pro, including local processing notes, third-party components, and support contact information."
      : "Support information for Subtitle Generator Pro, including setup notes, troubleshooting, privacy links, and contact details.";
    const canonical = `${SITE_URL}/${rel.replace(/index\.html$/, "")}`;
    source = replaceHead(source, head({
      title,
      description,
      canonical,
      prefix: "../../../",
      ogImage: `${SITE_URL}/apps/subtitle-generator-pro/screenshots/screenshot-1.jpg`,
      schema: jsonLd({
        "@context": "https://schema.org",
        "@graph": [
          organization(model.site),
          {
            "@type": "WebPage",
            name: title,
            description,
            url: canonical,
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
        ],
      }),
    }));
    source = source.replace(/mailto:support@ariavisionapps\.com/gi, `mailto:${model.site.contactEmail}`);
    source = source.replace(/support@ariavisionapps\.com/gi, model.site.contactEmail);
    await fs.writeFile(file, source, "utf8");
  }
}

async function writeSitemap(model) {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/privacy/`, priority: "0.5" },
    ...model.categories.map((category) => ({ loc: category.canonicalUrl, priority: "0.7" })),
    ...model.apps.map((app) => ({ loc: app.canonicalUrl, priority: "0.8" })),
    { loc: `${SITE_URL}/apps/subtitle-generator-pro/privacy/`, priority: "0.4" },
    { loc: `${SITE_URL}/apps/subtitle-generator-pro/support/`, priority: "0.4" },
  ];
  const body = urls.map((item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <priority>${item.priority}</priority>
  </url>`).join("\n");
  await fs.writeFile(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`, "utf8");
  await fs.writeFile(path.join(ROOT, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`, "utf8");
}

async function main() {
  const model = JSON.parse(await fs.readFile(path.join(ROOT, "data", "apps-seo.json"), "utf8"));
  const appMap = new Map(model.apps.map((app) => [app.slug, app]));
  await updateHomepage(model);
  for (const app of model.apps) {
    const category = categoryByName(model, app.category);
    await updateAppPage(model, app, appMap, category);
  }
  await writeCategoryPages(model, appMap);
  await updatePrivacy(model);
  await updateSpecialSubtitlePages(model);
  await writeSitemap(model);
  console.log(`Applied SEO model to ${model.apps.length} app pages and ${model.categories.length} category pages.`);
}

await main();
