// Tejo's theme (108 BPM, F major): a seamless 16-bar loop in the background.
// Off by default; [data-music-toggle] turns it on and the choice is remembered
// ("music"). It only plays while sound is on too (turning music on switches
// sound back on) and the tab is visible; it fades in and out, and ducks under
// Tejo's voice and big effects (core/audio.js). The file is fetched the first
// time it's actually needed.
import { bus, isUnlocked, isMuted, setMuted, running, onAudioChange, glide } from "../core/audio.js";

const KEY = "music";
const FILE = "assets/audio/music/tejo-theme-loop.mp3";
const LOOP = 35.555556;                // 16 bars at 108 BPM
const IN = 1.5, OUT = 0.6, AWAY = 0.3; // fade seconds: start, stop, tab hidden

let on = (() => { try { return localStorage.getItem(KEY) === "on"; } catch { return false; } })();
let track = null;                      // Promise<AudioBuffer | null>
let voice = null;                      // { source, fade } while playing
let starting = false;

// mp3 encoders pad the start with silence (and not every browser trims it), so
// the loop begins at the first audible sample and runs exactly 16 bars from there.
function loopPoints(buffer) {
  const data = buffer.getChannelData(0);
  let i = 0;
  while (i < data.length && Math.abs(data[i]) <= 0.001) i += 1;
  const start = Math.min(i / buffer.sampleRate, Math.max(0, buffer.duration - LOOP));
  return { start, end: Math.min(start + LOOP, buffer.duration) };
}

async function start() {
  if (voice || starting) return;
  starting = true;
  try {
    const ctx = await running();
    if (!ctx) return;
    track ??= fetch(FILE).then((r) => r.arrayBuffer())
      .then((data) => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
      .catch(() => { track = null; return null; });                // try again next time
    const buffer = await track;
    if (!buffer || voice || !wanted() || document.hidden) return;
    const { start: from, end } = loopPoints(buffer);
    const source = ctx.createBufferSource(), fade = ctx.createGain();
    source.buffer = buffer;
    source.loop = true; source.loopStart = from; source.loopEnd = end;
    fade.gain.value = 0;
    source.connect(fade).connect(bus("music"));
    source.start(ctx.currentTime, from);
    voice = { source, fade };
    glide(fade.gain, 1, IN);
  } finally {
    starting = false;
  }
}

function stop() {
  if (!voice) return;
  const { source, fade } = voice;
  voice = null;
  glide(fade.gain, 0, OUT);
  try { source.stop(source.context.currentTime + OUT + 0.05); } catch { /* already stopped */ }
}

const wanted = () => on && isUnlocked() && !isMuted();

// Hidden tab: fade to silence but keep the source; audio.js then suspends the
// context, so the loop resumes from the same spot when the tab comes back.
function sync() {
  if (!wanted()) return stop();
  if (!voice) return start();
  glide(voice.fade.gain, document.hidden ? 0 : 1, document.hidden ? AWAY : IN);
}

export function initMusic(toggle) {
  onAudioChange(sync);
  if (!toggle) return;
  const label = () => toggle.setAttribute("aria-pressed", String(on));
  toggle.addEventListener("click", () => {                          // audio.js has already unlocked on this click
    on = !on;
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode */ }
    label();
    if (on && isMuted()) setMuted(false);                            // music needs sound; setMuted syncs
    else sync();
  });
  label();
}
