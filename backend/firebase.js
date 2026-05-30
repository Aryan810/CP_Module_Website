// Backend Firebase Admin initialisation.
// Loads credentials from either FIREBASE_SERVICE_ACCOUNT_PATH (a JSON file)
// or FIREBASE_SERVICE_ACCOUNT_B64 (base64-encoded JSON, useful on Vercel).
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let initialised = false;

function init() {
  if (initialised) return admin;

  let credentialJson = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    try {
      credentialJson = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
      );
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_B64:', e.message);
    }
  } else {
    const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
    const abs = path.isAbsolute(p) ? p : path.join(__dirname, p);
    if (fs.existsSync(abs)) {
      try {
        credentialJson = JSON.parse(fs.readFileSync(abs, 'utf8'));
      } catch (e) {
        console.error('Failed to parse service account file at', abs, e.message);
      }
    }
  }

  if (!credentialJson) {
    console.warn(
      '[CP-Hub backend] No Firebase service account found. Admin endpoints will reject all requests. ' +
        'See FIREBASE_SETUP.md.'
    );
    initialised = true;
    return admin;
  }

  admin.initializeApp({
    credential: admin.credential.cert(credentialJson),
  });
  initialised = true;
  return admin;
}

init();

const isReady = () => admin.apps.length > 0;

module.exports = {
  admin,
  isReady,
  auth: () => (isReady() ? admin.auth() : null),
  db: () => (isReady() ? admin.firestore() : null),
};
