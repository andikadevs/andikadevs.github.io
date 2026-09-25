"""The constructed "a": the letter built from circles and capsules at the display
font's x-height and stem weight. One source for the site logo, the favicon, the
footer wordmark and the logo explorations in ~/Designs/logo.

Every part carries a class (mk-ring, mk-stem, …) so the footer can animate them.
"""
from glyphs import Font

# The mark the site uses. Options: face, hood, ring, node, prompt, cloud, disc.
LOGO = "face"

MARK_SCALE = 1.38   # the built a stands taller than the lowercase, like an initial
MARK_GAP = 120      # breathing room before "ndikadevs"
ACCENT = "var(--accent)"


def _capsule(x, y, w, h, fill="currentColor", cls="mk-stem"):
    r = min(w, h) / 2
    return f'<rect class="{cls}" x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="{r:.0f}" fill="{fill}"/>'


def _ring(cx, cy, r, t, stroke="currentColor"):
    return (f'<circle class="mk-ring" cx="{cx:.0f}" cy="{cy:.0f}" r="{r - t / 2:.0f}" '
            f'fill="none" stroke="{stroke}" stroke-width="{t:.0f}" pathLength="1"/>')


def _dot(cx, cy, r, cls, fill=ACCENT):
    return f'<circle class="{cls}" cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}" fill="{fill}"/>'


def a_parts(kind=LOGO, x=0, baseline=0, font=None):
    """(svg elements, width, height) for one constructed a sitting on `baseline`."""
    font = font or Font()
    stem = font.bounds("l")[2] - font.bounds("l")[0]
    xh, t = font.bounds("x")[3] * MARK_SCALE, stem * 1.2
    r = xh / 2
    cx, cy = x + r, baseline - r
    stem_x = x + 2 * r - t

    if kind in ("face", "hood"):
        # A little character that is still an a: the bowl is a head with two eyes
        # glancing right (toward the rest of the name), the stem is a raised arm
        # holding up a packet. "hood" wraps the head in a hoodie, like the photo.
        short = xh * 0.62
        eye_r = t * 0.3
        eyes = (_dot(cx - r * 0.2, cy - r * 0.05, eye_r, "mk-eye", "currentColor")
                + _dot(cx + r * 0.22, cy - r * 0.05, eye_r, "mk-eye", "currentColor"))
        if kind == "face":
            head = _ring(cx, cy, r, t)
        else:
            face_r = r - t * 0.95
            head = (f'<path class="mk-ring" fill-rule="evenodd" fill="currentColor" d="M{cx - r:.0f} {cy:.0f} '
                    f'a{r:.0f} {r:.0f} 0 1 1 {2 * r:.0f} 0 a{r:.0f} {r:.0f} 0 1 1 {-2 * r:.0f} 0 Z '
                    f'M{cx - face_r:.0f} {cy + t * 0.18:.0f} a{face_r:.0f} {face_r:.0f} 0 1 0 {2 * face_r:.0f} 0 '
                    f'a{face_r:.0f} {face_r:.0f} 0 1 0 {-2 * face_r:.0f} 0 Z"/>')
            eyes = eyes.replace(f'cy="{cy - r * 0.05:.0f}"', f'cy="{cy + t * 0.18:.0f}"')
        body = (head + eyes + _capsule(stem_x, baseline - short, t, short)
                + _dot(stem_x + t / 2, baseline - short - t * 0.9, t * 0.62, "mk-packet"))
        return body, 2 * r, xh
    if kind == "ring":
        return _ring(cx, cy, r, t) + _capsule(stem_x, baseline - xh, t, xh), 2 * r, xh
    if kind == "node":        # ring with a node at its centre; a packet rides on top of a shorter stem
        short = xh * 0.62
        body = (_ring(cx, cy, r, t) + _capsule(stem_x, baseline - short, t, short)
                + _dot(cx, cy, t * 0.55, "mk-core")
                + _dot(stem_x + t / 2, baseline - short - t * 0.9, t * 0.62, "mk-packet"))
        return body, 2 * r, xh
    if kind == "prompt":      # the stem's foot runs out into a cursor
        body = (_ring(cx, cy, r, t) + _capsule(stem_x, baseline - xh, t, xh)
                + _capsule(stem_x + t * 1.5, baseline - t * 0.8, xh * 0.55, t * 0.8, ACCENT, "mk-cursor"))
        return body, 2 * r + t * 1.5 + xh * 0.55, xh
    if kind == "cloud":       # the bowl is a little cloud on a flat base
        base_w = r * 1.55
        body = (_dot(x + r * 0.55, baseline - r * 0.55, r * 0.55, "mk-puff")
                + _dot(x + r * 1.05, baseline - r * 0.95, r * 0.72, "mk-puff")
                + f'<rect class="mk-puff" x="{x + r * 0.55:.0f}" y="{baseline - r * 0.9:.0f}" '
                  f'width="{base_w - r * 0.55:.0f}" height="{r * 0.9:.0f}" fill="{ACCENT}"/>')
        sx = x + base_w + t * 0.35
        return body + _capsule(sx, baseline - xh, t, xh), sx + t - x, xh
    if kind == "disc":        # solid disc with an off-centre eye, blue stem
        eye = r * 0.36
        body = (f'<path class="mk-ring" fill-rule="evenodd" fill="currentColor" d="M{cx - r:.0f} {cy:.0f} '
                f'a{r:.0f} {r:.0f} 0 1 0 {2 * r:.0f} 0 a{r:.0f} {r:.0f} 0 1 0 {-2 * r:.0f} 0 Z '
                f'M{cx + r * 0.1 - eye:.0f} {cy - r * 0.05:.0f} a{eye:.0f} {eye:.0f} 0 1 0 {2 * eye:.0f} 0 '
                f'a{eye:.0f} {eye:.0f} 0 1 0 {-2 * eye:.0f} 0 Z"/>')
        return body + _capsule(stem_x + t * 0.25, baseline - xh, t, xh, ACCENT), 2 * r + t * 0.25, xh
    raise ValueError(kind)


def icon_svg(kind=LOGO, font=None, fg="currentColor", accent=ACCENT, background=None, pad_ratio=0.14):
    """A square icon of the mark alone. With `background`, it's a rounded app tile."""
    body, w, h = a_parts(kind, font=font)          # drawn on baseline y=0, spanning x 0..w
    top = -h - (h * 0.25 if kind in ("node", "face", "hood") else 0)   # room for the packet above the stem
    box = max(w, -top) * (1 + 2 * pad_ratio)
    # Centre on the letter itself (x-height box); the packet pokes up above it
    # like an antenna, so the head lines up with text beside it.
    dx, dy = (box - w) / 2, box / 2 + h / 2
    body = body.replace("currentColor", fg).replace(ACCENT, accent)
    tile = f'<rect width="{box:.0f}" height="{box:.0f}" rx="{box * 0.24:.0f}" fill="{background}"/>' if background else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {box:.0f} {box:.0f}">{tile}'
            f'<g transform="translate({dx:.1f} {dy:.1f})">{body}</g></svg>')
