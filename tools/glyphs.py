"""Turn text set in the site's display font into SVG path data.

Used to build the animated footer wordmark and the logo explorations, so the
marks share the exact letterforms of the headlines. Needs: pip install fonttools brotli
"""
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONT = Path(__file__).resolve().parent.parent / "fonts" / \
    "bricolagegrotesque_v9_3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGIInE.woff2"


class Font:
    def __init__(self, path=FONT):
        self.tt = TTFont(path)          # default instance: wght 800, opsz 96
        self.glyphs = self.tt.getGlyphSet()
        self.cmap = self.tt.getBestCmap()
        head = self.tt["hhea"]
        self.ascent, self.descent = head.ascent, head.descent

    def name(self, char):
        return self.cmap[ord(char)]

    def advance(self, glyph):
        return self.glyphs[glyph].width

    def bounds(self, glyph):
        pen = BoundsPen(self.glyphs)
        self.glyphs[glyph].draw(pen)
        return pen.bounds

    def path(self, glyph, x=0.0, baseline=0.0, scale=1.0):
        """SVG path for a glyph, y flipped so the baseline sits at `baseline`."""
        pen = SVGPathPen(self.glyphs, ntos=lambda n: f"{n:.1f}".rstrip("0").rstrip("."))
        self.glyphs[glyph].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        return pen.getCommands()

    def contours(self, glyph):
        """Recorded contours, each as its own list of pen operations."""
        pen = RecordingPen()
        self.glyphs[glyph].draw(pen)
        out, current = [], []
        for op, args in pen.value:
            current.append((op, args))
            if op in ("closePath", "endPath"):
                out.append(current)
                current = []
        return out

    def layout(self, text, tracking=0, glyph_for=None):
        """[(glyph, x)] for a line of text; glyph_for lets callers swap glyphs (e.g. dotless i)."""
        x, out = 0, []
        for char in text:
            glyph = (glyph_for or {}).get(char) or self.name(char)
            out.append((glyph, x))
            x += self.advance(glyph) + tracking
        return out, x - tracking
