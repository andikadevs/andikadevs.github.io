// Day / night theme. Saved choice wins, else the system preference.
// Load this file in <head> as a classic script so the theme is set before first paint;
// it also exposes a small API for the toggle button.
(() => {
  const KEY = "theme";
  const root = document.documentElement;
  const system = () => (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const save = (value) => { try { localStorage.setItem(KEY, value); } catch { /* private mode */ } };
  const apply = (value) => { root.dataset.theme = value; };

  apply(read() ?? system());

  window.theme = {
    get: () => root.dataset.theme,
    toggle() {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      apply(next);
      save(next);
      return next;
    },
  };
})();
