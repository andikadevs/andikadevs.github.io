// The mascot chats. Every 7–12 s while it's idle it grumbles a line, and what it
// says depends on where it is and what's going on: resting beside the headline,
// parked in the nav (and which section you're reading), the time of day, the dark
// theme, how long you've been still. It also reacts to being clicked, and to spam-clicking it, the theme or the language,
// hovered, the theme and language switches, and you coming back to the tab.
// Lines type themselves in; clicks always chirp, idle lines only now and then.
// Lines never repeat until eight others have been said. Quiet during the welcome,
// while dozing and while the tab is hidden; the bubble tucks away on scroll.
import { pick } from "../core/i18n.js";
import { chatter } from "../data/chatter.js";
import { placeBubble } from "./mascot-bubble.js";
import { onScroll } from "../ds/smooth-scroll.js";
import { babble, boop, sad } from "./robot-voice.js";

const gap = () => 7000 + Math.random() * 5000;                         // 7–12 s between lines
const TYPE = 30;                                                        // ms per character as the bubble types
const readTime = (text) => 1800 + text.length * 40;                     // how long it stays after typing
const STILL = 25000;                                                    // "are you still there?"
const any = (list) => list[Math.floor(Math.random() * list.length)];
const SPAM = 5000;                                                      // clicks closer than this count as one burst
// Big milestones get a move as well as a line (played by mascot-idle.js).
const MOVE_AT = { boop: { 10: "twirl", 20: "shake", 30: "sleepy" }, theme: { 5: "wiggle", 8: "twirl", 12: "shake" }, lang: { 5: "shake", 8: "twirl" } };

const timeOfDay = () => {
  const h = new Date().getHours();
  return h >= 5 && h < 11 ? "morning" : h < 15 ? "afternoon" : h < 19 ? "evening" : "night";
};

export function initMascotChat(fly, bubble, ready = Promise.resolve()) {
  if (!fly || !bubble || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const text = bubble.querySelector("span") ?? bubble;
  const recent = [];
  let hideTimer = 0, typeTimer = 0, talking = false, voicedLast = false, lastActive = Date.now(), stillSaid = false, hiddenAt = 0;

  // A fresh line from a set: skips anything said in the last eight.
  const from = (set) => {
    const pool = pick(set), fresh = pool.filter((l) => !recent.includes(l));
    const line = any(fresh.length ? fresh : pool);
    recent.push(line); if (recent.length > 8) recent.shift();
    return line;
  };
  const hush = () => { clearTimeout(hideTimer); clearInterval(typeTimer); talking = false; bubble.classList.remove("is-on"); };
  // Speak: the bubble is sized and placed for the whole line, then the text types
  // itself in; with a voice, the chirps run over exactly that typing time.
  const say = (line, { force = false, voice = true } = {}) => {
    if (!line || (talking && !force)) return;
    const r = fly.getBoundingClientRect();
    bubble.style.width = bubble.style.height = "";
    text.textContent = line;
    placeBubble(bubble, { x: r.left, y: r.top, size: r.width }, [0.05, 14, 18]);   // chatty, not shouty
    bubble.style.width = `${bubble.offsetWidth}px`;                    // hold the final size while typing
    bubble.style.height = `${bubble.offsetHeight}px`;
    clearInterval(typeTimer);
    let shown = 0;
    text.textContent = "";
    typeTimer = setInterval(() => {
      shown += 1;
      text.textContent = line.slice(0, shown);
      if (shown >= line.length) clearInterval(typeTimer);
    }, TYPE);
    if (voice) babble(line, (line.length * TYPE) / 1000);
    bubble.classList.add("is-on");
    talking = true;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hush, line.length * TYPE + readTime(line));
  };
  // Idle lines only sometimes get a voice, and never two in a row.
  const idleVoice = () => { voicedLast = !voicedLast && Math.random() < 0.35; return voicedLast; };
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
  const loop = () => setTimeout(() => { if (!quiet()) say(idleLine(), { voice: idleVoice() }); loop(); }, gap());

  // Bursts: how many times something has been hit in a row (reset after a calm SPAM ms).
  const bursts = {};
  const burst = (name) => {
    const b = (bursts[name] ??= { n: 0, timer: 0 });
    b.n += 1;
    clearTimeout(b.timer); b.timer = setTimeout(() => { b.n = 0; }, SPAM);
    const move = MOVE_AT[name]?.[b.n];
    if (move) setTimeout(() => fly.dispatchEvent(new CustomEvent("tejo:move", { detail: move })), 60);
    return b.n;
  };

  // Reactions.
  fly.addEventListener("click", () => {                                  // click, not press: counts as the activation sound needs
    const streak = chatter.streak[burst("boop")];
    streak ? sad() : boop();
    say(streak ? pick(streak) : from(chatter.boop), { force: true, voice: false });
  });
  fly.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" && Math.random() < 0.35 && !quiet()) say(from(chatter.hover), { voice: false });
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
    // The first switch gets a normal reaction; clicking it over and over escalates.
    new MutationObserver(() => {
      const n = burst("theme"), spam = chatter.themeSpam[n];
      if (spam) { sad(); say(pick(spam), { force: true, voice: false }); }
      else if (n === 1) say(from(document.documentElement.dataset.theme === "dark" ? chatter.toDark : chatter.toLight), { force: true });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("langchange", () => setTimeout(() => {
      const n = burst("lang"), spam = chatter.langSpam[n];
      if (spam) { sad(); say(pick(spam), { force: true, voice: false }); }
      else if (n === 1) say(from(chatter.lang), { force: true });
    }, 50));
    setTimeout(loop, 6000);                                               // start after the welcome
  });
}
