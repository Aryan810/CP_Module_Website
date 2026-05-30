import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Api from '../../services/api';

export default function AdminLeaderboards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([Api.loadStaticLeaderboards(), Api.listLeaderboards()])
      .then(([s, d]) => {
        const map = new Map();
        for (const b of s) map.set(b.id, { ...b, source: 'file' });
        for (const b of d) map.set(b.id, { ...b, source: 'live' });
        setBoards([...map.values()]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm(`Delete leaderboard "${id}"?`)) return;
    try { await Api.deleteLeaderboard(id); load(); } catch (e) { alert(e.message); }
  };

  return (
    <main className="page-content-area">
      <div className="section-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Leaderboards</h1>
          <div className="section-subtitle">{boards.length} configured</div>
        </div>
        <Link to="/admin/leaderboards/new" className="btn btn-primary btn-sm">
          <Plus size={14} /> New leaderboard
        </Link>
      </div>

      {loading ? (
        <p className="text-dim">Loading…</p>
      ) : boards.length === 0 ? (
        <div className="empty-state">
          No leaderboards yet.<br />
          <Link to="/admin/leaderboards/new" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            <Plus size={14} /> Create your first leaderboard
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Source</th>
                <th>Participants</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {boards.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link to={`/admin/leaderboards/${b.id}`} style={{ fontWeight: 600 }}>{b.name}</Link>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }} className="mono">{b.id}</div>
                  </td>
                  <td>
                    <span className={`chip ${b.source === 'live' ? 'chip-live' : 'chip-tag'}`}>{b.source}</span>
                  </td>
                  <td className="mono">{b.users?.length || 'all'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/admin/leaderboards/${b.id}`} className="btn btn-ghost btn-sm">
                      <Edit2 size={12} /> Edit
                    </Link>
                    {b.source === 'live' && (
                      <button onClick={() => del(b.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
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
