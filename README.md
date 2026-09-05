# Autonoma

**Automation that runs itself.**

Autonoma is an AI automation service: describe the outcome you want in
plain English, and autonomous agents plan, build, and run the workflow for
you — connecting your existing tools instead of another brittle chain of
if-this-then-that steps.

This repo contains the pre-launch marketing site and waitlist.

## What's in here

```
public/            Static landing page (HTML/CSS/JS, no build step)
  index.html
  css/style.css
  js/main.js
server.js          Minimal Express server: serves public/ + waitlist API
data/waitlist.json Waitlist signups (created at runtime, gitignored)
```

The landing page includes:

- Hero section with a Higgsfield-generated looping background animation
  (`public/img/hero-animation.mp4`) and a live waitlist counter. If the
  video can't load or play, it falls back automatically to a built-in
  canvas particle-network animation (CSS/JS, no external assets) so the
  hero never breaks
- Feature grid, "how it works" steps, stats, and FAQ, all with
  scroll-reveal animations
- A waitlist signup form in the hero and in the footer CTA
- Full keyboard/screen-reader accessibility basics (skip link, labeled
  inputs, `aria-live` status messages) and `prefers-reduced-motion` support

## Running locally

```bash
npm install
npm start
```

Then open http://localhost:3000. Signing up adds an entry to
`data/waitlist.json` (email + timestamp) via `POST /api/waitlist`; the
live counter reads from `GET /api/waitlist/count`.

If you only serve `public/` as static files (e.g. GitHub Pages, S3, or any
static host with no Node backend), the form still works: it falls back to
queuing the email in the visitor's browser (`localStorage`) and shows the
same success message, so the page never breaks — but for real waitlist
capture you need the Express server (or your own backend) running behind
`/api/waitlist`.

## Deploying

Any Node host works out of the box (Render, Railway, Fly.io, a VPS, etc.)
— `npm install && npm start`. For a persistent, multi-instance waitlist
in production, swap the JSON-file storage in `server.js` for a real
database (Postgres, SQLite, etc.); the file storage here is intentionally
simple for getting a working waitlist live fast.

## The Higgsfield hero animation

`public/img/hero-animation.mp4` ("Genesis Network") is a cinematic clip
generated with Higgsfield (model: `seedance_2_5`, 1080p, 8s, no audio,
high bitrate): a galaxy of glowing light particles converges into a vast
three-dimensional neural network as the camera pushes through it —
volumetric light, lens flares, and pulsing node connections. It plays as
the hero background (`#heroVideo` in `public/index.html`); a dark radial
overlay (`.hero-video-slot::after` in `style.css`) keeps hero text legible
over it.

Note: `seedance_2_5` at `bitrate_mode: "high"` + 1080p renders in **HEVC
(H.265, 10-bit)**, which most browsers other than Safari can't play
natively in `<video>`. The shipped file was re-encoded to H.264
(`ffmpeg -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -movflags
+faststart`) for universal playback — always do this conversion before
using a `bitrate_mode: "high"` 1080p Higgsfield clip as a `<video>` source.

The built-in canvas particle-network animation is still in the page as an
automatic fallback: `public/js/main.js` dims the canvas once the video
fires its `playing` event, and un-dims it if the video ever fires `error`
(unsupported format, blocked autoplay, slow network, etc.), so the hero
never shows a blank background.

To regenerate or swap the clip:

1. Generate a new hero clip with Higgsfield (looping abstract
   "AI network / automation" motion, brand colors above).
2. Export it and overwrite `public/img/hero-animation.mp4` (same
   filename — no other changes needed), or point the `<source>` in
   `public/index.html` at a new filename.

## Brand

- **Name:** Autonoma
- **Tagline:** Automation that runs itself.
- **Palette:** background `#08080d`, indigo `#6366f1`, cyan `#22d3ee`
- **Type:** Space Grotesk (headings), Inter (body)
