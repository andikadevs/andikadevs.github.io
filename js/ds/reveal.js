// Fades [data-reveal] elements up once they enter the viewport.
// Children of [data-reveal-group] get a staggered delay via --i.
export function initReveal(root = document) {
  root.querySelectorAll("[data-reveal-group]").forEach((group) => {
    [...group.querySelectorAll("[data-reveal]")].forEach((el, i) => el.style.setProperty("--i", i % 8));
  });

  const io = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  root.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
}
