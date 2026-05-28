import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <main className="page-content-area" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin · Leaderboards</h1>
        <Link to="/admin/leaderboards/new" className="btn-cta-primary">+ New leaderboard</Link>
      </div>
      {loading ? <p>Loading…</p> : (
        <table style={{ width: '100%', marginTop: '1rem' }}>
          <thead><tr><th align="left">Name</th><th>Source</th><th>Users</th><th></th></tr></thead>
          <tbody>
            {boards.map((b) => (
              <tr key={b.id}>
                <td><Link to={`/admin/leaderboards/${b.id}`}>{b.name}</Link><br/><small style={{opacity:0.6}}>{b.id}</small></td>
                <td align="center" style={{opacity:0.7}}>{b.source}</td>
                <td align="center">{b.users?.length || 'all'}</td>
                <td align="right">
                  <Link to={`/admin/leaderboards/${b.id}`}>Edit</Link>
                  {b.source === 'live' && <>{' · '}<button onClick={() => del(b.id)} style={{color:'#ef4444',background:'none',border:0,cursor:'pointer'}}>Delete</button></>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
