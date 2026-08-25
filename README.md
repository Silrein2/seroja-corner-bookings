# Seroja Corner — Standalone Admin Tools (Prototype)

Version **0.1.0-prototype**

A self-contained Vue 3 + Vite + Tailwind v4 app for recording bookings and
generating manual invoices. It talks to the **same Firebase project** as the
main app but keeps all its data in its own Firestore collection
(`standalone_bookings`), so nothing is shared with the main site. No login —
this is a test build.

## What's inside

- **Home** (`/`) — hub with two entry points.
- **Bookings & Calendar** (`/booking`) — admin-only booking form (Guest Name,
  Phone, free-text Service/Room Name, Type, dates, itemized breakdown with
  Base Cost + Extended Services, Grand Total, Payment Method) plus a month
  calendar colour-coded by service type. **Tap any booking on the calendar** to
  jump into the Manual Invoice form pre-filled with that booking's details.
- **Manual Invoice** (`/manual-invoice`, or `/manual-invoice/:id` when opened
  from the calendar) — same fields as the booking form, plus a Payment Status
  dropdown (Checked Out / Checked In / Deposit) and the Admin Authorization
  block (name, phone, signature). Generating updates the same booking (when
  opened from the calendar) or creates a new one.
- **Invoice** (`/invoice/:id`) — the receipt. **Generate PDF** produces a clean
  A4 PDF (no browser header/footer/URL, no rental-agreement page) and opens it
  in a new tab to print/save/share manually.

## First-time setup

1. Install dependencies:
   ```
   npm install
   ```
2. Add the Firestore rules for the new collection. Open your main project's
   `firestore.rules`, paste the block from `firestore.rules.snippet` inside the
   documents match, then deploy:
   ```
   firebase deploy --only firestore:rules
   ```
   (Without this, reads/writes to `standalone_bookings` are denied.)

## Run locally

```
npm run dev
```

## Deploy to Firebase Hosting

This app builds to `dist/`. To host it **separately** from your main site,
create a new Hosting target (or a new Firebase Hosting site) and point it here,
then:

```
npm run build
firebase deploy --only hosting
```

`firebase.json` already includes the SPA rewrite so deep links
(`/invoice/xxxx`) resolve correctly.

## Notes & limitations

- **Deposit** status is stored as `confirmed` for compatibility with the main
  app's status vocabulary; the invoice displays it as "Deposit".
- New bookings from the booking form default to status `confirmed`.
- Admin signatures are stored inline as PNG data URLs in Firestore (no Firebase
  Storage dependency).
- The generated PDF is image-based (pixel-perfect, not text-selectable).
- Security: rules are fully open for the prototype. Add authentication and
  restrict the rules before using real guest data.
- Phone push notifications for upcoming bookings are **not** included in this
  prototype (planned for a later, authenticated phase).
