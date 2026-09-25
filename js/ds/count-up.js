// Counts [data-count-up] numbers from 0 when they scroll into view.
// Keeps any prefix/suffix around the number ("11+", "100K+", "3×").
export function initCountUp(root = document, { duration = 1400 } = {}) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t) => 1 - Math.pow(1 - t, 4);

  const run = (el) => {
    const match = el.textContent.match(/^(\D*)(\d+)(.*)$/);
    if (!match || reduced) return;
    const [, before, digits, after] = match;
    const target = Number(digits);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));   // rAF time can precede `start`
      el.textContent = before + Math.round(target * ease(t)) + after;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    run(e.target);
  }), { threshold: 0.6 });
  root.querySelectorAll("[data-count-up]:not([data-counted])").forEach((el) => {
    el.dataset.counted = "";
    io.observe(el);
  });
}
