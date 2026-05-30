# CP-Hub — Firebase setup

CP-Hub uses Firebase for authentication, Firestore for user/event/leaderboard data, and (optionally) Firebase Storage for event images. Follow these one-time steps **before** running the app.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it something like `cp-hub` (the actual ID can differ). You can disable Google Analytics — it isn't needed.
3. Wait for the project to finish provisioning, then open it.

## 2. Register a web app

1. On the project overview page click the **`</>`** (Web) icon.
2. App nickname: `cp-hub-web`. Skip Firebase Hosting for now.
3. Firebase shows a `firebaseConfig` object — keep this tab open, you'll paste these values in step 6.

## 3. Enable Email/Password authentication

1. Left sidebar → **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Email/Password** → toggle **Enable** → Save.

## 4. Create the Firestore database

1. Left sidebar → **Buildwe → Firestore Database → Create database**.
2. Choose **Production mode**.
3. Pick a region near you (e.g. `asia-south1` for India). This can't be changed later.
4. Click **Enable**.

## 5. Install the Firestore security rules

1. In Firestore, open the **Rules** tab.
2. Replace the contents with the rules from [`firestore.rules`](./firestore.rules) at the repo root.
3. Click **Publish**.

## 6. (Optional) Enable Firebase Storage for event images

1. Left sidebar → **Build → Storage → Get started**.
2. Production mode, same region as Firestore.

## 7. Generate a service-account key for the backend

1. ⚙ (Project settings) → **Service accounts** → **Generate new private key** → confirm.
2. Save the downloaded JSON as `backend/serviceAccountKey.json` in this repo. It's already gitignored — **never commit it**.

> For deployments where you can't ship a JSON file (e.g. Vercel) base64-encode the file (`base64 -i serviceAccountKey.json | pbcopy`) and set `FIREBASE_SERVICE_ACCOUNT_B64` instead of mounting the file.

## 8. Fill the frontend env file

Copy `frontend/.env.example` to `frontend/.env.local`, then fill in the values from step 2:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=cp-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cp-hub
VITE_FIREBASE_STORAGE_BUCKET=cp-hub.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 9. Backend env

Create `backend/.env`:

```
PORT=3001
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
# Or, for hosted environments:
# FIREBASE_SERVICE_ACCOUNT_B64=...
```

## 10. Promote your first admin

The very first admin has to be promoted manually — there's no UI bootstrap for it on purpose.

1. Register a user normally through the website's `/register` page.
2. Open the Firebase console → Firestore → `users` collection → click the doc whose `email` matches you.
3. Edit the `role` field from `user` → `admin`. Save.

You can now sign back in and the `/admin/*` pages will be visible.

## 11. Install & run

```bash
# From repo root
cd frontend && npm install
cd ../backend && npm install
cd ..
npm run dev:backend   # in one terminal
npm run dev:frontend  # in another
```

That's it.
