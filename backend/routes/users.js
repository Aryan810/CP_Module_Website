// User profile routes (Firestore-backed).
// Auth itself happens client-side via Firebase Auth; this file just stores
// and serves the public profile document for each user (at users/{uid}).
const express = require('express');
const { db, isReady } = require('../firebase');
const { verifyAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: list all users (basic public fields). Used to populate
// "pick users" selectors in admin pages and to render the leaderboard.
router.get('/', async (req, res) => {
  if (!isReady()) return res.json([]);
  try {
    const snap = await db().collection('users').get();
    const users = snap.docs.map((d) => {
      const { username, name, email, cfusername, cfImageUrl, role, cfRating, cfMaxRating, cfRank } = d.data();
      return { uid: d.id, username, name, email, cfusername, cfImageUrl, role, cfRating, cfMaxRating, cfRank };
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get a single profile.
router.get('/:uid', async (req, res) => {
  if (!isReady()) return res.status(503).json({ message: 'Firebase not configured.' });
  try {
    const snap = await db().collection('users').doc(req.params.uid).get();
    if (!snap.exists) return res.status(404).json({ message: 'User not found' });
    res.json({ uid: snap.id, ...snap.data() });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update own profile (or any if admin).
router.put('/:uid', verifyAuth, async (req, res) => {
  if (req.user.uid !== req.params.uid && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Can't edit another user's profile." });
  }
  try {
    const allowed = ['name', 'cfusername', 'ccusername', 'lcusername', 'acusername'];
    if (req.user.role === 'admin') allowed.push('role');
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    await db().collection('users').doc(req.params.uid).set(patch, { merge: true });
    const snap = await db().collection('users').doc(req.params.uid).get();
    res.json({ uid: snap.id, ...snap.data() });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin-only: bulk set per-user extras (e.g. bonus points used by leaderboard DSL).
router.put('/:uid/extras', verifyAuth, requireAdmin, async (req, res) => {
  try {
    await db().collection('userExtras').doc(req.params.uid).set(req.body || {}, { merge: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
