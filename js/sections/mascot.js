// Every .mascot on the page looks at the pointer: its eyes shift a few percent
// toward the cursor (--lx/--ly, read by css/site.css), eased and capped.
export function initMascots(root = document) {
  const mascots = [...root.querySelectorAll(".mascot")];
  if (!mascots.length || !matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;

  let frame = 0;
  addEventListener("pointermove", (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => mascots.forEach((m) => {
      const { left, top, width, height } = m.getBoundingClientRect();
      const dx = event.clientX - (left + width / 2), dy = event.clientY - (top + height / 2);
      const len = Math.hypot(dx, dy) || 1, reach = Math.min(len / 300, 1);
      m.style.setProperty("--lx", `${((dx / len) * reach * 5).toFixed(2)}%`);
      m.style.setProperty("--ly", `${((dy / len) * reach * 5).toFixed(2)}%`);
    }));
  }, { passive: true });
}
