import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AtSign, Award, RefreshCw, Edit2, TrendingUp, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Api from '../services/api';
import { safeEval } from '../leaderboardDsl';
import './Profile.css';

function rankSlug(rank) {
  if (!rank) return 'newbie';
  return rank.toLowerCase().split(' ').pop();
}

function toLbRow(u) {
  return {
    uid: u.uid,
    name: u.name || u.username || '',
    username: u.username || '',
    email: u.email || '',
    cfusername: u.cfusername || '',
    cf_rating: u.cfRating ?? 0,
    cf_max_rating: u.cfMaxRating ?? 0,
    cf_rank: u.cfRank || 'unrated',
    cf_max_rank: u.cfMaxRank || 'unrated',
    extras: {},
  };
}

function RatingSparkline({ history }) {
  if (!history || history.length < 2) {
    return <div className="text-dim" style={{ padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>Not enough contest history to plot.</div>;
  }
  const W = 600, H = 160, PAD = 24;
  const ratings = history.map((c) => c.newRating);
  const minR = Math.min(...ratings) - 50;
  const maxR = Math.max(...ratings) + 50;
  const range = Math.max(1, maxR - minR);
  const stepX = (W - PAD * 2) / Math.max(1, history.length - 1);

  const pts = history.map((c, i) => {
    const x = PAD + i * stepX;
    const y = PAD + (1 - (c.newRating - minR) / range) * (H - PAD * 2);
    return [x, y, c];
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length-1][0].toFixed(1)},${H-PAD} L${pts[0][0].toFixed(1)},${H-PAD} Z`;

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    y: PAD + p * (H - PAD * 2),
    label: Math.round(maxR - p * range),
  }));

  return (
    <div className="rating-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="180">
        <defs>
          <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1={PAD} y1={g.y} x2={W - PAD} y2={g.y} stroke="var(--border)" strokeDasharray="2 4" />
            <text x={4} y={g.y + 3} fontSize="9" fill="var(--text-dim)" fontFamily="var(--font-mono)">{g.label}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#ratingGrad)" />
        <path d={linePath} fill="none" stroke="var(--accent-strong)" strokeWidth="1.5" />
        {pts.map(([x, y, c], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent-strong)">
            <title>{c.contestName} · #{c.rank} · {c.oldRating} → {c.newRating}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [cf, setCf] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', cfusername: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // For "rank across leaderboards"
  const [boards, setBoards] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', cfusername: user.cfusername || '' });
  }, [user]);

  useEffect(() => {
    if (!user?.cfusername) return;
    Api.cfFull(user.cfusername).then((r) => setCf(r.cf)).catch(() => setCf(null));
  }, [user?.cfusername]);

  useEffect(() => {
    Promise.all([Api.loadStaticLeaderboards(), Api.listLeaderboards(), Api.listUsers()])
      .then(([s, d, us]) => {
        const map = new Map();
        for (const b of s) map.set(b.id, { ...b, source: 'file' });
        for (const b of d) map.set(b.id, { ...b, source: 'live' });
        setBoards([...map.values()]);
        setAllUsers(us);
      })
      .catch(() => {});
  }, []);

  const lbRanks = useMemo(() => {
    if (!user || !boards.length || !allUsers.length) return [];
    return boards.map((b) => {
      const pool = b.users?.length ? allUsers.filter((u) => b.users.includes(u.uid)) : allUsers;
      let rows = pool.map(toLbRow);
      if (b.filter) {
        rows = rows.filter((r) => {
          const v = safeEval(b.filter, r);
          return v.ok ? Boolean(v.value) : false;
        });
      }
      if (b.sort?.expr) {
        rows.sort((a, x) => {
          const va = safeEval(b.sort.expr, a).value;
          const vb = safeEval(b.sort.expr, x).value;
          if (va === vb) return 0;
          if (va == null) return 1;
          if (vb == null) return -1;
          const cmp = va < vb ? -1 : 1;
          return b.sort.direction === 'asc' ? cmp : -cmp;
        });
      }
      const idx = rows.findIndex((r) => r.uid === user.uid);
      return { id: b.id, name: b.name, rank: idx >= 0 ? idx + 1 : null, total: rows.length };
    });
  }, [boards, allUsers, user]);

  if (!user) return <main className="page-content-area"><h1>Profile</h1><p>Please log in.</p></main>;

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      await Api.updateUser(user.uid, form);
      await refreshProfile();
      setEdit(false);
      setMsg('Saved.');
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  const refreshCf = async () => {
    setBusy(true); setMsg('');
    try {
      await Api.refreshCfMe();
      await refreshProfile();
      const r = await Api.cfFull(user.cfusername);
      setCf(r.cf);
      setMsg('CF data refreshed.');
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  const initial = (user.name || user.username || '?').charAt(0).toUpperCase();
  const avatar = cf?.profile?.avatar || user.cfImageUrl;
  const history = cf?.contests?.contestHistory || [];
  const recent = history.slice(-8).reverse();

  return (
    <main className="page-content-area">
      <div className="profile-header-card">
        {avatar
          ? <img src={avatar} alt="" className="profile-avatar" />
          : <div className="profile-avatar">{initial}</div>}
        <div className="profile-info">
          <div className="profile-name">
            {user.name || user.username}
            {user.role === 'admin' && <span className="profile-role-chip">Admin</span>}
          </div>
          <div className="profile-handle">@{user.username}</div>
          <div className="profile-meta">
            <span><Mail size={13} /> {user.email}</span>
            {user.cfusername && <span><AtSign size={13} /> CF: {user.cfusername}</span>}
            {cf?.profile?.rank && <span className={`rank rank-${rankSlug(cf.profile.rank)}`}>{cf.profile.rank}</span>}
          </div>
        </div>
        <div className="profile-actions">
          {!edit && <button className="btn btn-outline btn-sm" onClick={() => setEdit(true)}><Edit2 size={13} /> Edit Profile</button>}
          <button className="btn btn-primary btn-sm" onClick={refreshCf} disabled={busy}>
            <RefreshCw size={13} /> {busy ? 'Refreshing…' : 'Refresh CF'}
          </button>
        </div>
      </div>

      {cf?.profile && (
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-label">Current Rating</div>
            <div className="profile-stat-value">{cf.profile.rating || '—'}</div>
            <div className="profile-stat-sub">{cf.profile.rank || 'unrated'}</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-label">Max Rating</div>
            <div className="profile-stat-value">{cf.profile.maxRating || '—'}</div>
            <div className="profile-stat-sub">{cf.profile.maxRank || 'unrated'}</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-label">Contests</div>
            <div className="profile-stat-value">{history.length || 0}</div>
            <div className="profile-stat-sub">played</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-label">Friend of</div>
            <div className="profile-stat-value">{cf.profile.friendOfCount ?? '—'}</div>
            <div className="profile-stat-sub">users</div>
          </div>
        </div>
      )}

      {edit && (
        <div className="profile-section">
          <h2>Edit Profile</h2>
          <div className="profile-form-grid">
            <label>Name <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Codeforces handle <input value={form.cfusername} onChange={(e) => setForm({ ...form, cfusername: e.target.value })} /></label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            <button className="btn btn-ghost" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </div>
      )}

      {msg && <div className="auth-success-msg" style={{ marginBottom: '1rem' }}>{msg}</div>}

      <div className="profile-two-col">
        <div className="profile-section">
          <div className="section-header" style={{ marginBottom: '0.75rem' }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>
              <TrendingUp size={15} style={{ verticalAlign: '-2px', marginRight: 6, color: 'var(--accent-strong)' }} />
              Rating Progress
            </div>
            <div className="section-subtitle">across {history.length} contests</div>
          </div>
          <RatingSparkline history={history} />
        </div>

        <div className="profile-section">
          <div className="section-header" style={{ marginBottom: '0.75rem' }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>
              <Trophy size={15} style={{ verticalAlign: '-2px', marginRight: 6, color: 'var(--accent-strong)' }} />
              Leaderboard Ranks
            </div>
            <Link to="/leaderboard" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {lbRanks.length === 0 ? (
            <div className="text-dim" style={{ fontSize: '0.85rem', padding: '1rem 0' }}>No leaderboards yet.</div>
          ) : (
            <ul className="lb-rank-list">
              {lbRanks.map((b) => (
                <li key={b.id} className="lb-rank-row">
                  <span className="lb-rank-name">{b.name}</span>
                  {b.rank ? (
                    <span className="lb-rank-pos">
                      <strong className="mono">#{b.rank}</strong>
                      <span className="text-dim mono"> / {b.total}</span>
                    </span>
                  ) : (
                    <span className="text-dim" style={{ fontSize: '0.78rem' }}>not ranked</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="profile-section">
          <div className="section-header" style={{ marginBottom: '0.75rem' }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>
              <Award size={15} style={{ verticalAlign: '-2px', marginRight: 6, color: 'var(--accent-strong)' }} />
              Recent Contests
            </div>
          </div>
          <div className="table-wrap" style={{ border: 0 }}>
            <table>
              <thead><tr><th>Contest</th><th>Rank</th><th>Rating change</th></tr></thead>
              <tbody>
                {recent.map((c) => {
                  const delta = c.newRating - c.oldRating;
                  return (
                    <tr key={c.contestId}>
                      <td>{c.contestName}</td>
                      <td className="mono">#{c.rank}</td>
                      <td className="mono">
                        {c.oldRating} → {c.newRating}{' '}
                        <strong style={{ color: delta >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          ({delta >= 0 ? '+' : ''}{delta})
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;
