// Renders the raster images the <head> points at, from the site's own SVG mark
// and fonts: the Open Graph card and the PNG icons. Needs a local Chrome and
// playwright-core (not a site dependency — install it wherever you like):
//
//   npm i -g playwright-core      (or: NODE_PATH=/path/to/node_modules)
//   CHROME=/usr/bin/google-chrome node tools/render_images.mjs
//
//   assets/img/og.jpg               1200×630 share card
//   assets/img/favicon-32.png       32×32
//   assets/img/apple-touch-icon.png 180×180
//   assets/img/icon-192.png, icon-512.png  (web manifest)
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const heroMark = readFileSync(join(ROOT, "index.html"), "utf8").match(/<!-- heromark:start -->([\s\S]*?)<!-- heromark:end -->/)[1];
const fontsCss = pathToFileURL(join(ROOT, "fonts/fonts.css")).href;

const og = `<!doctype html><html><head><link rel="stylesheet" href="${fontsCss}"><style>
  body { margin: 0; width: 1200px; height: 630px; overflow: hidden; font-family: "Space Grotesk", sans-serif;
         background: linear-gradient(180deg, #71b7f4, #5788b3); color: #fff; position: relative; }
  .cloud { position: absolute; width: var(--w); aspect-ratio: 2.6/1; filter: blur(8px); opacity: var(--o, .85);
    background: radial-gradient(closest-side, #fff 55%, transparent) 16% 72%/40% 64% no-repeat,
                radial-gradient(closest-side, #fff 55%, transparent) 40% 42%/46% 96% no-repeat,
                radial-gradient(closest-side, #fff 55%, transparent) 66% 52%/44% 84% no-repeat,
                radial-gradient(closest-side, #fff 65%, transparent) 50% 90%/94% 42% no-repeat; }
  .inner { position: absolute; inset: 0; display: grid; grid-template-columns: 250px 1fr; align-items: center; gap: 56px; padding: 0 90px; }
  .mark { --accent: #cdeeff; color: #fff; width: 250px; filter: drop-shadow(0 16px 30px rgb(31 59 109 / .3)); }
  .mark svg { width: 100%; height: auto; overflow: visible; } .mark .mk-ring { fill: #5da3e3; }
  h1 { margin: 0; font: 800 96px/.95 "Bricolage Grotesque"; letter-spacing: -.045em; text-shadow: 0 4px 40px rgb(31 59 109 / .22); }
  h1 span { display: block; } h1 .light { font-weight: 300; }
  p { margin: 26px 0 0; font: 500 22px/1.3 "JetBrains Mono", monospace; letter-spacing: .08em; text-transform: uppercase; opacity: .92; }
</style></head><body>
  <span class="cloud" style="--w:520px; left:-120px; top:-60px"></span>
  <span class="cloud" style="--w:420px; right:-80px; bottom:-70px; --o:.7"></span>
  <div class="inner"><div class="mark">${heroMark}</div>
  <div><h1><span>Developer</span><span class="light">who ships</span><span>systems.</span></h1>
  <p>Andika Dwi Saputra · andikadevs.github.io</p></div></div>
</body></html>`;

// iOS paints transparent corners black, so the touch icon gets a solid sky background.
const icon = (size, solid = false) => `<!doctype html><html><body style="margin:0;background:${solid ? "#3f8fd6" : "transparent"}">
  <img src="${pathToFileURL(join(ROOT, "assets/img/favicon.svg")).href}" width="${size}" height="${size}" style="display:block"></body></html>`;

// Pages are written to a temp file and opened by URL: a setContent() page can't load file:// fonts.
const tmp = mkdtempSync(join(tmpdir(), "andikadevs-render-"));
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/bin/google-chrome" });
const shot = async (html, w, h, path, opts = {}) => {
  const file = join(tmp, path.replace(/\W+/g, "_") + ".html");
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(ROOT, path), omitBackground: !opts.jpeg && !opts.opaque, type: opts.jpeg ? "jpeg" : "png", quality: opts.jpeg ? 86 : undefined });
  await page.close();
  console.log("  wrote", path);
};
await shot(og, 1200, 630, "assets/img/og.jpg", { jpeg: true });
for (const [size, name, solid] of [[32, "favicon-32.png"], [180, "apple-touch-icon.png", true], [192, "icon-192.png"], [512, "icon-512.png"]]) {
  await shot(icon(size, solid), size, size, `assets/img/${name}`, { opaque: solid });
}
await browser.close();
