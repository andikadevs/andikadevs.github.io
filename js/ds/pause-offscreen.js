// Marks [data-pause-offscreen] elements with [data-offscreen] while they're out
// of view, so CSS can pause their animations and the compositor rests.
export function initPauseOffscreen(root = document) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
  }), { rootMargin: "120px 0px" });
  root.querySelectorAll("[data-pause-offscreen], [data-hero], [data-night], .ocean, [data-studio], .hire__sky, .cloudbank").forEach((el) => io.observe(el));
}
