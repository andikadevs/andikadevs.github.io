// Entry point: wire data → sections, then the interaction layer.
import { $, $$ } from "./core/dom.js";
import { initI18n, setLang, lang } from "./core/i18n.js";
import { initNav } from "./ds/nav.js";
import { initReveal } from "./ds/reveal.js";
import { initMarquees } from "./ds/marquee.js";
import { initSmoothScroll } from "./ds/smooth-scroll.js";
import { initScrollProgress, watchScroll } from "./ds/scroll-progress.js";
import { splitWords } from "./ds/split-text.js";
import { initCountUp } from "./ds/count-up.js";
import { initMagnetic } from "./ds/magnetic.js";
import { initNightSky } from "./ds/night-sky.js";
import { initThemeToggle } from "./ds/theme-toggle.js";
import { initPaintScenes } from "./ds/paint-scene.js";
import { initHScroll } from "./ds/hscroll.js";
import { rollify } from "./ds/text-roll.js";
import { syncSegmented } from "./ds/segmented.js";
import { renderDeck, initDeck } from "./sections/deck.js";
import { renderAbout } from "./sections/about.js";
import { initProjectDialog } from "./sections/project-dialog.js";
import { initCopyEmail, initClock } from "./sections/contact.js";
import { initWordmark } from "./sections/wordmark.js";
import { initMascots } from "./sections/mascot.js";
import { initMascotFly } from "./sections/mascot-fly.js";
import { initMascotIdle } from "./sections/mascot-idle.js";

// Labels that roll on hover: nav links and button labels (after i18n has set their text).
const ROLL = ".nav-link, .btn > [data-i18n]";

function renderContent() {
  rollify(ROLL);
  renderDeck();
  renderAbout();
  splitWords();
  initReveal();
  watchScroll();
  initCountUp();
}

function initLangSwitch(control) {
  const sync = () => {
    $$("button", control).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang())));
    syncSegmented(control);
  };
  control.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lang]");
    if (button) setLang(button.dataset.lang);
  });
  document.addEventListener("langchange", sync);
}

// Listeners first, so the initial language pass renders everything once.
document.addEventListener("langchange", renderContent);
$$("[data-lang-switch]").forEach(initLangSwitch);
initI18n();

initSmoothScroll();
initScrollProgress();
watchScroll();
initNav($("[data-nav]"));
initMarquees();
initNightSky();
initPaintScenes();
initHScroll($("[data-hscroll]"));
initMagnetic();
initThemeToggle($("[data-theme-toggle]"));
initProjectDialog($("[data-project-dialog]"));
initDeck($("[data-deck]"));
initCopyEmail($("[data-copy-email]"));
initClock($("[data-clock]"));
initWordmark($("[data-wordmark]"));
initMascots();
initMascotFly($("[data-mascot-fly]"), $("[data-hero-anchor]"), $("[data-mascot-dock]"), $("[data-mascot-hello]"));
initMascotIdle($("[data-mascot-fly]"));
$("[data-year]").textContent = new Date().getFullYear();
