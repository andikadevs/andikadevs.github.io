"""Builds every brand asset from the constructed mark (mark.py) and the display font:

  index.html   footer wordmark  — the mark + "ndikadevs", animated by css/site.css (.wm*)
  index.html   nav + hero mark  — the mark alone
  assets/img   favicon.svg      — sky tile with the white mark

Change the mark by editing LOGO in mark.py, then run from the repo root:
  python3 tools/build_brand.py        (needs: pip install fonttools brotli)
"""
import re
from pathlib import Path

from glyphs import Font
from mark import LOGO, MARK_GAP, a_parts, icon_svg

ROOT = Path(__file__).resolve().parent.parent
REST = "ndikadevs"
TRACKING = -28
REVEAL_FROM = [          # clip-path start states, cycled so neighbours open from different sides
    "inset(0% 0% 100% 0%)",
    "inset(100% 0% 0% 0%)",
    "inset(0% 100% 0% 0%)",
    "inset(0% 0% 0% 100%)",
]

font = Font()


def geometry():
    """Positions of every part of the lockup. Shared with ~/Designs/logo."""
    baseline = font.bounds("d")[3]                    # ascenders touch y=0
    x_height = font.bounds("x")[3]
    mark, mark_w, _ = a_parts(LOGO, 0, baseline, font)

    placed, _ = font.layout(REST, TRACKING, glyph_for={"i": "dotlessi"})
    offset = mark_w + MARK_GAP
    letters = [font.path(glyph, x + offset, baseline) for glyph, x in placed]

    i_glyph, i_x = placed[REST.index("i")]
    xmin, _, xmax, _ = font.bounds(i_glyph)
    dot_r = (xmax - xmin) / 2 * 1.05
    dot = (offset + i_x + (xmin + xmax) / 2, baseline - x_height - dot_r * 1.55, dot_r)

    d_glyph, d_x = placed[REST.index("devs")]
    s_glyph, s_x = placed[-1]
    bar_x0 = offset + d_x + font.bounds(d_glyph)[0]
    bar_x1 = offset + s_x + font.bounds(s_glyph)[2]
    bar = (bar_x0, baseline + 70, bar_x1 - bar_x0, 64)
    caret = (bar_x1 + 60, baseline - x_height, 70, x_height)

    # The second "a" (in andika) turns into an "@" on hover. Scale the font's @ to
    # stand a little taller than the x-height and centre it on the a's box.
    a_i = REST.index("a")
    a_glyph, a_x = placed[a_i]
    axmin, _, axmax, _ = font.bounds(a_glyph)
    at_cx = offset + a_x + (axmin + axmax) / 2
    at_cy = baseline - x_height / 2
    at_glyph = font.name("@")
    txmin, tymin, txmax, tymax = font.bounds(at_glyph)
    k = min((x_height * 1.28) / (tymax - tymin), ((axmax - axmin) * 1.3) / (txmax - txmin))   # as big as the a, never much wider
    at = font.path(at_glyph, at_cx - (txmin + txmax) / 2 * k, at_cy + (tymin + tymax) / 2 * k, k)
    hit = (offset + a_x + axmin - 40, baseline - x_height - 60, axmax - axmin + 80, x_height + 120)

    # Highest point of anything drawn (the mark's ring stroke and the i's dot rise
    # above the ascender line), so the viewBox never clips them.
    tops = [dot[1] - dot[2]]
    for m in re.finditer(r'<circle[^>]*cy="(-?[\d.]+)" r="([\d.]+)"(?:[^>]*stroke-width="([\d.]+)")?', mark):
        tops.append(float(m[1]) - float(m[2]) - float(m[3] or 0) / 2)
    tops += [float(y) for y in re.findall(r'<rect[^>]*y="(-?[\d.]+)"', mark)]
    top = min(0, *tops) - 16

    return {"mark": mark, "letters": letters, "dot": dot, "bar": bar, "caret": caret, "at_index": a_i, "top": top,
            "at": at, "at_center": (at_cx, at_cy), "hit": hit,
            "width": caret[0] + caret[2], "height": bar[1] + bar[3]}


def wordmark_svg():
    g = geometry()
    letters = "".join(
        f'<path class="wm__letter{" wm__letter--at" if i == g["at_index"] else ""}" d="{d}" style="--i:{i + 1};--from:{REVEAL_FROM[i % 4]}"/>'
        for i, d in enumerate(g["letters"])
    )
    (acx, acy), (hx, hy, hw, hh) = g["at_center"], g["hit"]
    (cx, cy, r), (bx, by, bw, bh), (kx, ky, kw, kh) = g["dot"], g["bar"], g["caret"]
    top, h = g["top"], g["height"] - g["top"] + 16
    return f'''<svg class="wm" viewBox="0 {top:.0f} {g["width"]:.0f} {h:.0f}" data-at="{acx:.0f},{acy - top:.0f},{g["width"]:.0f},{h:.0f}" fill="currentColor">
        <g class="wm__mark" aria-hidden="true">{g["mark"]}</g>
        <g class="wm__letters" aria-hidden="true">{letters}</g>
        <path class="wm__at" d="{g["at"]}" aria-hidden="true"/>
        <circle class="wm__ping" cx="{acx:.0f}" cy="{acy:.0f}" r="{hw / 2:.0f}" aria-hidden="true"/>
        <circle class="wm__shape wm__dot" cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}"/>
        <rect class="wm__shape wm__bar" x="{bx:.0f}" y="{by:.0f}" width="{bw:.0f}" height="{bh}" rx="8"/>
        <rect class="wm__shape wm__caret" x="{kx:.0f}" y="{ky:.0f}" width="{kw}" height="{kh:.0f}" rx="6"/>
        <rect class="wm__hit" x="{hx:.0f}" y="{hy:.0f}" width="{hw:.0f}" height="{hh:.0f}" tabindex="0" role="button" aria-label="Find me online" aria-expanded="false" data-wm-hit/>
      </svg>'''


def mark_svg(cls):
    svg = icon_svg(LOGO, font, pad_ratio=0.02)
    return svg.replace('<svg xmlns="http://www.w3.org/2000/svg"', f'<svg class="{cls}" aria-hidden="true"')


def inline(html, name, content):
    html, count = re.subn(
        rf"(<!-- {name}:start -->).*?(<!-- {name}:end -->)",
        lambda m: f"{m[1]}\n      {content}\n      {m[2]}",
        html, flags=re.S,
    )
    if count != 1:
        raise SystemExit(f"index.html needs one <!-- {name}:start --> … <!-- {name}:end --> block")
    return html


def build():
    index = ROOT / "index.html"
    html = inline(index.read_text(), "wordmark", wordmark_svg())
    html = inline(html, "navmark", mark_svg("nav-mark__icon"))
    html = inline(html, "heromark", mark_svg("hero__mark-icon"))
    index.write_text(html)
    (ROOT / "assets" / "img" / "favicon.svg").write_text(
        icon_svg(LOGO, font, fg="#ffffff", accent="#cdeeff", background="#3f8fd6"))
    print(f"brand built with mark '{LOGO}': footer wordmark, nav + hero mark, favicon.svg")


if __name__ == "__main__":
    build()
