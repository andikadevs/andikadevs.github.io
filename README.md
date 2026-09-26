# andika — portfolio

Personal portfolio of Andika Dwi Saputra. Plain HTML, CSS and ES modules: no build step,
no framework, no dependencies. Deploys to GitHub Pages as-is.

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

ES modules need a server; opening `index.html` from the file system won't load the scripts.

## Deploy (GitHub Pages)

Live at **https://andikadevs.github.io/**: this folder is the `andikadevs/andikadevs.github.io`
repo, served by GitHub Pages from `main` (root). Push to `main` and it redeploys.

All paths are relative, so the site also works under a sub-path. `.nojekyll` stops Jekyll
from touching the files; `404.html` finds its way home in both setups.

## Structure

```
index.html              page shell + English copy (readable without JS)
404.html                self-contained not-found page
css/
  tokens.css            ┐
  base.css              ├ Blueprint design system (source: ~/Designs/blueprint-ds)
  components.css        ┘
  site.css              page layout only: arranges components, defines no new ones
js/
  theme.js              day/night, runs in <head> before first paint
  main.js               entry: wires data → sections → interactions
  core/dom.js           html`` template (auto-escapes) + render()
  core/i18n.js          language state, t(), pick(), static [data-i18n] pass
  ds/*.js               design-system behaviours: smooth scroll (Lenis, vendored, MIT),
                        scroll progress → CSS --p, split text, count-up, magnetic, marquee…
  sections/*.js         one file per page section; data in, markup out
  data/projects.js      case studies
  data/profile.js       bio, experience, education, highlights, stack, socials
  data/strings.js       interface copy, EN + ID
assets/                 images, logos, CV
fonts/                  self-hosted Google Fonts (OFL)
tools/                  glyphs.py, mark.py, build_brand.py: regenerate the logo, favicon and footer wordmark
                        from the display font (pip install fonttools brotli)
```

## Motion

Scroll effects are written in CSS. `ds/scroll-progress.js` writes `--p` (0 → 1 as an element
crosses the viewport) onto every `[data-scroll]` element, and `site.css` turns that into
transforms inside `@media (prefers-reduced-motion: no-preference)`. With reduced motion,
Lenis is skipped and every effect is off.

## Build scripts

The site runs straight from the source files. These regenerate the derived bits; run them
after editing and commit the output:

- `node tools/build.mjs`: `css/app.css` (one minified stylesheet), the `<head>` meta/OG/hreflang
  block, JSON-LD, the `<noscript>` project list, `sitemap.xml`, `robots.txt`,
  `llms.txt`, `llms-full.txt`, `manifest.webmanifest`. All from `js/data/*`, so nothing is typed twice.
- `python3 tools/build_brand.py`: nav/hero mark, favicon.svg and the footer wordmark (needs fonttools).
- `python3 tools/signature.py`: the loader's signature (slanted, broad-nib strokes plus the masks that draw them) into `index.html`.
- `python3 tools/optimize_images.py`: 1600px + 800px screenshots, logos, photo (needs Pillow).
- `node tools/render_images.mjs`: `og.jpg` and PNG icons (needs playwright-core + Chrome).

## Editing content

- **A project** → add an object to `js/data/projects.js`; it joins the Work carousel and the
  case-study dialog. Screenshots go in `assets/projects/<dir>/`:
  the first is the cover, the rest become the case-study gallery.
- **Any visible text** → it's either an `{ en, id }` pair in `js/data/*` or a key in
  `js/data/strings.js`. Both languages must have the same keys; missing ones fall back to English.
- **Colours, spacing, motion** → `css/tokens.css`. Nothing else hard-codes a value.

## i18n

English is the default. The language switch saves the choice; `?lang=id` forces Indonesian
(handy for sharing). A case study can be linked directly: `#project/stekom-passport`.

## Updating the design system

The three `css/` token/base/component files and `js/ds/` are copies from `~/Designs/blueprint-ds`.
Change them there, then run `./sync-ds.sh`.
