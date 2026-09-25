// Inline SVG icons shared by the section renderers.
import { html } from "../core/dom.js";

const svg = (body, cls = "btn__icon") =>
  html`<svg class="${cls}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const arrow = () => svg(html`<path d="M2 8h11M9 4l4 4-4 4"/>`);
export const external = () => svg(html`<path d="M4 12 12 4M5 4h7v7"/>`, "btn__icon btn__icon--diag");
export const close = () => svg(html`<path d="M4 4l8 8M12 4l-8 8"/>`, "");
