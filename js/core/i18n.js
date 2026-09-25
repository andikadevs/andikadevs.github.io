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
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
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
