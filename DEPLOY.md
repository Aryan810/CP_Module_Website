# Deploying CP-Hub to Vercel

This project is configured to deploy as a single Vercel project with:
- **Frontend** (React/Vite) served statically from `frontend/dist`
- **Backend** (Express) running as one serverless function at `api/index.js`
- API requests `/api/*` are rewritten to the function (see `vercel.json`)

---

## 1. Push to GitHub (clean first!)

The previous commits contained secrets. Before pushing the new branch:

```bash
# Make sure these are no longer tracked (already done in this repo):
git ls-files | grep -E 'serviceAccountKey|\.env$|\.env\.local|\.env\.production|\.env\.development'
# (should print nothing)

git add .
git commit -m "Prepare for Vercel deployment"
git push
```

> ⚠️ **If your repo was ever public with `backend/serviceAccountKey.json` committed,
> rotate that key in the Firebase Console → Project Settings → Service Accounts → "Manage service account permissions" → revoke the old key and generate a new one.**

---

## 2. Create the Vercel project

1. Go to <https://vercel.com/new>
2. Import the GitHub repo.
3. Framework Preset: **Other** (Vercel will read `vercel.json`).
4. Leave Build/Output settings empty — they come from `vercel.json`.
5. Click **Deploy** (it will fail the first time without env vars — that's fine).

---

## 3. Add Environment Variables in Vercel

Project Settings → **Environment Variables**. Add the following for **Production, Preview, Development**:

### Backend (server-side, NO `VITE_` prefix)

| Name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_B64` | base64 of your service account JSON (see below) |

Generate the base64 value locally:
```bash
base64 -i backend/serviceAccountKey.json | pbcopy     # macOS
# or
base64 -w0 backend/serviceAccountKey.json             # Linux
```
Paste the result as the value.

### Frontend (build-time, MUST start with `VITE_`)

| Name | Value |
|---|---|
| `VITE_API_BASE_URL` | `/api` |
| `VITE_APP_TITLE` | `CP-Hub` |
| `VITE_FIREBASE_API_KEY` | from Firebase console |
| `VITE_FIREBASE_AUTH_DOMAIN` | `cphub-6c460.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `cphub-6c460` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `cphub-6c460.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase console |
| `VITE_FIREBASE_APP_ID` | from Firebase console |

> The `VITE_FIREBASE_*` values are the same ones in `frontend/.env.local`.

---

## 4. Authorise your Vercel domain in Firebase Auth

Firebase Console → Authentication → **Settings** → **Authorized domains** → Add:
- `your-project.vercel.app`
- any custom domain you attach

Otherwise Google/email sign-in will fail in production.

---

## 5. Redeploy

After adding env vars, click **Redeploy** on the latest deployment (or push another commit).

---

## 6. Verify

- `https://<your-app>.vercel.app/` → loads the React app
- `https://<your-app>.vercel.app/api/` → returns `{"message":"CP-Hub backend is up."}` *(actually `/` not `/api`, since the Express root route is `/`)*
- `https://<your-app>.vercel.app/api/users` → returns the user list (admin endpoints need auth)
- Sign in, browse Events / Leaderboard / Profile

---

## What you must do (checklist)

- [ ] Rotate the Firebase service account key if the old one was pushed publicly
- [ ] Generate `FIREBASE_SERVICE_ACCOUNT_B64` and add it to Vercel
- [ ] Add all `VITE_FIREBASE_*` env vars to Vercel
- [ ] Add the Vercel domain to Firebase Auth → Authorized domains
- [ ] Push the cleaned repo and trigger a deploy

---

## Files added/changed for Vercel

- `vercel.json` — build/output/rewrite config
- `api/index.js` — serverless wrapper around `backend/index.js`
- `package.json` — root `vercel-build` script + backend runtime deps so Vercel's tracer bundles them
- `.gitignore` — properly ignores secrets (`.env*`, `serviceAccountKey.json`)
- `backend/serviceAccountKey.json`, `backend/.env`, `frontend/.env.*` — **untracked** from git (your local copies remain)
