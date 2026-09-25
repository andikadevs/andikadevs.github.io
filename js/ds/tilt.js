// Subtle pointer parallax: children with [data-depth] drift against the cursor.
export function initParallax(scene) {
  if (!scene || matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches) return;
  const layers = [...scene.querySelectorAll("[data-depth]")];
  let frame = 0;

  scene.addEventListener("pointermove", (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const { left, top, width, height } = scene.getBoundingClientRect();
      const x = (event.clientX - left) / width - 0.5;
      const y = (event.clientY - top) / height - 0.5;
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth);
        layer.style.translate = `${-x * depth}px ${-y * depth}px`;
      });
    });
  });
}
