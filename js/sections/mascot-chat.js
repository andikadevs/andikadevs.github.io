// The mascot chats: every so often, while it's idle, it grumbles a random line in a
// speech bubble (never the same one twice in a row), and a click gets a reaction.
// It keeps quiet during the welcome, while dozing, and while the tab is hidden,
// and the bubble tucks away as soon as the page scrolls (the mascot moves then).
import { pick } from "../core/i18n.js";
import { chatter } from "../data/chatter.js";
import { placeBubble } from "./mascot-bubble.js";
import { onScroll } from "../ds/smooth-scroll.js";

const gap = () => 7000 + Math.random() * 5000;                         // 7–12 s between lines
const readTime = (text) => 2200 + text.length * 45;                     // longer lines stay up longer

export function initMascotChat(fly, bubble, ready = Promise.resolve()) {
  if (!fly || !bubble || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const text = bubble.querySelector("span") ?? bubble;
  let last = "", hideTimer = 0, talking = false;

  const hush = () => { clearTimeout(hideTimer); talking = false; bubble.classList.remove("is-on"); };
  const say = (line) => {
    const r = fly.getBoundingClientRect();
    text.textContent = line;
    placeBubble(bubble, { x: r.left, y: r.top, size: r.width }, [0.05, 14, 18]);   // chatty, not shouty
    bubble.classList.add("is-on");
    talking = true;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hush, readTime(line));
  };
  const quiet = () => document.hidden || fly.classList.contains("is-hello") || fly.classList.contains("is-idle-sleepy");
  const next = () => {
    const set = fly.classList.contains("is-docked") ? chatter.docked : chatter.lines;   // parked in the nav: its own complaints
    const lines = pick(set).filter((l) => l !== last);
    last = lines[Math.floor(Math.random() * lines.length)];
    return last;
  };
  const loop = () => setTimeout(() => { if (!quiet() && !talking) say(next()); loop(); }, gap());

  fly.addEventListener("pointerdown", () => {
    const lines = pick(chatter.boop);
    say(lines[Math.floor(Math.random() * lines.length)]);
  });
  onScroll(() => { if (talking) return hush; });                         // write phase: just hide
  ready.then(() => setTimeout(loop, 6000));                               // start after the welcome
}
