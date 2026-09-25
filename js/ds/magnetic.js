// [data-magnetic] elements lean toward the pointer, then spring back.
export function initMagnetic(root = document, { strength = 0.28 } = {}) {
  if (!matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;

  root.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (event.clientX - left - width / 2) * strength;
      const y = (event.clientY - top - height / 2) * strength;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener("pointerleave", () => { el.style.translate = ""; });
  });
}
