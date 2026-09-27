// The mascot's voice: cute robot chirps synthesised with Web Audio, no sound
// files. babble(text) plays a run of short blips that follows the line's length
// (like a little robot talking, timed to the bubble's typing); boop() is a springy "bwoop"; sad() a tiny
// "wah-wah". The context, unlocking and muting are shared (core/audio.js): it
// stays silent until the visitor has interacted with the page, while the tab is
// hidden, and when muted with the [data-sound-toggle] button.
import { bus, whenRunning, duck, isMuted, setMuted, onAudioChange } from "../core/audio.js";

const VOLUME = 0.2;
const LEAD = 0.04;                     // seconds ahead of "now" that notes start

let ctx = null;

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
  osc.connect(tone).connect(amp).connect(bus("voice"));
  osc.start(at); osc.stop(at + dur + 0.02);
}

function play(score) {
  whenRunning((c) => { ctx = c; score(ctx.currentTime + LEAD); });
}

// Chirps spread across `seconds`, the time the bubble takes to type the line,
// so the voice runs exactly while it's "talking".
export function babble(text, seconds = 0.9) {
  play((start) => {
    duck(seconds + 0.3);                                             // the music steps back while Tejo talks
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

export function initRobotVoice(toggle) {
  if (!toggle) return;
  const sync = () => toggle.setAttribute("aria-pressed", String(!isMuted()));
  toggle.addEventListener("click", () => {                           // audio.js has already unlocked on this click
    setMuted(!isMuted());
    if (!isMuted()) babble("beep boop");                             // a little hello so you know it's on
  });
  onAudioChange(sync);                                               // the music toggle can switch sound back on
  sync();
}
