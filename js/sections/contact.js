// Copy-to-clipboard email and a live clock in my time zone.
import { t, lang } from "../core/i18n.js";
import { toast } from "../ds/toast.js";
import { profile } from "../data/profile.js";

export function initCopyEmail(button) {
  button?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast(t("contact.copied"));
    } catch {
      location.href = `mailto:${profile.email}`;
    }
  });
}

export function initClock(el) {
  if (!el) return;
  const tick = () => {
    el.textContent = new Intl.DateTimeFormat(lang() === "id" ? "id-ID" : "en-GB", {
      hour: "2-digit", minute: "2-digit", timeZone: profile.timeZone, timeZoneName: "short",
    }).format(new Date());
  };
  tick();
  setInterval(tick, 30_000);
  document.addEventListener("langchange", tick);
}
