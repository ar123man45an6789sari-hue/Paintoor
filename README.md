# Paintoor

Location-based home services marketplace, starting with one craft: **painting**.
Customers, verified painting partners, paint shops and an admin console —
built around approval-first money (payment releases only after the customer
approves the finished work).

**Pilot city: Mumbai, Maharashtra.** Vadodara, Gujarat is live alongside it.
Every other Indian city renders with an honest "not live yet" state and stays
out of the index; URLs outside India return a real 404.
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
- **Marketplace** (`/providers`) — partner browser with city/skill filters.
- **Role dashboards** — customer, provider, shopkeeper and admin shells behind
  a demo auth (localStorage session).
- **i18n** — en / hi / gu dictionaries, browser-locale detection on first visit,
  saved choice afterwards.
- **Legal** — `/terms`, `/privacy`, `/refund` in all three languages.

## Workspace layout

```
apps/
  web/                Next.js app (landing, studio, dashboards, legal)
    src/
      lib/            paint engine, session + provider state helpers
      i18n*.ts        en / hi / gu dictionaries + provider
      components/     studio, header, footer, landing sections
packages/
  brand/              company identity (legal name, address, powered-by line)
  mock-api/           seed providers + shops used by the pilot frontend
```

## Scripts