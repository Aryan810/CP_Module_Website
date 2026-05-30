// Leaderboard CRUD. Public reads, admin writes.
const express = require('express');
const { db, isReady } = require('../firebase');
const { verifyAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  if (!isReady()) return res.json([]);
  try {
    const snap = await db().collection('leaderboards').get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', async (req, res) => {
  if (!isReady()) return res.status(404).json({ message: 'not found' });
  try {
    const snap = await db().collection('leaderboards').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ message: 'Leaderboard not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    delete data.id;
    await db().collection('leaderboards').doc(req.params.id).set(data, { merge: true });
    res.json({ id: req.params.id, ...data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    await db().collection('leaderboards').doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
