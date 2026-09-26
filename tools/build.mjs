// Generates everything that's derived from the site's own files, so nothing is
// written twice. Run from the repo root after editing content or styles:
//
//   node tools/build.mjs
//
//   css/app.css                one minified stylesheet (fonts + tokens + base + components + lenis + site)
//   index.html  <!-- head -->  meta, canonical, hreflang, Open Graph, Twitter, icons, font preloads
//               (no modulepreload: measured, it competes with CSS/fonts and slows first paint on mobile)
//   index.html  <!-- jsonld --> Person / WebSite / ProfilePage / Organization / projects ItemList
//   index.html  <!-- noscript --> plain-HTML project list for crawlers without JS
//   sitemap.xml, robots.txt, llms.txt, llms-full.txt, manifest.webmanifest
//
// No dependencies: Node's own fs and the ES-module data files in js/data.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { profile, experience, education, highlights, clients } from "../js/data/profile.js";
import { projects, DISCIPLINES } from "../js/data/projects.js";
import { strings } from "../js/data/strings.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://andikadevs.github.io";
const TODAY = new Date().toISOString().slice(0, 10);
const OG_IMAGE = { url: `${SITE}/assets/img/og.jpg`, width: 1200, height: 630 };
const en = strings.en;

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const write = (p, s) => { writeFileSync(join(ROOT, p), s); console.log("  wrote", p, `(${(Buffer.byteLength(s) / 1024).toFixed(1)} KB)`); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => `${SITE}/${p.replace(/^\.?\//, "")}`;

// Cache-busting: a short content hash in the URL, so a new build is fetched
// straight away instead of waiting out GitHub Pages' 10-minute browser cache.
const hash = (text) => createHash("sha1").update(text).digest("hex").slice(0, 10);
const jsVersion = () => hash(readdirSync(join(ROOT, "js"), { recursive: true }).filter((f) => f.endsWith(".js") || f.endsWith(".mjs")).sort().map((f) => read(`js/${f}`)).join(""));

function inject(html, name, content) {
  const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(html)) throw new Error(`index.html needs one <!-- ${name}:start --> … <!-- ${name}:end --> block`);
  return html.replace(re, `$1\n${content}\n  $2`);
}

// ---- CSS -------------------------------------------------------------------
function buildCss() {
  const fonts = read("fonts/fonts.css").replace(/url\(([^)]+)\)/g, (_, f) => `url(../fonts/${f.replace(/^["']|["']$/g, "")})`);
  const parts = ["css/tokens.css", "css/base.css", "css/components.css", "css/lenis.css", "css/site.css"]
    .map((f) => read(f).replace(/@import[^;]+;/g, ""));
  const css = [fonts, ...parts].join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")            // comments
    .replace(/\s+/g, " ")                         // whitespace runs
    .replace(/\s*([{};,>])\s*/g, "$1")            // around punctuation (not ':' — breaks selectors like `a :hover`)
    .replace(/;}/g, "}")
    .trim();
  write("css/app.css", css + "\n");
}

// ---- Head ------------------------------------------------------------------
function head() {
  const fontFiles = [...read("fonts/fonts.css").matchAll(/\/\* latin \*\/\s*@font-face \{([^}]*)\}/g)]
    .map(([, block]) => ({ family: block.match(/font-family: '([^']+)'/)?.[1], file: block.match(/url\(([^)]+)\)/)?.[1] }))
    .filter((f) => ["Bricolage Grotesque", "Space Grotesk"].includes(f.family));
  const lines = [
    `<title>${esc(en["meta.title"])}</title>`,
    `<meta name="description" content="${esc(en["meta.description"])}">`,
    `<meta name="author" content="${esc(profile.name)}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    `<link rel="canonical" href="${SITE}/">`,
    `<link rel="alternate" hreflang="en" href="${SITE}/">`,
    `<link rel="alternate" hreflang="id" href="${SITE}/?lang=id">`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}/">`,
    `<link rel="author" href="${SITE}/llms.txt" type="text/plain">`,
    ...profile.socials.map((s) => `<link rel="me" href="${s.url}">`),   // identity: these profiles are me
    ``,
    `<meta property="og:type" content="profile">`,
    `<meta property="og:site_name" content="andikadevs">`,
    `<meta property="og:url" content="${SITE}/">`,
    `<meta property="og:title" content="${esc(en["meta.title"])}">`,
    `<meta property="og:description" content="${esc(en["meta.description"])}">`,
    `<meta property="og:image" content="${OG_IMAGE.url}">`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}">`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}">`,
    `<meta property="og:image:secure_url" content="${OG_IMAGE.url}">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta property="og:image:alt" content="${esc(en["meta.ogAlt"])}">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta property="og:locale:alternate" content="id_ID">`,
    `<meta property="profile:first_name" content="Andika">`,
    `<meta property="profile:last_name" content="Dwi Saputra">`,
    `<meta property="profile:username" content="andikadevs">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(en["meta.title"])}">`,
    `<meta name="twitter:description" content="${esc(en["meta.description"])}">`,
    `<meta name="twitter:image" content="${OG_IMAGE.url}">`,
    `<meta name="twitter:image:alt" content="${esc(en["meta.ogAlt"])}">`,
    ``,
    `<meta name="theme-color" content="#3d8fdb" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="#0b1733" media="(prefers-color-scheme: dark)">`,
    `<meta name="color-scheme" content="light dark">`,
    `<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" href="assets/img/favicon-32.png" type="image/png" sizes="32x32">`,
    `<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">`,
    `<link rel="manifest" href="manifest.webmanifest">`,
    ``,
    ...fontFiles.map((f) => `<link rel="preload" href="fonts/${f.file}" as="font" type="font/woff2" crossorigin>`),
    `<link rel="stylesheet" href="css/app.css?v=${hash(read("css/app.css"))}">`,
  ];
  return lines.map((l) => (l ? `  ${l}` : "")).join("\n");
}

// ---- JSON-LD ---------------------------------------------------------------
function jsonld() {
  const person = `${SITE}/#person`;
  const graph = [
    {
      "@type": "Person", "@id": person,
      name: profile.name, alternateName: "andikadevs", givenName: "Andika", familyName: "Dwi Saputra",
      jobTitle: "Fullstack Developer",
      description: en["hero.lead"],
      url: `${SITE}/`, email: `mailto:${profile.email}`,
      image: { "@type": "ImageObject", "@id": `${SITE}/#portrait`, url: abs("assets/img/andika.webp"), width: 720, height: 720, caption: profile.name },
      hasOccupation: { "@type": "Occupation", name: "Fullstack Developer", occupationLocation: { "@type": "City", name: "Semarang" }, skills: "TypeScript, NestJS, Laravel, React, Next.js, PostgreSQL, Docker" },
      address: { "@type": "PostalAddress", addressLocality: "Semarang", addressRegion: "Central Java", addressCountry: "ID" },
      nationality: { "@type": "Country", name: "Indonesia" },
      knowsLanguage: ["en", "id", "jv"],
      knowsAbout: ["TypeScript", "NestJS", "Laravel", "React", "Next.js", "PostgreSQL", "Redis", "Docker", "OpenID Connect", "Single sign-on", "Web development", "Web design", "Company profile websites", "Portfolio websites", "AI pipelines"],
      worksFor: [
        { "@type": "Organization", name: "Toploker.com", url: "https://toploker.com" },
        { "@type": "CollegeOrUniversity", name: "Universitas STEKOM", url: "https://stekom.ac.id" },
      ],
      alumniOf: education.map((e) => ({ "@type": e.school.includes("Universitas") ? "CollegeOrUniversity" : "HighSchool", name: e.school })),
      award: ["1st place, LKS Web Technology, Banjarnegara (2024)", "Champion, LKS IT Software Solution for Business, Banjarnegara (2023)"],
      sameAs: profile.socials.map((s) => s.url),
    },
    {
      "@type": "Organization", "@id": `${SITE}/#manggala`,
      name: "Manggala Cloud", url: "https://www.manggala.cloud", founder: { "@id": person },
      description: en["studio.body"],
    },
    {
      "@type": "WebSite", "@id": `${SITE}/#website`,
      url: `${SITE}/`, name: "andikadevs", alternateName: profile.name, description: en["meta.description"],
      inLanguage: ["en", "id"], publisher: { "@id": person },
    },
    {
      "@type": "ProfilePage", "@id": `${SITE}/#webpage`,
      url: `${SITE}/`, name: en["meta.title"], isPartOf: { "@id": `${SITE}/#website` },
      mainEntity: { "@id": person }, about: { "@id": person },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height, caption: en["meta.ogAlt"] },
      image: { "@id": `${SITE}/#portrait` },
      inLanguage: "en", dateModified: TODAY,
    },
    {
      "@type": "ItemList", "@id": `${SITE}/#work`, name: "Selected work", numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem", position: i + 1,
        item: {
          "@type": "CreativeWork", "@id": `${SITE}/#project/${p.slug}`,
          name: p.title.en, headline: p.category.en, description: p.summary.en,
          url: p.url ?? `${SITE}/#project/${p.slug}`, image: abs(p.cover),
          dateCreated: String(p.year), creator: { "@id": person },
          keywords: [...p.stack, ...p.disciplines.map((d) => DISCIPLINES[d].en)].join(", "),
          sourceOrganization: { "@type": "Organization", name: p.client },
        },
      })),
    },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c");
  return `  <script type="application/ld+json">\n${json}\n  </script>`;
}

// ---- noscript fallback -----------------------------------------------------
function noscript() {
  const items = projects.map((p) =>
    `      <li><h3>${esc(p.title.en)}</h3><p>${esc(p.category.en)} · ${esc(p.client)} · ${p.year}. ${esc(p.summary.en)}</p>${p.url ? `<p><a href="${esc(p.url)}">${esc(p.url)}</a></p>` : ""}</li>`);
  return `      <noscript>\n    <ol class="noscript-work">\n${items.join("\n")}\n    </ol>\n      </noscript>`;
}

// ---- sitemap, robots, manifest ----------------------------------------------
function sitemap() {
  const alt = `    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/"/>\n    <xhtml:link rel="alternate" hreflang="id" href="${SITE}/?lang=id"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`;
  const images = [OG_IMAGE.url, abs("assets/img/andika.webp"), ...projects.map((p) => abs(p.cover))]
    .map((u) => `    <image:image><image:loc>${u}</image:loc></image:image>`).join("\n");
  const url = (loc, withImages) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n${alt}\n${withImages ? images + "\n" : ""}  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${url(`${SITE}/`, true)}
${url(`${SITE}/?lang=id`, false)}
</urlset>
`;
}

const robots = () => `# andikadevs.github.io — everyone is welcome, search engines and AI assistants alike.
User-agent: *
Allow: /

# AI crawlers: allowed. A plain-text summary is at /llms.txt, the full text at /llms-full.txt.
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

const manifest = () => JSON.stringify({
  name: `${profile.name} — Fullstack Developer`,
  short_name: "andikadevs",
  description: en["meta.description"],
  start_url: "./", scope: "./", display: "standalone", lang: "en",
  background_color: "#fff9f1", theme_color: "#3d8fdb",
  icons: [
    { src: "assets/img/favicon.svg", sizes: "any", type: "image/svg+xml" },
    { src: "assets/img/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "assets/img/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "assets/img/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2) + "\n";

// ---- llms.txt / llms-full.txt (https://llmstxt.org) --------------------------
function llms() {
  const socials = profile.socials.map((s) => `- [${s.label}](${s.url}): ${s.handle}`).join("\n");
  const work = projects.map((p) => `- [${p.title.en}](${SITE}/#project/${p.slug}): ${p.category.en}, ${p.client}, ${p.year}. ${p.summary.en}`).join("\n");
  return `# ${profile.name} (andikadevs)

> Fullstack developer in Semarang, Indonesia. ${en["hero.lead"]} Open to remote roles.

${en["intro.text"]} ${en["intro.strong"]}

## Work

${work}

## Experience

${experience.map((e) => `- ${e.role.en}, ${e.org} (${e.period.en}): ${e.body.en}`).join("\n")}

## Contact

- Email: ${profile.email}
${socials}
- CV (PDF): ${abs(profile.cv)}

## Optional

- [Full text of every case study](${SITE}/llms-full.txt)
- [Sitemap](${SITE}/sitemap.xml)
`;
}

function llmsFull() {
  const study = (p) => `### ${p.title.en}

- Category: ${p.category.en}
- Client: ${p.client}
- Year: ${p.year}
- Link: ${p.url ?? `${SITE}/#project/${p.slug}`} ${p.url ? "" : "(internal system, not public)"}
- Stack: ${p.stack.join(", ")}
- Areas: ${p.disciplines.map((d) => DISCIPLINES[d].en).join(", ")}

${p.summary.en}

**The problem.** ${p.problem.en}

**What I did.** ${p.approach.en}

**Results.** ${p.metrics.map((m) => `${m.value} (${m.label.en})`).join("; ")}.
`;
  return `# ${profile.name} (andikadevs): full profile

> Fullstack developer in Semarang, Indonesia, open to remote roles. This file is the complete text of ${SITE}/ in plain Markdown. An Indonesian version of the site is at ${SITE}/?lang=id.

## About

${en["hero.lead"]}

${en["intro.text"]} ${en["intro.strong"]}

Built for: ${clients.map((c) => c.name).join(", ")}.

## Numbers

${highlights.map((h) => `- ${h.value} ${h.title.en}: ${h.body.en}`).join("\n")}

## Case studies

${projects.map(study).join("\n")}
## Experience

${experience.map((e) => `- **${e.role.en}**, ${e.org} (${e.period.en}). ${e.body.en} (${e.tags.join(", ")})`).join("\n")}

## Education

${education.map((e) => `- ${e.school} (${e.period}): ${e.degree.en}`).join("\n")}

## Side studio

${en["studio.body"]} https://www.manggala.cloud

## Contact

- Email: ${profile.email}
${profile.socials.map((s) => `- ${s.label}: ${s.url}`).join("\n")}
- CV (PDF): ${abs(profile.cv)}
`;
}

// ---- run ---------------------------------------------------------------------
console.log("build:");
buildCss();
let html = read("index.html");
html = inject(html, "head", head());
html = inject(html, "jsonld", jsonld());
html = inject(html, "noscript", noscript());
html = html.replace(/<script type="module" src="js\/main\.js(\?v=[^"]*)?"><\/script>/, `<script type="module" src="js/main.js?v=${jsVersion()}"></script>`);
write("index.html", html);
write("sitemap.xml", sitemap());
write("robots.txt", robots());
write("manifest.webmanifest", manifest());
write("llms.txt", llms());
write("llms-full.txt", llmsFull());
