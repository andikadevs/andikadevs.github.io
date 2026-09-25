"""Right-sizes the site's raster images. Safe to re-run: only shrinks, never upscales.

  assets/projects/*/*.webp  → <name>.webp capped at 1600px wide, plus <name>-800.webp
                              (js/core/media.js builds the srcset from that naming)
  assets/logos/*.webp       → 88px tall (2× the largest display size)
  assets/img/andika.webp    → 720px, plus andika-480.webp

Run from the repo root:  python3 tools/optimize_images.py   (needs Pillow)
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def save(im, path, quality=80):
    im.save(path, "WEBP", quality=quality, method=6)


def fit_width(src, width, dest=None, quality=80):
    im = Image.open(src)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    save(im.convert("RGB") if im.mode not in ("RGB", "RGBA") else im, dest or src, quality)


def main():
    before = sum(p.stat().st_size for p in (ROOT / "assets").rglob("*.webp"))
    for shot in sorted((ROOT / "assets" / "projects").glob("*/*.webp")):
        if shot.stem.endswith("-800"):
            continue
        fit_width(shot, 1600)
        fit_width(shot, 800, shot.with_name(f"{shot.stem}-800.webp"), quality=78)
    for logo in (ROOT / "assets" / "logos").glob("*.webp"):
        im = Image.open(logo)
        if im.height > 88:
            im = im.resize((round(im.width * 88 / im.height), 88), Image.LANCZOS)
        save(im, logo, 90)
    photo = ROOT / "assets" / "img" / "andika.webp"
    fit_width(photo, 480, photo.with_name("andika-480.webp"), quality=82)
    after = sum(p.stat().st_size for p in (ROOT / "assets").rglob("*.webp"))
    print(f"webp total: {before / 1e6:.1f} MB → {after / 1e6:.1f} MB (incl. new -800 variants)")


if __name__ == "__main__":
    main()
