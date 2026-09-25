// Night sky for [data-night] surfaces: layered twinkling stars, fireflies
// drifting in the lower half, and one shooting star at a time.
// Like the reference, the meteor is not an endless CSS loop: it flies ~1.3s
// every 5–13s, and only while it's dark and the surface is on screen.
const rand = (min, max) => min + Math.random() * (max - min);

function buildLayer(surface) {
  const night = document.createElement("div");
  night.className = "night";
  night.setAttribute("aria-hidden", "true");
  night.innerHTML = '<div class="night__stars night__stars--far"></div><div class="night__stars"></div><div class="night__stars night__stars--near"></div>';

  const count = innerWidth < 760 ? 7 : 14;
  for (let i = 0; i < count; i++) {
    const fly = document.createElement("span");
    fly.className = "firefly";
    const vars = {
      "--x": `${rand(4, 96)}%`, "--y": `${rand(48, 92)}%`, "--r": `${rand(3, 5.5)}px`,
      "--g": `${rand(2.4, 4.4)}s`, "--w": `${rand(10, 20)}s`, "--delay": `${-rand(0, 12)}s`,
      "--dx1": `${rand(-50, 50)}px`, "--dy1": `${rand(-40, 20)}px`,
      "--dx2": `${rand(-60, 60)}px`, "--dy2": `${rand(-60, 10)}px`,
      "--dx3": `${rand(-40, 40)}px`, "--dy3": `${rand(-30, 30)}px`,
    };
    Object.entries(vars).forEach(([k, v]) => fly.style.setProperty(k, v));
    night.append(fly);
  }

  const meteor = document.createElement("span");
  meteor.className = "meteor";
  night.append(meteor);
  surface.prepend(night);
  return meteor;
}

function scheduleMeteors(surface, meteor) {
  let visible = false;
  let timer = 0;
  const isNight = () => document.documentElement.dataset.theme === "dark";

  const fly = () => {
    if (visible && isNight()) {
      meteor.style.setProperty("--x", `${rand(8, 60)}%`);
      meteor.style.setProperty("--y", `${rand(4, 32)}%`);
      meteor.style.setProperty("--a", `${rand(12, 34)}deg`);
      meteor.style.setProperty("--d", `${rand(260, 520)}px`);
      meteor.classList.remove("is-flying");
      void meteor.offsetWidth;                 // restart the animation
      meteor.classList.add("is-flying");
    }
    timer = setTimeout(fly, rand(5000, 13000));
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    clearTimeout(timer);
    if (visible) timer = setTimeout(fly, rand(1200, 4000));
  }).observe(surface);
}

export function initNightSky(root = document) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.querySelectorAll("[data-night]").forEach((surface) => {
    const meteor = buildLayer(surface);
    if (!reduced) scheduleMeteors(surface, meteor);
  });
}
