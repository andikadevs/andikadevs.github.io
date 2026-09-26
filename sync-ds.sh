#!/usr/bin/env sh
# Copies the Blueprint design system into this site. Run after editing ~/Designs/blueprint-ds.
set -eu
DS="${DS:-$HOME/Designs/blueprint-ds}"
cd "$(dirname "$0")"
cp "$DS"/css/tokens.css "$DS"/css/base.css "$DS"/css/components.css css/
cp "$DS"/js/nav.js "$DS"/js/reveal.js "$DS"/js/marquee.js "$DS"/js/toast.js "$DS"/js/segmented.js "$DS"/js/tilt.js \
   "$DS"/js/smooth-scroll.js "$DS"/js/scroll-progress.js "$DS"/js/split-text.js "$DS"/js/count-up.js "$DS"/js/magnetic.js "$DS"/js/night-sky.js "$DS"/js/theme-toggle.js "$DS"/js/paint-scene.js "$DS"/js/hscroll.js "$DS"/js/text-roll.js "$DS"/js/pause-offscreen.js js/ds/
mkdir -p js/ds/vendor && cp "$DS"/js/vendor/lenis.mjs js/ds/vendor/
cp "$DS"/css/lenis.css css/
cp "$DS"/js/theme.js js/theme.js
cp "$DS"/fonts/* fonts/
echo "Synced from $DS"
