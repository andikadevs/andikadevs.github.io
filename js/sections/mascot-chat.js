// The mascot chats. Every 7–12 s while it's idle it grumbles a line, and what it
// says depends on where it is and what's going on: resting beside the headline,
// parked in the nav (and which section you're reading), the time of day, the dark
// theme, how long you've been still. It also reacts to being clicked (with streaks),
// hovered, the theme and language switches, and you coming back to the tab.
// Lines never repeat until eight others have been said. Quiet during the welcome,
// while dozing and while the tab is hidden; the bubble tucks away on scroll.
import { pick } from "../core/i18n.js";
import { chatter } from "../data/chatter.js";
import { placeBubble } from "./mascot-bubble.js";
import { onScroll } from "../ds/smooth-scroll.js";
import { babble, boop, sad } from "./robot-voice.js";

const gap = () => 7000 + Math.random() * 5000;                         // 7–12 s between lines
const readTime = (text) => 2200 + text.length * 45;                     // longer lines stay up longer
const STILL = 25000;                                                    // "are you still there?"
const any = (list) => list[Math.floor(Math.random() * list.length)];

const timeOfDay = () => {
  const h = new Date().getHours();
  return h >= 5 && h < 11 ? "morning" : h < 15 ? "afternoon" : h < 19 ? "evening" : "night";
};

export function initMascotChat(fly, bubble, ready = Promise.resolve()) {
  if (!fly || !bubble || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const text = bubble.querySelector("span") ?? bubble;
  const recent = [];
  let hideTimer = 0, talking = false, boops = 0, boopReset = 0, lastActive = Date.now(), stillSaid = false, hiddenAt = 0;

  // A fresh line from a set: skips anything said in the last eight.
  const from = (set) => {
    const pool = pick(set), fresh = pool.filter((l) => !recent.includes(l));
    const line = any(fresh.length ? fresh : pool);
    recent.push(line); if (recent.length > 8) recent.shift();
    return line;
  };
  const hush = () => { clearTimeout(hideTimer); talking = false; bubble.classList.remove("is-on"); };
  const say = (line, { force = false, voice = true } = {}) => {
    if (!line || (talking && !force)) return;
    if (voice) babble(line);
    const r = fly.getBoundingClientRect();
    text.textContent = line;
    placeBubble(bubble, { x: r.left, y: r.top, size: r.width }, [0.05, 14, 18]);   // chatty, not shouty
    bubble.classList.add("is-on");
    talking = true;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hush, readTime(line));
  };
  const quiet = () => document.hidden || fly.classList.contains("is-hello") || fly.classList.contains("is-idle-sleepy");

  // What to say when nothing in particular is happening.
  const idleLine = () => {
    if (Date.now() - lastActive > STILL && !stillSaid) { stillSaid = true; return from(chatter.idle); }
    const r = Math.random();
    if (fly.classList.contains("is-docked")) {
      const section = chatter.sections[document.querySelector('.nav-link[aria-current="true"]')?.hash.slice(1)];
      if (section && r < 0.5) return from(section);
      return r < 0.62 ? from(chatter.time[timeOfDay()]) : from(chatter.docked);
    }
    if (r < 0.12) return from(chatter.time[timeOfDay()]);
    if (r < 0.24 && document.documentElement.dataset.theme === "dark") return from(chatter.dark);
    return from(chatter.lines);
  };
  const loop = () => setTimeout(() => { if (!quiet()) say(idleLine()); loop(); }, gap());

  // Reactions.
  fly.addEventListener("click", () => {                                  // click, not press: counts as the activation sound needs
    boops += 1;
    clearTimeout(boopReset); boopReset = setTimeout(() => { boops = 0; }, 6000);   // a streak is clicks close together
    const streak = chatter.streak[boops];
    streak ? sad() : boop();
    say(streak ? pick(streak) : from(chatter.boop), { force: true, voice: false });
  });
  fly.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" && Math.random() < 0.35 && !quiet()) say(from(chatter.hover));
  });
  ["pointermove", "keydown", "wheel", "touchstart"].forEach((type) =>
    addEventListener(type, () => { lastActive = Date.now(); stillSaid = false; }, { passive: true }));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt > 8000) setTimeout(() => say(from(chatter.back), { force: true }), 700);
  });
  onScroll(() => { if (talking) return hush; });                         // write phase: just hide

  ready.then(() => {
    // Theme and language reactions only after the page has settled (both fire once at start).
    new MutationObserver(() => {
      say(from(document.documentElement.dataset.theme === "dark" ? chatter.toDark : chatter.toLight), { force: true });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("langchange", () => setTimeout(() => say(from(chatter.lang), { force: true }), 50));
    setTimeout(loop, 6000);                                               // start after the welcome
  });
}
