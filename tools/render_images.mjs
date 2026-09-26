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

// The share card, laid out like the hero: my name big on the left, the mascot on the right, in the sky.
const og = `<!doctype html><html><head><link rel="stylesheet" href="${fontsCss}"><style>
  body { margin: 0; width: 1200px; height: 630px; overflow: hidden; position: relative; color: #fff;
         font-family: "Space Grotesk", sans-serif; background: linear-gradient(180deg, #3d8fdb, #3176b9 55%, #2f6aa4); }
  .puff { --c: #fff; position: absolute; width: var(--w); aspect-ratio: 2.6/1; filter: blur(var(--b, 7px)); opacity: var(--o, .8);
    background: radial-gradient(closest-side, var(--c) 55%, transparent) 16% 72%/40% 64% no-repeat,
                radial-gradient(closest-side, var(--c) 55%, transparent) 40% 42%/46% 96% no-repeat,
                radial-gradient(closest-side, var(--c) 55%, transparent) 66% 52%/44% 84% no-repeat,
                radial-gradient(closest-side, var(--c) 55%, transparent) 88% 74%/30% 54% no-repeat,
                radial-gradient(closest-side, var(--c) 65%, transparent) 50% 90%/94% 42% no-repeat; }
  .bank { position: absolute; left: -4%; right: -4%; bottom: -2px; height: 120px; --p: radial-gradient(closest-side, #fff9f1 72%, transparent);
    background: var(--p) -2% 70%/18% 90% no-repeat, var(--p) 12% 45%/18% 95% no-repeat, var(--p) 27% 65%/20% 90% no-repeat,
                var(--p) 42% 40%/18% 95% no-repeat, var(--p) 57% 62%/20% 90% no-repeat, var(--p) 72% 42%/18% 95% no-repeat,
                var(--p) 87% 64%/20% 90% no-repeat, var(--p) 102% 48%/18% 95% no-repeat, linear-gradient(transparent 55%, #fff9f1 75%); }
  .side { position: absolute; left: 44px; top: 50%; translate: 0 -62%; writing-mode: vertical-rl; rotate: 180deg;
          font: 500 13px/1 "JetBrains Mono", monospace; letter-spacing: .24em; text-transform: uppercase; opacity: .85; }
  .copy { position: absolute; left: 100px; top: 96px; width: 700px; }
  .eyebrow { display: flex; align-items: center; gap: 12px; margin: 0 0 20px; font: 500 21px/1 "JetBrains Mono", monospace;
             letter-spacing: .16em; text-transform: uppercase; text-shadow: 0 1px 14px rgb(31 59 109 / .35); }
  .eyebrow::before { content: ""; width: 12px; height: 12px; border-radius: 50%; background: #ffd23f; box-shadow: 0 0 0 6px rgb(255 210 63 / .25); }
  h1 { margin: 0; font: 800 112px/.9 "Bricolage Grotesque"; letter-spacing: -.05em; text-shadow: 0 4px 40px rgb(31 59 109 / .25); }
  h1 span { display: block; } h1 .light { font-weight: 300; letter-spacing: -.055em; }
  .dim { position: relative; margin: 26px 0 0; height: 1px; width: 560px; background: rgb(255 255 255 / .85); }
  .dim::before, .dim::after { content: ""; position: absolute; top: -8px; width: 1px; height: 17px; background: inherit; }
  .dim::before { left: 0; } .dim::after { right: 0; }
  .role { margin: 30px 0 0; font: 500 22px/1.2 "JetBrains Mono", monospace; letter-spacing: .08em; text-transform: uppercase; }
  .role b { font-weight: 500; opacity: .75; }
  .glow { position: absolute; right: 30px; top: 60px; width: 470px; aspect-ratio: 1; border-radius: 50%;
          background: radial-gradient(closest-side, rgb(255 255 255 / .42), transparent); }
  .mark { --accent: #cdeeff; position: absolute; right: 95px; top: 118px; width: 330px; color: #fff; rotate: 4deg;
          filter: drop-shadow(0 18px 34px rgb(31 59 109 / .32)); }
  .mark svg { width: 100%; height: auto; overflow: visible; } .mark .mk-ring { fill: #5da3e3; }
  .bubble { position: absolute; right: 36px; top: 70px; padding: 14px 24px; border-radius: 999px; background: #fff; color: #111c36;
            font: 600 24px/1 "Space Grotesk", sans-serif; box-shadow: 0 12px 28px rgb(31 59 109 / .22); }
  .bubble::after { content: ""; position: absolute; left: 22px; top: 100%; width: 20px; height: 16px; background: #fff; clip-path: polygon(0 0, 100% 0, 0 100%); }
</style></head><body>
  <span class="puff" style="--w:460px; left:-150px; top:-70px"></span>
  <span class="puff" style="--w:360px; right:250px; top:-40px; --o:.55"></span>
  <span class="puff" style="--w:300px; left:520px; top:300px; --o:.3; --b:12px"></span>
  <span class="puff" style="--w:420px; right:-150px; top:380px; --o:.7"></span>
  <p class="side">Backend / Frontend / Ops</p>
  <div class="copy">
    <p class="eyebrow">Hi, I’m</p>
    <h1><span>Andika</span><span class="light">Dwi Saputra</span></h1>
    <div class="dim"></div>
    <p class="role">Fullstack developer <b>· andikadevs.github.io</b></p>
  </div>
  <span class="glow"></span>
  <div class="mark">${heroMark}</div>
  <span class="bubble">Hi there!</span>
  <span class="bank"></span>
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
