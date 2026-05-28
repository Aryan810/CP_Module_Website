import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [cf, setCf] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', cfusername: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', cfusername: user.cfusername || '' });
  }, [user]);

  useEffect(() => {
    if (!user?.cfusername) return;
    Api.cfFull(user.cfusername).then((r) => setCf(r.cf)).catch(() => setCf(null));
  }, [user?.cfusername]);

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

  const avatar = cf?.profile?.avatar || user.cfImageUrl || `https://via.placeholder.com/120/4f46e5/ffffff?text=${(user.name || user.username || '?').charAt(0)}`;

  return (
    <main className="page-content-area profile-page">
      <div className="profile-card">
        <img src={avatar} alt="" className="profile-avatar" />
        <div className="profile-body">
          {!edit ? (
            <>
              <h1>{user.name || user.username}</h1>
              <p className="profile-meta">@{user.username} · {user.email} · <span className="role-pill">{user.role}</span></p>
              <p>Codeforces: <strong>{user.cfusername || '—'}</strong></p>
              {cf?.profile && (
                <div className="cf-stats">
                  <span>Rating: <strong>{cf.profile.rating}</strong></span>
                  <span>Max: <strong>{cf.profile.maxRating}</strong></span>
                  <span>Rank: <strong>{cf.profile.rank}</strong></span>
                </div>
              )}
              <div className="profile-actions">
                <button onClick={() => setEdit(true)}>Edit</button>
                <button onClick={refreshCf} disabled={busy}>{busy ? 'Refreshing…' : 'Refresh CF data'}</button>
              </div>
            </>
          ) : (
            <>
              <label>Name <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Codeforces handle <input value={form.cfusername} onChange={(e) => setForm({ ...form, cfusername: e.target.value })} /></label>
              <div className="profile-actions">
                <button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </>
          )}
          {msg && <p className="profile-msg">{msg}</p>}
        </div>
      </div>

      {cf?.contests?.contestHistory?.length > 0 && (
        <section className="profile-section">
          <h2>Recent contests</h2>
          <ul className="contest-history">
            {cf.contests.contestHistory.slice(-8).reverse().map((c) => (
              <li key={c.contestId}>
                <span>{c.contestName}</span>
                <span>#{c.rank}</span>
                <span>{c.oldRating} → {c.newRating} <strong style={{ color: c.newRating >= c.oldRating ? '#22c55e' : '#ef4444' }}>({c.newRating - c.oldRating >= 0 ? '+' : ''}{c.newRating - c.oldRating})</strong></span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};

export default Profile;
