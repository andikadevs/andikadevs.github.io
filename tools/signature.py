"""Andika's signature as clean, drawable SVG strokes.

Traced by hand from a scanned pen signature, then smoothed: each stroke is a
list of key points (in writing order) turned into cubic Béziers with
Catmull-Rom tangents. It's slanted, and each stroke is drawn as a filled shape
whose width follows a broad nib (thick and thin, tapered ends); the centre line
becomes a mask, so the loader can "write" each stroke by drawing its mask.
Run from the repo root: python3 tools/signature.py
(inlines it into index.html's loader, between the signature markers)
"""
import math
from pathlib import Path

from html_blocks import inline

ROOT = Path(__file__).resolve().parent.parent

STROKES = [
    # 1. big leaf loop → tall loop → hook → up into the small bowl
    [(203, 76), (160, 84), (122, 101), (90, 122), (68, 146), (54, 172), (49, 196), (60, 213), (86, 219),
     (118, 211), (150, 194), (178, 170), (198, 142), (210, 108), (222, 70), (234, 42), (248, 27),
     (256, 38), (252, 66), (241, 94), (225, 122), (208, 150), (196, 178), (197, 202), (210, 209),
     (236, 198), (262, 175), (282, 152), (297, 138), (306, 141), (303, 154), (307, 165), (319, 168), (331, 161)],
    # 2. the stem of the A
    [(309, 56), (318, 104), (326, 150), (336, 193)],
    # 3. the diagonal, ending in a small curl
    [(311, 57), (350, 74), (384, 94), (406, 110), (418, 122), (408, 132), (395, 124), (404, 112), (422, 110)],
    # 4. the underline swoosh
    [(204, 158), (250, 146), (310, 136), (380, 129), (440, 124), (470, 121), (452, 131)],
]


SLANT = 0.21                 # rightward lean (tan ≈ 12°), sheared about the baseline
BASELINE = 190
NIB = 0.62                   # broad-nib angle (radians): strokes across it are thick, along it thin
WIDTH = (3.2, 10.5)          # thinnest / thickest, in viewBox units
MASK = 15                    # the invisible pen that reveals each stroke (≥ the thickest width)


def slant(points):
    return [(x + (BASELINE - y) * SLANT, y) for x, y in points]


def segments(points, tension=0.5):
    """Catmull-Rom through every point → cubic Bézier segments (p1, c1, c2, p2)."""
    p = [points[0]] + points + [points[-1]]
    out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3)
        out.append((p1, c1, c2, p2))
    return out


def centerline(points):
    segs = segments(points)
    d = [f"M{segs[0][0][0]:.1f} {segs[0][0][1]:.1f}"]
    d += [f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {b[0]:.1f} {b[1]:.1f}" for _, c1, c2, b in segs]
    return " ".join(d)


def sample(points, per_segment=24):
    pts = []
    for a, c1, c2, b in segments(points):
        for k in range(per_segment):
            t = k / per_segment; u = 1 - t
            pts.append((u**3 * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t**3 * b[0],
                        u**3 * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t**3 * b[1]))
    pts.append(points[-1])
    return [q for i, q in enumerate(pts) if i == 0 or math.dist(q, pts[i - 1]) > 0.05]


def outline(points):
    """The stroke as a filled shape: width follows the nib angle, tapering in and flicking out."""
    pts = sample(points)
    n = len(pts)
    widths, normals = [], []
    for i in range(n):
        a, b = pts[max(i - 1, 0)], pts[min(i + 1, n - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        length = math.hypot(dx, dy) or 1
        theta = math.atan2(dy, dx)
        w = WIDTH[0] + (WIDTH[1] - WIDTH[0]) * abs(math.sin(theta - NIB))
        t = i / (n - 1)
        w *= min(1, 0.35 + t / 0.07 * 0.65) * min(1, 0.12 + (1 - t) / 0.2 * 0.88)   # taper in, flick out
        widths.append(w); normals.append((-dy / length, dx / length))
    widths = [sum(widths[max(0, i - 3):i + 4]) / len(widths[max(0, i - 3):i + 4]) for i in range(n)]   # soften
    left = [(x + nx * w / 2, y + ny * w / 2) for (x, y), (nx, ny), w in zip(pts, normals, widths)]
    right = [(x - nx * w / 2, y - ny * w / 2) for (x, y), (nx, ny), w in zip(pts, normals, widths)]
    ring = left + right[::-1]
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in ring) + " Z"


def svg():
    strokes = [slant(s) for s in STROKES]
    xs = [x for s in strokes for x, _ in s]; ys = [y for s in strokes for _, y in s]
    pad = 14
    box = (round(min(xs) - pad), round(min(ys) - pad), round(max(xs) - min(xs) + 2 * pad), round(max(ys) - min(ys) + 2 * pad))
    masks = "".join(
        f'<mask id="sig-{i}" maskUnits="userSpaceOnUse" x="{box[0]}" y="{box[1]}" width="{box[2]}" height="{box[3]}">'
        f'<path d="{centerline(s)}" pathLength="1"/></mask>' for i, s in enumerate(strokes))
    inks = "".join(f'<path d="{outline(s)}" mask="url(#sig-{i})"/>' for i, s in enumerate(strokes))
    return (f'<svg class="loader__signature" viewBox="{box[0]} {box[1]} {box[2]} {box[3]}">'
            f'<defs>{masks}</defs><g fill="currentColor">{inks}</g></svg>')


if __name__ == "__main__":
    index = ROOT / "index.html"
    index.write_text(inline(index.read_text(), "signature", svg()))
    print(f"signature: {len(STROKES)} strokes inlined into index.html")
