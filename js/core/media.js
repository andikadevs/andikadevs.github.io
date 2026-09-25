// Responsive image attributes for project screenshots. tools/optimize_images.py
// writes <name>-800.webp next to every <name>.webp (1600px), so both widths exist.
const small = (src) => src.replace(/\.webp$/, "-800.webp");

export const srcset = (src) => `${small(src)} 800w, ${src} 1600w`;
