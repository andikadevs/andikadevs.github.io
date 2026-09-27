// One AudioContext for the whole site and its little mixer: the voice
// (robot-voice.js), sound effects (sound-fx.js) and music (music.js) each have a
// bus, and all three meet in one master limiter so nothing clips when they
// overlap. Browsers only allow sound after a real activation (a click, tap or
// key; on touch screens a press-down doesn't count), so the context is created
// and resumed right inside one, and a silent blip wakes up iOS. The mute choice
// ([data-sound-toggle], remembered as "sound") lives here, so every bus obeys it.
const KEY = "sound";
const LEVEL = { sfx: 0.5, music: 0.22 };
const DUCK = 0.7;                      // music level while Tejo talks or a big effect plays

let ctx = null, buses = null, unlocked = false, sleepTimer = 0;
let muted = (() => { try { return localStorage.getItem(KEY) === "off"; } catch { return false; } })();
const listeners = new Set();

export const bus = (name) => buses?.[name];
export const isUnlocked = () => unlocked && !!ctx;
export const isMuted = () => muted;
export const canPlay = () => unlocked && !muted && !document.hidden && ctx && ctx.state !== "closed";
// Unlock, mute and tab visibility all notify here (music.js starts and stops on it).
export const onAudioChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach((fn) => fn());

export function setMuted(value) {
  muted = value;
  try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch { /* private mode */ }
  emit();
}

// Real audio hardware takes a moment to start: anything scheduled before the
// context is running would land in the past and play silently, so wait for it.
// running() resolves with the context, or null when it can't play.
export const running = () => new Promise((done) => {
  if (!canPlay()) return done(null);
  if (ctx.state === "running") return done(ctx);
  ctx.resume().then(() => done(canPlay() ? ctx : null), () => done(null));
});
export function whenRunning(fn) {
  if (!canPlay()) return;
  if (ctx.state === "running") fn(ctx);
  else running().then((c) => c && fn(c));
}

// Smooth gain moves without clicks: hold wherever the ramp is now, then glide.
export function glide(param, value, seconds) {
  const now = ctx.currentTime;
  if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
  else { param.cancelScheduledValues(now); param.setValueAtTime(param.value, now); }
  param.linearRampToValueAtTime(value, now + Math.max(seconds, 0.01));
}

// Music dips under anything that needs to be heard, for `seconds`.
let duckUntil = 0;
export function duck(seconds) {
  if (!buses) return;
  const g = buses.music.gain, now = ctx.currentTime;
  if (now + seconds <= duckUntil) return;                        // already down for longer
  glide(g, DUCK, 0.08);                                           // also drops the pending release
  duckUntil = now + seconds;
  g.setValueAtTime(DUCK, duckUntil);
  g.linearRampToValueAtTime(1, duckUntil + 0.4);
}

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createDynamicsCompressor();                  // a limiter: only touches peaks when everything plays at once
  master.threshold.value = -3; master.knee.value = 0; master.ratio.value = 20;
  master.attack.value = 0.003; master.release.value = 0.15;
  master.connect(ctx.destination);
  const gain = (value, to = master) => { const g = ctx.createGain(); g.gain.value = value; g.connect(to); return g; };

  const voice = ctx.createDynamicsCompressor();                   // the voice's own chain, as it always was:
  voice.threshold.value = -28; voice.ratio.value = 6;             // evens the chirps out and lifts them on small speakers
  voice.connect(gain(1.6));
  const music = gain(1, gain(LEVEL.music));                       // input stage = the ducking gain
  buses = { voice, sfx: gain(LEVEL.sfx), music };
}

function unlock() {
  try {
    if (!ctx) build();
    ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, 22050);
    src.connect(ctx.destination); src.start(0);
    if (!unlocked) { unlocked = true; emit(); }
  } catch { /* no Web Audio: stay silent */ }
}

export function initAudio() {
  // capture: runs before the click that plays the first sound. Later activations
  // resume the context if the system suspended it (iOS does after a phone call).
  ["click", "keydown", "touchend"].forEach((type) => addEventListener(type, () => {
    if (!unlocked || ctx?.state !== "running") unlock();
  }, { passive: true, capture: true }));

  // A hidden tab goes quiet: music fades (music.js), then the whole context is
  // suspended so the loop pauses in place and picks up where it left off.
  document.addEventListener("visibilitychange", () => {
    clearTimeout(sleepTimer);
    if (document.hidden) sleepTimer = setTimeout(() => { if (document.hidden) ctx?.suspend().catch(() => {}); }, 400);
    else if (unlocked) ctx?.resume().catch(() => {});
    emit();
  });
}
