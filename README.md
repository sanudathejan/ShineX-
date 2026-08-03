# ShineX

Marketing + booking site for a Dubai cleaning company (home cleaning,
furniture cleaning, car wash), with an admin dashboard for managing bookings.

- **Frontend** — React 19 + Vite, deployed as a static site to GitHub Pages
  at [shinex.best](https://shinex.best)
- **Backend** — Express REST API (`server/`) using the Firebase Admin SDK for
  Firestore, and Resend's HTTPS API for email notifications
- **Auth** — Firebase Authentication (email/password) gates the admin
  dashboard at `/admin`

## Architecture

```
Browser
  │
  ├─ Firebase Auth (client SDK)  ── admin sign-in only
  │
  └─ fetch → Express API (server/)
                │
                ├─ Firebase Admin SDK → Firestore   (bookings collection)
                └─ Resend API → HTTPS               (booking/contact emails)
```

The frontend never talks to Firestore or an email provider directly — every
booking, status update, and contact message goes through the API in
`server/`. See `server/README.md` for why, and the full endpoint reference.

## Running locally

You need both halves running: the Vite dev server (frontend) and the
Express API (backend).

```bash
npm install              # frontend deps
cd server && npm install # backend deps (first-time only)
cd ..

npm run dev:all          # runs both together
```

Or run them in separate terminals:

```bash
npm run dev       # frontend → http://localhost:5173
npm run server    # backend  → http://localhost:5000
```

**Before the backend will actually work**, it needs a Firebase service
account key and (optionally, for email) a Resend API key — see
`server/README.md` → Setup. Without them the API still starts for most of
this, but nothing that touches Firestore or sends email will succeed.

## Project structure

```
src/                 React frontend
  pages/              Home, Services, Book, About, Contact, Admin
  components/         Navbar, Footer
  data/services.js    single source of truth for service names/packages/prices
  services/           thin REST clients (bookingService, contactService)
  config/
    api.js             fetch wrapper for the backend
    firebase.js         Firebase Auth client config (admin login only)

server/              Express REST API — see server/README.md
  src/
    routes/ → controllers/ → services/
    middleware/         auth verification, rate limiting, validation, errors
    config/             env, Firebase Admin SDK init

firestore.rules     denies all direct client access (server-only access via Admin SDK)
```

## Deployment

- **Frontend**: `npm run deploy` builds and pushes `dist/` to the `gh-pages`
  branch (GitHub Pages serves static files only — it cannot host `server/`).
- **Backend**: needs its own host (Render, Railway, a VPS, etc.) since it's a
  long-running Node process. Not yet deployed anywhere — currently built to
  run locally. Once you have a URL for it, point the frontend at it via
  `VITE_API_URL` (see `.env.example`).
