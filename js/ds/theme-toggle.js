// Theme button: the new theme spreads out from the click point as a growing
// circle (View Transitions), falling back to an instant switch where the API
// or motion isn't available. Relies on window.theme from theme.js.
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

export function initThemeToggle(button) {
  button?.addEventListener("click", (event) => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) { window.theme.toggle(); return; }

    const { left, top, width, height } = button.getBoundingClientRect();
    const x = event.clientX || left + width / 2;
    const y = event.clientY || top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    document.startViewTransition(() => window.theme.toggle()).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: EASE, pseudoElement: "::view-transition-new(root)" },
      );
    });
  });
}
