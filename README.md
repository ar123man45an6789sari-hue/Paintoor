# Paintoor

Location-based home services marketplace, starting with one craft: **painting**.
Customers, verified painting partners and paint shops —
built around approval-first money (payment releases only after the customer
approves the finished work).

**Pilot: Mumbai, Maharashtra** — built to open city by city until it covers
India. The launch list lives in exactly one place (`PILOT_CITIES` in
`packages/mock-api`), and every live-city surface reads it: city pages, the
sitemap, the search hint, the post-job wizard, the hero badge, the landing
marquee, the partner filters and the SEO copy. Opening the next city (Vadodara)
is an env var — `NEXT_PUBLIC_LAUNCH_CITIES="Mumbai,Vadodara"` — plus a rebuild;
no component edits, no drift. Every other Indian city already renders with an
honest "not live yet" state and stays out of the index; URLs outside India
return a real 404.
UI languages: English, हिंदी, ગુજરાતી.

## Status

Landing + client-side wall-paint simulator are live in the web app.
Bookings, quotes and dashboards run on mock seed data while the pilot backend
is built. Legal pages (terms / privacy / refund) are in place.

## What is in the box

- **Wall-paint Studio** (`/studio`) — fully client-side simulator: tap a wall
  and every matching pixel repaints (global match), square brush + eraser,
  lighting-preserving recolour, undo/redo, save-progress layers, PNG export.
  Photos never leave the device.
- **Landing** — hero, brand stage carousel (partner paint brands), scrollytelling
  "how it works", rate-card teaser with live adjustment sliders.
- **Partner Bazaar** (`/partners`, old `/providers` redirects) — verified painter
  browser with city, area and skill filters.
- **Marketplace** (`/marketplace`) — digital paint shop: compare neighbourhood
  store prices, size a room's kit, one escrow-backed cart.
- **Role dashboards** — customer, provider and shopkeeper shells behind
  a demo auth (localStorage session).
- **i18n** — en / hi / gu dictionaries, browser-locale detection on first visit,
  saved choice afterwards.
- **Legal** — `/terms`, `/privacy`, `/refund` in all three languages.

## Workspace layout
apps/
web/ Next.js app (landing, studio, dashboards, legal)
src/
lib/ paint engine, session + provider state helpers
i18n*.ts en / hi / gu dictionaries + provider
components/ studio, header, footer, landing sections
packages/
brand/ company identity (legal name, address, powered-by line)
mock-api/ seed providers + shops used by the pilot frontend


## Scripts

Run from the repo root — npm workspaces forward each script to `apps/web`:

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server on http://localhost:3000 |
| `npm run build` | Production build (prerenders the launch-city pages) |
| `npm run lint` | ESLint across the workspace |
| `npm run typecheck` | `tsc --noEmit` across the workspace |

Inside `apps/web` there is also `npm start`, which serves the production build.