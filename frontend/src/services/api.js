// Centralised API helpers. Falls back gracefully when backend is offline by
// reading static data from /data/*.json (committed in frontend/public/data).
import { auth } from '../firebase';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'development' ? 'http://localhost:3001/api' : '/api');

async function authHeaders() {
  const u = auth?.currentUser;
  if (!u) return {};
  return { Authorization: `Bearer ${await u.getIdToken()}` };
}

async function req(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.auth ? await authHeaders() : {}), ...(opts.headers || {}) };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
  return data;
}

async function loadJson(publicPath) {
  const r = await fetch(publicPath);
  if (!r.ok) throw new Error(`Failed to load ${publicPath}`);
  return r.json();
}

const Api = {
  // -- static (data/) ---------------------------------------------------
  loadSite: () => loadJson('/data/site.json'),
  loadHome: () => loadJson('/data/home.json'),

  async loadStaticEvents() {
    try {
      const idx = await loadJson('/data/events/index.json');
      const files = idx.events || [];
      return Promise.all(files.map((f) => loadJson(`/data/events/${f}`).catch(() => null))).then((r) => r.filter(Boolean));
    } catch { return []; }
  },

  async loadStaticLeaderboards() {
    try {
      const idx = await loadJson('/data/leaderboards/index.json');
      const files = idx.leaderboards || [];
      return Promise.all(files.map((f) => loadJson(`/data/leaderboards/${f}`).catch(() => null))).then((r) => r.filter(Boolean));
    } catch { return []; }
  },

  // -- dynamic (Firestore via backend) ---------------------------------
  listUsers:        () => req('/users').catch(() => []),
  getUser:          (uid) => req(`/users/${uid}`),
  updateUser:       (uid, body) => req(`/users/${uid}`, { method: 'PUT', body: JSON.stringify(body), auth: true }),

  listEvents:       () => req('/events').catch(() => []),
  saveEvent:        (slug, body) => req(`/events/${slug}`, { method: 'PUT', body: JSON.stringify(body), auth: true }),
  deleteEvent:      (slug) => req(`/events/${slug}`, { method: 'DELETE', auth: true }),

  listLeaderboards: () => req('/leaderboards').catch(() => []),
  saveLeaderboard:  (id, body) => req(`/leaderboards/${id}`, { method: 'PUT', body: JSON.stringify(body), auth: true }),
  deleteLeaderboard:(id) => req(`/leaderboards/${id}`, { method: 'DELETE', auth: true }),

  refreshCfMe:      () => req('/cf-update/me', { method: 'PUT', auth: true }),
  refreshCfAll:     () => req('/cf-update/all', { method: 'PUT', auth: true }),

  cfProfile:        (handle) => req(`/cf/profile/${encodeURIComponent(handle)}`),
  cfFull:           (handle) => req(`/cf/full/${encodeURIComponent(handle)}`),

  // -- Codeforces contests (used by Contests + Leaderboard pages) ------
  async fetchContests() {
    try { return await req('/users/contests'); } catch { return []; }
  },
};

export default Api;
