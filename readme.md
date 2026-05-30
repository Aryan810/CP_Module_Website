# CP-Hub

The IIT Guwahati Coding Club website — events, leaderboards, profiles and a Codeforces dashboard, all editable by club admins.

## Stack

- **Frontend**: React 19 + Vite + React Router (`frontend/`)
- **Backend**: Node.js + Express (`backend/`) — thin auth + Firestore proxy
- **Auth / data**: Firebase Auth + Cloud Firestore (+ optional Storage)
- **External**: Codeforces public API for live rating data; clist.by for the contest calendar

## Project layout

```
.
├── frontend/
│   ├── public/data/        ← editable site content (committed JSON)
│   │   ├── site.json
│   │   ├── home.json
│   │   ├── events/         (index.json + one file per event)
│   │   └── leaderboards/   (index.json + one file per board)
│   └── src/
│       ├── pages/          (Home, Events, EventDetail, Leaderboard, Profile, Login, Register, …)
│       ├── pages/admin/    (admin dashboards: events, leaderboards)
│       ├── components/     (Navbar, UserProfile, RouteGuards, …)
│       ├── context/        (AuthContext — Firebase Auth wrapper)
│       ├── services/api.js (single API client + static loaders)
│       ├── leaderboardDsl.js  ← tiny safe DSL used by leaderboard configs
│       └── firebase.js     (frontend Firebase init)
├── backend/
│   ├── routes/             (users, events, leaderboards, codeforces, cfUpdate)
│   ├── middleware/auth.js  (verifyAuth + requireAdmin via Firebase ID tokens)
│   ├── firebase.js         (firebase-admin init from service account)
│   └── services/           (Codeforces fetchers)
├── firestore.rules         ← paste into Firebase console
├── FIREBASE_SETUP.md       ← one-time setup walkthrough (read first!)
└── TODO_HISTORY.md         (old project notes)
```

## Editable content

Anything under `frontend/public/data/` is editable just by editing JSON and redeploying. To add a new event:

1. Create `frontend/public/data/events/my-event.json` (use the existing ones as a template).
2. Add its filename to `frontend/public/data/events/index.json`.

Admins can also add events live from `/admin/events` — those are stored in Firestore and merged into the same listing (Firestore wins on slug conflict).

## Leaderboard DSL

Each leaderboard config defines columns and a sort rule using a tiny expression language. Per-user fields available:

```
name, username, email, cfusername,
cf_rating, cf_max_rating, cf_rank, cf_max_rank,
extras.<any-key>     ← admin-set custom values (e.g. bonus points)
```

Supported syntax: literals, identifiers, `+ - * / %`, comparisons, `&&`, `||`, `!`, ternary `a ? b : c`, function calls, property access.

Built-ins: `max, min, if, len, upper, lower, concat, round, sum, default, contains`.

Example column expression:

```
cf_rating + 10 * default(extras.bonus, 0)
```

See `frontend/src/leaderboardDsl.js` for the implementation (recursive-descent parser + safe interpreter — no `eval`).

## First-time setup

1. **Read `FIREBASE_SETUP.md`** — it walks you through creating the Firebase project, enabling Email/Password auth, creating Firestore, pasting the rules from `firestore.rules`, downloading a service account, and promoting the first admin.
2. Copy `frontend/.env.example` → `frontend/.env.local` and fill in the `VITE_FIREBASE_*` values from the Firebase console.
3. Place your downloaded service account JSON at `backend/serviceAccountKey.json` (gitignored).

```bash
# install deps
cd frontend && npm install
cd ../backend && npm install

# run dev
cd backend && npm start          # http://localhost:5000
cd frontend && npm run dev       # http://localhost:3000

# build
cd frontend && npm run build
```

## Roles

- All registered users get `role: "user"` automatically.
- Promote yourself to `admin` by editing `users/<your-uid>` in the Firestore console and setting `role: "admin"` (see `FIREBASE_SETUP.md` step 10).
- Admin-only UI: the `Admin` nav link + everything under `/admin/*`.
- Admin-only API: `POST/PUT/DELETE` on `/api/events`, `/api/leaderboards`, `/api/users/:uid/role`.

## What you can customise without writing code

| To change… | Edit |
| --- | --- |
| Site name, tagline, footer | `frontend/public/data/site.json` |
| Home page intro / features | `frontend/public/data/home.json` |
| Events (committed) | `frontend/public/data/events/*.json` |
| Events (live) | `/admin/events` |
| Leaderboards | `frontend/public/data/leaderboards/*.json` or `/admin/leaderboards` |
