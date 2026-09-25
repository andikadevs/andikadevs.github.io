// Wraps each word of [data-split] in spans so CSS can animate words one by one.
// Sets --wi (word index) on every word and --wn (word count) on the element.
// Safe to call again after the text changes (e.g. a language switch).
export function splitWords(root = document) {
  root.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent.trim().replace(/\s+/g, " ");
    if (el.dataset.splitText === text && el.querySelector(".w")) return;
    el.dataset.splitText = text;
    el.setAttribute("aria-label", text);

    const words = text.split(" ");
    el.style.setProperty("--wn", words.length);
    el.replaceChildren(...words.flatMap((word, i) => {
      const outer = document.createElement("span");
      outer.className = "w";
      outer.setAttribute("aria-hidden", "true");
      outer.style.setProperty("--wi", i);
      const inner = document.createElement("span");
      inner.textContent = word;
      outer.append(inner);
      return i < words.length - 1 ? [outer, " "] : [outer];
    }));
  });
}
