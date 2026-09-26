// Text roll: on hover the label slides up and a copy rolls in from below, one
// letter after another. The readable text stays as one plain span; only the
// incoming copy is split into letters, and it's hidden from screen readers.
// The roll lives in its own inner span, so the host element keeps its own
// overflow and pseudo-elements. Re-run it after the text changes (e.g. on a
// language switch); it's idempotent.
export function rollify(selector, root = document) {
  root.querySelectorAll(selector).forEach((el) => {
    const text = (el.querySelector(".roll__a")?.textContent ?? el.textContent).trim();
    if (!text || (el.dataset.rolled === text && el.querySelector(".roll__a"))) return;
    el.dataset.rolled = text;
    const plain = document.createElement("span");
    plain.className = "roll__a";
    plain.textContent = text;

    const copy = document.createElement("span");
    copy.className = "roll__b";
    copy.setAttribute("aria-hidden", "true");
    [...text].forEach((ch, i) => {
      const c = document.createElement("span");
      c.textContent = ch === " " ? " " : ch;
      c.style.setProperty("--i", i);
      copy.append(c);
    });
    const roll = document.createElement("span");
    roll.className = "roll";
    roll.append(plain, copy);
    el.replaceChildren(roll);
  });
}
