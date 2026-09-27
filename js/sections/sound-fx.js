// Sound effects from Tejo's sound kit (assets/audio, listed in manifest.json):
// sfx("whoosh") plays one through the shared sfx bus (core/audio.js). Nothing is
// downloaded before the first interaction; then the few sounds the top of the
// page needs are fetched and decoded, and the rest on first use (cached). It is
// silent when muted, while the tab is hidden and before that first interaction,
// and it can't pile up: the same sound at most once per 60 ms, eight at a time.
// sfxOnce() is for scroll-triggered moments: once per element per page load.
import { bus, canPlay, isUnlocked, isMuted, whenRunning, duck, onAudioChange, glide } from "../core/audio.js";

const ROOT = "assets/audio/";
const PRELOAD = ["pen", "erase", "brush", "fall-in", "whoosh", "land", "bubble-pop", "boing"];   // the loader and Tejo's hello
const BIG = new Set(["brush", "fall-in", "whoosh", "wheel-spin", "deck-ratchet", "section-sheet", "count-up", "dive", "splash"]);
const GAP = 60, MAX = 8;
const STALE = 350;                     // ms: a sound that took longer to load has missed its moment

let files = null;                      // Promise<{ name: url }>
const buffers = new Map();             // name → Promise<AudioBuffer | null>
const lastAt = new Map();
const audible = new WeakMap();         // buffer → seconds until its tail drops below −40 dB
let spans = [];                        // [start, end] of what's sounding, on the audio clock

const manifest = () => (files ??= fetch(`${ROOT}manifest.json`)
  .then((r) => r.json())
  .then((m) => Object.fromEntries(Object.entries({ ...m.sfx, ...m.notes }).map(([name, s]) => [name, ROOT + s.file])))
  .catch(() => ({})));

function load(name, ctx) {
  if (!buffers.has(name)) {
    buffers.set(name, manifest()
      .then((list) => (list[name] ? fetch(list[name]) : Promise.reject()))
      .then((r) => r.arrayBuffer())
      .then((data) => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))   // callback form: older Safari
      .catch(() => null));
  }
  return buffers.get(name);
}

// The files keep a soft room tail; "at once" means audibly at once, so a sound
// counts until its tail has faded, not until the file ends.
function tail(buffer) {
  if (!audible.has(buffer)) {
    const data = buffer.getChannelData(0);
    let i = data.length - 1;
    while (i > 0 && Math.abs(data[i]) < 0.01) i -= 1;
    audible.set(buffer, i / buffer.sampleRate);
  }
  return audible.get(buffer);
}
const busyAt = (at) => { spans = spans.filter(([, end]) => end > at - 5); return spans.filter(([start, end]) => start <= at && end > at).length; };

// Plays `name`. `delay` (seconds) schedules it on the audio clock, for tight
// sequences; `length` cuts it short with a quick fade. Returns a handle whose
// stop(fade) fades it out early, or null when it won't play.
export function sfx(name, { volume = 1, pan = 0, rate = 1, delay = 0, length = 0 } = {}) {
  if (!canPlay()) return null;
  const asked = performance.now();
  if (asked - (lastAt.get(name) ?? -Infinity) < GAP) return null;
  lastAt.set(name, asked);

  const handle = { amp: null, source: null, stopped: false, stop(fade = 0.2) {
    this.stopped = true;
    if (!this.source) return;
    glide(this.amp.gain, 0, fade);
    try { this.source.stop(this.source.context.currentTime + fade + 0.02); } catch { /* already over */ }
  } };

  whenRunning((ctx) => load(name, ctx).then((buffer) => {
    const waited = (performance.now() - asked) / 1000;
    if (!buffer || handle.stopped || !canPlay() || waited * 1000 > STALE) return;
    const at = ctx.currentTime + Math.max(0, delay - waited);
    if (busyAt(at) >= MAX) return;
    const sounding = Math.min(tail(buffer) / rate, length || Infinity);
    spans.push([at, at + sounding]);
    const source = ctx.createBufferSource(), amp = ctx.createGain();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    amp.gain.value = volume;
    let out = source.connect(amp);
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; out = out.connect(p); }
    out.connect(bus("sfx"));
    source.onended = () => source.disconnect();
    source.start(at);
    if (length) { amp.gain.setValueAtTime(volume, at + length - 0.08); amp.gain.linearRampToValueAtTime(0, at + length); source.stop(at + length + 0.02); }
    Object.assign(handle, { source, amp });
    if (BIG.has(name)) duck(at - ctx.currentTime + Math.min(sounding, 1.6));
  }));
  return handle;
}

// Scroll-triggered sounds: each element gets each sound once per page load,
// whether or not it could be heard at the time (so scrolling back never replays it late).
const heard = new WeakMap();
export function sfxOnce(el, name, options) {
  if (!el) return null;
  const done = heard.get(el) ?? new Set();
  heard.set(el, done);
  if (done.has(name)) return null;
  done.add(name);
  return sfx(name, options);
}

export function initSoundFx() {
  let warmed = false;
  onAudioChange(() => {
    if (warmed || !isUnlocked() || isMuted()) return;
    warmed = true;
    whenRunning((ctx) => PRELOAD.forEach((name) => load(name, ctx)));
  });
}
