// Keeps a .segmented control's sliding thumb in sync with its pressed button.
export function syncSegmented(control) {
  const buttons = [...control.querySelectorAll("button")];
  const index = buttons.findIndex((b) => b.getAttribute("aria-pressed") === "true");
  control.style.setProperty("--seg-count", buttons.length);
  control.style.setProperty("--seg-i", Math.max(index, 0));
}
