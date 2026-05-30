const { auth, db, isReady } = require('../firebase');

// Verifies Firebase ID token in Authorization: Bearer <token>.
// On success, attaches req.user = { uid, role, ...profile }.
async function verifyAuth(req, res, next) {
  if (!isReady()) {
    return res.status(503).json({ message: 'Backend Firebase Admin is not configured. See FIREBASE_SETUP.md.' });
  }
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ message: 'Missing Authorization: Bearer <id-token> header.' });
  }
  try {
    const decoded = await auth().verifyIdToken(match[1]);
    const snap = await db().collection('users').doc(decoded.uid).get();
    const profile = snap.exists ? snap.data() : {};
    req.user = { uid: decoded.uid, email: decoded.email, role: profile.role || 'user', ...profile };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token.', error: e.message });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only.' });
  next();
}

module.exports = { verifyAuth, requireAdmin };
