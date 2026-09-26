// Idle moves: every few seconds the mascot does one small thing: hops, twirls,
// wiggles, juggles its packet, dozes off, winks, shakes its head or stretches.
// It also reacts: hovering plays one hop, wiggle or wink (once, never a loop),
// a click or tap "boops" it (squash, happy eyes, packet tossed; interrupts
// whatever it was doing), and keyboard focus gets a wink. Each move is a
// class (.is-idle-<name>) whose main keyframes are named idle-<name>; the class
// comes off when that animation ends. The moves use the individual translate /
// rotate / scale properties, so they ride on top of the base float, not replace it.
const MOVES = ["hop", "twirl", "wiggle", "juggle", "sleepy", "wink", "shake", "stretch"];
const HOVER = ["hop", "wiggle", "wink"];
const pick = (list, not) => { const l = list.filter((m) => m !== not); return l[Math.floor(Math.random() * l.length)]; };
const pause = () => 3500 + Math.random() * 4000;                       // 3.5–7.5 s between moves

export function initMascotIdle(mascot) {
  if (!mascot || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let current = null, last = null, timer = 0;

  const busy = () => current || mascot.classList.contains("is-hello") || document.hidden;
  const play = (move, { force = false } = {}) => {
    if (force && current) { mascot.classList.remove(`is-idle-${current}`); void mascot.offsetWidth; current = null; }   // restart cleanly
    if (busy()) return false;
    clearTimeout(timer);
    current = move;
    mascot.classList.add(`is-idle-${move}`);
    return true;
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!play(pick(MOVES, last))) schedule();
    }, pause());
  };

  mascot.addEventListener("animationend", (event) => {
    if (!current || event.animationName !== `idle-${current}`) return;
    mascot.classList.remove(`is-idle-${current}`);
    last = current; current = null;
    schedule();
  });
  mascot.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") play(pick(HOVER, last)); });
  mascot.addEventListener("pointerdown", () => play("boop", { force: true }));
  mascot.addEventListener("focus", () => { if (mascot.matches(":focus-visible")) play("wink"); });
  setTimeout(schedule, 4500);                                          // after the welcome
}
