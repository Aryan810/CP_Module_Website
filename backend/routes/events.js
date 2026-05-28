// Events CRUD. Public reads, admin writes. Live events live in Firestore;
// repo-committed events live under frontend/public/data/events/ and are
// merged client-side.
const express = require('express');
const { db, isReady } = require('../firebase');
const { verifyAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  if (!isReady()) return res.json([]);
  try {
    const snap = await db().collection('events').get();
    res.json(snap.docs.map((d) => ({ slug: d.id, ...d.data() })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:slug', async (req, res) => {
  if (!isReady()) return res.status(404).json({ message: 'not found' });
  try {
    const snap = await db().collection('events').doc(req.params.slug).get();
    if (!snap.exists) return res.status(404).json({ message: 'Event not found' });
    res.json({ slug: snap.id, ...snap.data() });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:slug', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    delete data.slug;
    await db().collection('events').doc(req.params.slug).set(data, { merge: true });
    res.json({ slug: req.params.slug, ...data });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:slug', verifyAuth, requireAdmin, async (req, res) => {
  try {
    await db().collection('events').doc(req.params.slug).delete();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
