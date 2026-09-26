// Language state. English is the default; a saved choice or ?lang= overrides it.
// Static copy is marked in HTML with data-i18n / data-i18n-attr; dynamic sections
// re-render on the "langchange" event and read text through t() and pick().
import { strings } from "../data/strings.js";

const KEY = "lang";
const LANGS = Object.keys(strings);
const DEFAULT = "en";

let current = DEFAULT;

const stored = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const persist = (lang) => { try { localStorage.setItem(KEY, lang); } catch { /* private mode */ } };
const valid = (lang) => (LANGS.includes(lang) ? lang : null);

export const lang = () => current;

export const t = (key) => strings[current][key] ?? strings[DEFAULT][key] ?? key;

// Reads an { en, id } pair (or passes a plain value through).
export const pick = (value) =>
  value && typeof value === "object" && DEFAULT in value ? value[current] ?? value[DEFAULT] : value;

function applyStatic(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      el.setAttribute(attr, t(key));
    });
  });
  document.documentElement.lang = current;
  document.title = t("meta.title");
  applyHead();
}

// The <head> follows the language too, so the ?lang=id page describes itself:
// its own canonical URL (matching the hreflang alternates), title, description and locale.
const LOCALE = { en: "en_US", id: "id_ID" };
function applyHead() {
  const set = (selector, attr, value) => document.head.querySelector(selector)?.setAttribute(attr, value);
  const url = new URL(document.querySelector('link[rel="canonical"]')?.href ?? location.href);
  url.search = current === DEFAULT ? "" : `?lang=${current}`;
  url.hash = "";
  set('link[rel="canonical"]', "href", url.href);
  set('meta[property="og:url"]', "content", url.href);
  for (const [selector, key] of [
    ['meta[name="description"]', "meta.description"], ['meta[property="og:description"]', "meta.description"],
    ['meta[name="twitter:description"]', "meta.description"], ['meta[property="og:title"]', "meta.title"],
    ['meta[name="twitter:title"]', "meta.title"], ['meta[property="og:image:alt"]', "meta.ogAlt"], ['meta[name="twitter:image:alt"]', "meta.ogAlt"],
  ]) set(selector, "content", t(key));
  set('meta[property="og:locale"]', "content", LOCALE[current]);
  set('meta[property="og:locale:alternate"]', "content", LOCALE[current === "en" ? "id" : "en"]);
}

export function setLang(next, { save = true } = {}) {
  current = valid(next) ?? DEFAULT;
  if (save) persist(current);
  applyStatic();
  document.dispatchEvent(new CustomEvent("langchange", { detail: current }));
}

export function initI18n() {
  const fromUrl = valid(new URLSearchParams(location.search).get("lang"));
  setLang(fromUrl ?? valid(stored()) ?? DEFAULT, { save: Boolean(fromUrl) });
}
