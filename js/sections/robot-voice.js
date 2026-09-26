// The mascot's voice: cute robot chirps synthesised with Web Audio, no sound
// files. babble(text) plays a run of short blips that follows the line's length
// (like a little robot talking); boop() is a springy "bwoop"; sad() a tiny
// "wah-wah". It stays silent until the visitor has interacted with the page
// (browsers require that anyway), while the tab is hidden, and when muted with
// the [data-sound-toggle] button (the choice is remembered).
const KEY = "sound";
const VOLUME = 0.06;

let ctx = null, unlocked = false;
let muted = (() => { try { return localStorage.getItem(KEY) === "off"; } catch { return false; } })();

const ready = () => unlocked && !muted && !document.hidden && (ctx ??= new AudioContext()) && ctx.state !== "closed";

// One blip: a soft square/triangle tone with a quick attack and a short tail.
function blip(at, freq, dur, { type = "square", glide = 1, gain = 1 } = {}) {
  const osc = ctx.createOscillator(), amp = ctx.createGain(), tone = ctx.createBiquadFilter();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  osc.frequency.exponentialRampToValueAtTime(freq * glide, at + dur);
  tone.type = "lowpass"; tone.frequency.value = 2600;                // takes the edge off the square wave
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(VOLUME * gain, at + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(tone).connect(amp).connect(ctx.destination);
  osc.start(at); osc.stop(at + dur + 0.02);
}

export function babble(text) {
  if (!ready()) return;
  ctx.resume();
  const syllables = Math.min(14, Math.max(3, Math.round(text.replace(/\s+/g, "").length / 4)));
  let t = ctx.currentTime + 0.02;
  const base = 520 + Math.random() * 120;
  for (let i = 0; i < syllables; i++) {
    const up = text.trim().endsWith("?") && i === syllables - 1;      // questions go up at the end
    const f = base * (0.8 + Math.random() * 0.7);
    const d = 0.045 + Math.random() * 0.035;
    blip(t, f, d, { glide: up ? 1.6 : 0.85 + Math.random() * 0.3, gain: 0.8 + Math.random() * 0.3 });
    t += d + 0.018 + Math.random() * 0.03;
  }
}

export function boop() {
  if (!ready()) return;
  ctx.resume();
  const t = ctx.currentTime + 0.01;
  blip(t, 320, 0.16, { type: "sine", glide: 3, gain: 2.4 });
  blip(t + 0.11, 880, 0.08, { type: "triangle", glide: 1.2, gain: 1.4 });
}

export function sad() {
  if (!ready()) return;
  ctx.resume();
  const t = ctx.currentTime + 0.01;
  blip(t, 520, 0.2, { type: "triangle", glide: 0.8, gain: 1.6 });
  blip(t + 0.22, 400, 0.34, { type: "triangle", glide: 0.7, gain: 1.6 });
}

export function initRobotVoice(toggle) {
  const unlock = () => { unlocked = true; };
  ["pointerdown", "keydown", "touchstart"].forEach((type) => addEventListener(type, unlock, { once: true, passive: true, capture: true }));   // capture: before the click that plays a sound
  if (!toggle) return;
  const sync = () => toggle.setAttribute("aria-pressed", String(!muted));
  toggle.addEventListener("click", () => {
    muted = !muted;
    try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch { /* private mode */ }
    sync();
    if (!muted) { unlocked = true; babble("beep boop"); }            // a little hello so you know it's on
  });
  sync();
}
