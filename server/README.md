# ShineX API

Express REST API that sits between the frontend and Firestore/email. The
frontend used to talk to Firestore and EmailJS directly from the browser;
now it talks to this server, and this server is the only thing that touches
Firestore (via the Firebase Admin SDK) and sends emails (via Resend's HTTPS
API — not raw SMTP, since some networks block outbound SMTP ports entirely).

## Why this exists

- **Server-side validation** — the frontend's form validation is trivially
  bypassable by anyone calling the API directly; this re-validates everything.
- **Locked-down data** — Firestore security rules can now deny all direct
  client access (see `../firestore.rules`), because only this server's
  service account can read/write bookings.
- **No exposed credentials** — EmailJS's public key used to ship in the
  browser bundle; the email API key now stays server-side only.
- **One request instead of two** — creating a booking used to fire a
  Firestore write and an EmailJS send in parallel from the browser; now it's
  a single `POST /api/bookings` call, and the server saves first, emails
  second (so a flaky inbox never fails a booking that already saved).

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Then fill in `.env`:

1. **Firebase Admin credentials** (required — nothing works without this):
   Firebase Console → your project → ⚙️ Project Settings → Service Accounts
   → **Generate New Private Key**. Save the downloaded file as
   `server/serviceAccountKey.json` (already gitignored) and leave
   `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json` as-is.

2. **Resend API key** (required for booking/contact email notifications;
   the server still runs and saves bookings without this, it just can't
   email anyone about them): sign up at [resend.com](https://resend.com) →
   Dashboard → API Keys → Create API Key → paste it into `RESEND_API_KEY`.
   `shinex.best` is already verified as a sending domain (DKIM/SPF/DMARC
   records live in Cloudflare), so `RESEND_FROM_EMAIL=notifications@shinex.best`
   can send to any address — no sandbox restriction.

Run it:

```bash
npm run dev     # auto-restarts on file changes (Node's built-in --watch)
npm start        # plain run, no watching
```

You should see:

```
✅ ShineX API running at http://localhost:5000
   Health check:  http://localhost:5000/api/health
```

If you see a `❌ Failed to start` message instead, it's almost always the
Firebase credentials — re-check step 1 above.

## Running alongside the frontend

From the repo root:

```bash
npm run dev:all     # starts the Vite frontend AND this API together
```

The frontend calls `http://localhost:5000/api` by default (see
`src/config/api.js`) — override with `VITE_API_URL` in a root `.env` if this
server runs somewhere else.

## Deploying to Railway

This repo is a monorepo — the Vite frontend lives at the root, this API
lives in `server/`. Railway needs to know to build/run only this
subdirectory.

1. **New Project → Deploy from GitHub repo** → pick this repo.
2. Once created, open the service → **Settings → Root Directory** → set it
   to `server`. Railway auto-detects Node.js from `package.json` after
   that (`npm install` then `npm start` — no build step needed, this is
   plain Node, not compiled).
3. **Settings → Variables** — add every one of these (Railway env vars,
   not a `.env` file — nothing in `.gitignore` ever reaches the server):

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | `https://shinex.best` — **without this set correctly, the deployed API will reject every request from the live site** with a CORS error; it defaults to `localhost:5173` otherwise |
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | The *entire* contents of `server/serviceAccountKey.json`, minified to one line. Railway has no persistent file storage, so `FIREBASE_SERVICE_ACCOUNT_PATH` (the local-dev option) won't work here — this JSON-string variant is what `firebaseAdmin.js` falls back to. |
   | `RESEND_API_KEY` | Same value as your local `.env` |
   | `RESEND_FROM_EMAIL` | `notifications@shinex.best` |
   | `BOOKING_NOTIFY_EMAIL` | `reviews.shinex@gmail.com` |
   | `CONTACT_NOTIFY_EMAIL` | `reviews.shinex@gmail.com` |

   Leave `PORT` unset — Railway injects its own and `env.js` already reads
   `process.env.PORT` first.

4. Deploy. Check the logs for the same `✅ ShineX API running at...`
   banner you see locally, then confirm `https://<your-app>.up.railway.app/api/health`
   responds.
5. Once you have that URL, update the **frontend's** `VITE_API_URL` (wherever
   the frontend itself is hosted — this repo's root `.env`/build config) to
   point at it instead of `localhost:5000`, and redeploy the frontend.

To turn the minified JSON one-liner for step 3, from the repo root:

```bash
node -e "console.log(JSON.stringify(require('./server/serviceAccountKey.json')))"
```

Copy that single line as the value for `FIREBASE_SERVICE_ACCOUNT_JSON`.

## API reference

All responses are JSON, shaped `{ success: true, ... }` or
`{ success: false, error: "message" }`.

| Method | Path                       | Auth      | Description |
|--------|----------------------------|-----------|--------------|
| GET    | `/api/health`              | —         | Liveness check |
| POST   | `/api/bookings`            | Public    | Create a booking; saves to Firestore, emails `BOOKING_NOTIFY_EMAIL` |
| GET    | `/api/bookings`            | Admin     | List bookings. Query params: `status`, `service`, `search`, `sort` (`newest`\|`oldest`\|`date-asc`\|`amount-desc`\|`amount-asc`) |
| GET    | `/api/bookings/stats`      | Admin     | Aggregate counts + revenue |
| PATCH  | `/api/bookings/:id/status` | Admin     | Body: `{ "status": "pending"\|"confirmed"\|"completed"\|"cancelled" }` |
| POST   | `/api/contact`             | Public    | Sends a message to `CONTACT_NOTIFY_EMAIL` (no database write) |

**Admin** routes require `Authorization: Bearer <firebase-id-token>` — the
frontend gets this from `firebaseUser.getIdToken()` after signing in with
Firebase Auth exactly as before; nothing changed about how admin login works,
this server just verifies that token server-side before returning any data.

Public write endpoints (`POST /api/bookings`, `POST /api/contact`) are rate
limited to 20 requests per IP per 15 minutes.

## Customer emails

Four emails can go out around a single booking's lifecycle:

| When | To | What |
|------|-----|------|
| Booking created | `BOOKING_NOTIFY_EMAIL` (business) | Branded HTML with Call/WhatsApp/**Get Directions** buttons (directions link to the customer's exact pinned map location) |
| Booking created | The customer (if they gave an email) | Branded HTML **receipt** — status "Processing", full details, price |
| Admin changes status | The customer | Branded HTML **status update** — tailored copy per status (confirmed/completed/cancelled/pending) |
| Contact form submitted | `CONTACT_NOTIFY_EMAIL` (business) | Plain-text internal notification |

All HTML templates live in `server/src/services/emailTemplates.js`, using the
ShineX logo and green brand colors. All four emails are fire-and-forget from
the request handler's perspective — a booking/status-update always succeeds
and responds immediately even if the email send fails or is slow; failures
are logged, never surfaced to the requester.

`shinex.best` is verified in Resend (Dashboard → Domains → status
"Verified"), so these emails deliver to any real customer address — the
account is no longer limited to sending only to its own signup email.

## Project layout

```
server/src/
  index.js                 entry point
  app.js                   Express app: middleware + route mounting
  config/
    env.js                 reads process.env with defaults
    firebaseAdmin.js       Admin SDK init (Firestore + Auth verification)
  middleware/
    auth.js                verifies Firebase ID tokens on admin routes
    rateLimiter.js
    validate.js            turns express-validator errors into { success, error }
    errorHandler.js        404 + centralized error responses
  routes/                  → controllers/ → services/
  controllers/             request/response handling
  services/
    bookings.service.js    all Firestore reads/writes live here
    email.service.js       Resend API notifications
    emailTemplates.js      branded HTML for customer-facing emails
  validators/              express-validator rule sets per route
  utils/asyncHandler.js    forwards rejected promises to error middleware
```
