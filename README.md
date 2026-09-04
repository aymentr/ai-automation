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

- Hero section with an animated canvas particle network (CSS/JS — no
  external assets required) and a live waitlist counter
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

## Swapping in the Higgsfield hero animation

The hero currently uses a lightweight built-in canvas animation (an
animated particle network) so the page ships without any external
dependency. To replace it with a Higgsfield-generated hero video once you
have credits/a plan on Higgsfield:

1. Generate a hero clip with Higgsfield (e.g. a looping abstract
   "AI network / automation" animation in your brand colors —
   `#6366f1` → `#22d3ee`).
2. Export it and save it as `public/img/hero-animation.mp4` (add a poster
   frame as `public/img/hero-animation-poster.jpg` if you want one).
3. In `public/index.html`, find the `#heroVideoSlot` block in the hero
   section and replace it with:

   ```html
   <div class="hero-video-slot">
     <video class="hero-video" autoplay muted loop playsinline
            poster="img/hero-animation-poster.jpg">
       <source src="img/hero-animation.mp4" type="video/mp4" />
     </video>
   </div>
   ```

4. Add a `.hero-video` CSS rule in `public/css/style.css` to size/position
   it (e.g. `position: absolute; inset: 0; width: 100%; height: 100%;
   object-fit: cover; z-index: -2;`), and remove or dial back the
   `.hero-canvas` opacity if you want the video as the sole background.

## Brand

- **Name:** Autonoma
- **Tagline:** Automation that runs itself.
- **Palette:** background `#08080d`, indigo `#6366f1`, cyan `#22d3ee`
- **Type:** Space Grotesk (headings), Inter (body)
