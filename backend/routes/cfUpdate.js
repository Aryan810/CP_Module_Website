// Refresh stored Codeforces data for a single user (uid) or all users (admin).
const express = require('express');
const { db, isReady } = require('../firebase');
const { verifyAuth, requireAdmin } = require('../middleware/auth');
const { fetchCodeforcesUserProfile } = require('../services/codeforcesService');

const router = express.Router();

async function refreshOne(uid) {
  const ref = db().collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) return { uid, ok: false, error: 'user-not-found' };
  const u = snap.data();
  if (!u.cfusername) return { uid, ok: false, error: 'no-cf-handle' };
  const cf = await fetchCodeforcesUserProfile(u.cfusername);
  if (!cf) return { uid, ok: false, error: 'cf-fetch-failed' };
  await ref.set(
    {
      cfImageUrl: cf.avatar || u.cfImageUrl || '',
      cfRating: cf.rating || 0,
      cfMaxRating: cf.maxRating || 0,
      cfRank: cf.rank || 'unrated',
      cfMaxRank: cf.maxRank || 'unrated',
      cfRefreshedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return { uid, ok: true };
}

router.put('/me', verifyAuth, async (req, res) => {
  if (!isReady()) return res.status(503).json({ message: 'Firebase not configured.' });
  try {
    res.json(await refreshOne(req.user.uid));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/all', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db().collection('users').get();
    const results = [];
    for (const d of snap.docs) {
      // eslint-disable-next-line no-await-in-loop
      results.push(await refreshOne(d.id));
    }
    res.json({ count: results.length, results });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
