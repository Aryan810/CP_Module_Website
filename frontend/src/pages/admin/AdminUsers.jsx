import React, { useEffect, useState } from 'react';
import Api from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, Shield, User as UserIcon, RefreshCw } from 'lucide-react';

const ROLES = ['member', 'admin'];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyUid, setBusyUid] = useState(null);
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    Api.listUsers().then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setRole = async (u, role) => {
    if (u.role === role) return;
    if (u.uid === me?.uid && role !== 'admin') {
      if (!window.confirm("You're about to remove your own admin access. Continue?")) return;
    }
    setBusyUid(u.uid); setMsg('');
    try {
      await Api.updateUser(u.uid, { role });
      setUsers((prev) => prev.map((x) => x.uid === u.uid ? { ...x, role } : x));
      setMsg(`Updated ${u.username || u.email} → ${role}`);
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusyUid(null);
    }
  };

  const refreshAllCf = async () => {
    setMsg('Refreshing CF data for all users… this may take a while.');
    try {
      await Api.refreshCfAll();
      load();
      setMsg('CF data refreshed for all users.');
    } catch (e) { setMsg(`Error: ${e.message}`); }
  };

  const filtered = users.filter((u) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (u.username || '').toLowerCase().includes(q)
        || (u.name || '').toLowerCase().includes(q)
        || (u.email || '').toLowerCase().includes(q)
        || (u.cfusername || '').toLowerCase().includes(q);
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <main className="page-content-area">
      <div className="section-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Users</h1>
          <div className="section-subtitle">{users.length} registered · {adminCount} admin{adminCount === 1 ? '' : 's'}</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={refreshAllCf}>
          <RefreshCw size={14} /> Refresh CF data
        </button>
      </div>

      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <Search size={16} style={{ color: 'var(--text-dim)' }} />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name, username, email or CF handle…"
          style={{ flex: 1, border: 0, background: 'transparent', padding: '0.25rem 0' }}
        />
      </div>

      {msg && <div className="card" style={{ padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{msg}</div>}

      {loading ? (
        <p className="text-dim">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No users match your search.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Codeforces</th>
                <th>Rating</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {u.cfImageUrl
                        ? <img src={u.cfImageUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontWeight: 700, color: 'var(--accent-strong)' }}>
                            {(u.name || u.username || '?').charAt(0).toUpperCase()}
                          </div>}
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name || u.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                  <td className="mono">{u.cfusername || '—'}</td>
                  <td className="mono">{u.cfRating ?? '—'}</td>
                  <td>
                    <span className={`chip ${u.role === 'admin' ? 'chip-live' : 'chip-tag'}`}>
                      {u.role === 'admin' ? <Shield size={11} /> : <UserIcon size={11} />}
                      {u.role || 'member'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <select
                      value={u.role || 'member'}
                      disabled={busyUid === u.uid}
                      onChange={(e) => setRole(u, e.target.value)}
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
