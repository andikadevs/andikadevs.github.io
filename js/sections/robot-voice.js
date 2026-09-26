// The mascot's voice: cute robot chirps synthesised with Web Audio, no sound
// files. babble(text) plays a run of short blips that follows the line's length
// (like a little robot talking, timed to the bubble's typing); boop() is a springy "bwoop"; sad() a tiny
// "wah-wah". It stays silent until the visitor has interacted with the page
// (browsers require that anyway), while the tab is hidden, and when muted with
// the [data-sound-toggle] button (the choice is remembered).
const KEY = "sound";
const VOLUME = 0.2;
const LEAD = 0.04;                     // seconds ahead of "now" that notes start

let ctx = null, out = null, unlocked = false;
let muted = (() => { try { return localStorage.getItem(KEY) === "off"; } catch { return false; } })();

const ready = () => unlocked && !muted && !document.hidden && ctx && ctx.state !== "closed";

// Browsers only allow sound after a real activation (a click, tap or key; on
// touch screens a press-down doesn't count), so the context is created and
// resumed right inside one, and a silent blip wakes up iOS.

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
  osc.connect(tone).connect(amp).connect(out);
  osc.start(at); osc.stop(at + dur + 0.02);
}

// Real audio hardware takes a moment to start: notes scheduled before the context
// is running would land in the past and play silently, so wait for it.
function play(score) {
  if (!ready()) return;
  const go = () => score(ctx.currentTime + LEAD);
  ctx.state === "running" ? go() : ctx.resume().then(go, () => {});
}

// Chirps spread across `seconds`, the time the bubble takes to type the line,
// so the voice runs exactly while it's "talking".
export function babble(text, seconds = 0.9) {
  play((start) => {
    const syllables = Math.min(16, Math.max(3, Math.round(text.replace(/\s+/g, "").length / 4)));
    const step = seconds / syllables;
    const base = 620 + Math.random() * 140;
    for (let i = 0; i < syllables; i++) {
      const up = text.trim().endsWith("?") && i === syllables - 1;   // questions go up at the end
      const d = Math.min(step * 0.7, 0.045 + Math.random() * 0.035);
      blip(start + i * step + Math.random() * step * 0.2, base * (0.8 + Math.random() * 0.7), d,
        { glide: up ? 1.6 : 0.85 + Math.random() * 0.3, gain: 0.8 + Math.random() * 0.3 });
    }
  });
}

export function boop() {
  play((t) => {
    blip(t, 480, 0.16, { type: "triangle", glide: 2.6, gain: 2 });  // high enough for phone speakers
    blip(t + 0.12, 1100, 0.09, { type: "square", glide: 1.2, gain: 1 });
  });
}

export function sad() {
  play((t) => {
    blip(t, 700, 0.2, { type: "square", glide: 0.8, gain: 1 });
    blip(t + 0.22, 540, 0.36, { type: "square", glide: 0.7, gain: 1 });
  });
}

function unlock() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      out = ctx.createDynamicsCompressor();                          // evens the chirps out and lifts them on small speakers
      out.threshold.value = -28; out.ratio.value = 6;
      const master = ctx.createGain(); master.gain.value = 1.6;
      out.connect(master).connect(ctx.destination);
    }
    ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, 22050);
    src.connect(ctx.destination); src.start(0);
    unlocked = true;
  } catch { /* no Web Audio: stay silent */ }
}

export function initRobotVoice(toggle) {
  // capture: runs before the click that plays the first sound
  ["click", "keydown", "touchend"].forEach((type) => addEventListener(type, () => { if (!unlocked) unlock(); }, { passive: true, capture: true }));
  if (!toggle) return;
  const sync = () => toggle.setAttribute("aria-pressed", String(!muted));
  toggle.addEventListener("click", () => {
    muted = !muted;
    try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch { /* private mode */ }
    sync();
    if (!muted) { unlock(); babble("beep boop"); }                  // a little hello so you know it's on
  });
  sync();
}
