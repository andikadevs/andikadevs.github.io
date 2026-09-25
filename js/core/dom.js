// Tiny DOM helpers. `html` escapes every interpolated value unless it is
// already a trusted fragment produced by `html` itself; arrays are joined.

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (value) => String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

class Trusted {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

const serialize = (value) => {
  if (value == null || value === false) return "";
  if (value instanceof Trusted) return value.value;
  if (Array.isArray(value)) return value.map(serialize).join("");
  return escape(value);
};

export const html = (strings, ...values) =>
  new Trusted(strings.reduce((out, str, i) => out + str + (i < values.length ? serialize(values[i]) : ""), ""));

export const render = (el, fragment) => { if (el) el.innerHTML = serialize(fragment); };

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
