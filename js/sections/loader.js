// Page loader: my signature writes itself one stroke at a time (each stroke's
// duration follows its length, like a pen), holds a beat, erases from the start
// of each stroke, and then the cover — one giant scribble — thins out and pulls
// away to reveal the page. Returns a promise that resolves as the reveal starts,
// so the page's own entrances (reveals, the mascot's hello) play after it.
const DRAW = [0.28, 0.62];             // seconds for the shortest / longest stroke
const HOLD = 350, ERASE = 800, WIPE = 1250;

const wait = (a) => a.finished.catch(() => {});

export function initLoader(loader) {
  if (!loader) return Promise.resolve();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { loader.remove(); return Promise.resolve(); }
  loader.style.animation = "none";                                     // the script is in charge now: cancel the failsafe

  const strokes = [...loader.querySelectorAll(".loader__signature mask path")];   // animate the pen, not the ink
  const cover = loader.querySelector(".loader__cover path");
  const lengths = strokes.map((p) => p.getTotalLength());
  const longest = Math.max(...lengths);

  return new Promise((resolve) => {
    (async () => {
      for (const [i, path] of strokes.entries()) {                     // write, one stroke after another
        const seconds = DRAW[0] + (DRAW[1] - DRAW[0]) * (lengths[i] / longest);
        await wait(path.animate(
          [{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1 }],
          { duration: seconds * 1000, easing: "cubic-bezier(0.45, 0.05, 0.55, 0.95)", fill: "forwards" },
        ));
      }
      await new Promise((r) => setTimeout(r, HOLD));

      const erase = strokes.map((path, i) => path.animate(               // un-write, from each stroke's start
        [{ strokeDashoffset: 0, opacity: 1 }, { opacity: 1, offset: 0.9 }, { strokeDashoffset: -1, opacity: 0 }],   // fade the last bit: round caps leave a dot
        { duration: ERASE, delay: i * 30, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      ));
      await new Promise((r) => setTimeout(r, 350));

      resolve();                                                        // the page starts its entrance under the wipe
      await wait(cover.animate(
        [{ strokeDashoffset: 0, strokeWidth: "80%" }, { strokeDashoffset: -1, strokeWidth: "5%" }],
        { duration: WIPE, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" },
      ));
      await Promise.all(erase.map(wait));
      loader.remove();
    })();
  });
}
