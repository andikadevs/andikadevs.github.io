"""Swap generated markup into index.html between <!-- name:start --> / <!-- name:end --> markers."""
import re


def inline(html, name, content):
    html, count = re.subn(
        rf"(<!-- {name}:start -->).*?(<!-- {name}:end -->)",
        lambda m: f"{m[1]}\n      {content}\n      {m[2]}",
        html, flags=re.S,
    )
    if count != 1:
        raise SystemExit(f"index.html needs one <!-- {name}:start --> … <!-- {name}:end --> block")
    return html
