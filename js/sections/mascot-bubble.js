// Places the mascot's speech bubble like a dialog box, tail pointing back at it,
// always on screen and clear of the nav bar. In order of preference:
//   right  off its top-right shoulder
//   above  over its head, right-aligned, tail on the right
//   left   off its top-left shoulder, tail on the right (phones, where "above" hits the nav)
//   below  hanging under it (docked in the nav itself)
// `box` is the mascot in viewport pixels: { x, y, size }. Uses left/top rather
// than transform, so the bubble's pop-in scale doesn't move it.
const NAV = 60;                                                    // keep the bar at the top clear

// `font` = [scale × mascot size, min px, max px]: big for the welcome, conversational for chatter.
export function placeBubble(bubble, { x, y, size }, font = [0.075, 15, 30]) {
  bubble.style.fontSize = `${Math.min(Math.max(size * font[0], font[1]), font[2]).toFixed(1)}px`;   // grows with the mascot
  const w = bubble.offsetWidth, h = bubble.offsetHeight;
  const fitsX = (left) => left >= 12 && left + w + 12 <= innerWidth;
  const options = [
    { left: x + size * 0.88, top: y + size * 0.06, tail: "right" },
    { left: x + size * 0.95 - w, top: y - size * 0.14, tail: "left" },
    { left: x + size * 0.12 - w, top: y + size * 0.06, tail: "left" },
  ];
  const pick = options.find((o) => fitsX(o.left) && o.top - h >= NAV);
  const place = pick ?? { left: Math.max(12, Math.min(x + size * 0.5, innerWidth - w - 12)), top: y + size * 0.95, tail: "below" };
  bubble.classList.toggle("is-left", place.tail === "left");
  bubble.classList.toggle("is-below", place.tail === "below");
  bubble.style.left = `${place.left.toFixed(1)}px`;
  bubble.style.top = `${place.top.toFixed(1)}px`;
}
