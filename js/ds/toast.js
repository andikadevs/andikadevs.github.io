// One shared toast element; show(message) replaces whatever is on screen.
let el;
let timer;

export function toast(message, ms = 2200) {
  el ??= Object.assign(document.createElement("div"), { className: "toast", role: "status" });
  if (!el.isConnected) document.body.append(el);
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("is-visible"), ms);
}
