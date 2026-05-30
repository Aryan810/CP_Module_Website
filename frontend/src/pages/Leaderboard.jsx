import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../services/api';
import { safeEval } from '../leaderboardDsl';
import { useAuth } from '../context/AuthContext.jsx';
import './Leaderboard.css';

// Each row passed to the DSL contains: name, username, email, cfusername,
// cf_rating, cf_max_rating, cf_rank, cf_problems_solved, cf_contests, extras.
function toRow(u, extras = {}) {
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
    cf_image: u.cfImageUrl || '',
    extras: extras[u.uid] || {},
  };
}

function evalCell(expr, row) {
  const r = safeEval(expr, row);
  return r.ok ? r.value : { __err: r.error };
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);     // all leaderboard configs
  const [users, setUsers] = useState([]);       // all CP-Hub users
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      Api.loadStaticLeaderboards(),
      Api.listLeaderboards(),
      Api.listUsers(),
    ]).then(([statB, dynB, us]) => {
      const map = new Map();
      for (const b of statB) map.set(b.id, { ...b, source: 'file' });
      for (const b of dynB) map.set(b.id, { ...b, source: 'live' });
      const merged = [...map.values()];
      setBoards(merged);
      setUsers(us);
      if (merged.length) setSelected(merged[0]);
      setLoading(false);
    });
  }, []);

  const rows = useMemo(() => {
    if (!selected) return [];
    const userPool = selected.source === 'file' || !selected.users || selected.users.length === 0
      ? users
      : users.filter((u) => selected.users.includes(u.uid));
    let mapped = userPool.map((u) => toRow(u, {}));
    if (selected.filter) {
      mapped = mapped.filter((r) => {
        const v = safeEval(selected.filter, r);
        return v.ok ? Boolean(v.value) : false;
      });
    }
    if (selected.sort?.expr) {
      mapped.sort((a, b) => {
        const va = safeEval(selected.sort.expr, a).value;
        const vb = safeEval(selected.sort.expr, b).value;
        if (va === vb) return 0;
        if (va === undefined || va === null) return 1;
        if (vb === undefined || vb === null) return -1;
        const cmp = va < vb ? -1 : 1;
        return selected.sort.direction === 'asc' ? cmp : -cmp;
      });
    }
    return mapped;
  }, [selected, users]);

  if (loading) return <main className="page-content-area"><p>Loading leaderboards…</p></main>;

  if (boards.length === 0) {
    return (
      <main className="page-content-area">
        <h1>Leaderboards</h1>
        <p>No leaderboards yet. {user?.role === 'admin' && <Link to="/admin/leaderboards">Create one →</Link>}</p>
      </main>
    );
  }

  return (
    <main className="page-content-area leaderboard-container">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">Leaderboards</h1>
        {user?.role === 'admin' && <Link to="/admin/leaderboards" className="lb-admin-link">Manage →</Link>}
      </div>

      <div className="lb-tabs">
        {boards.map((b) => (
          <button key={b.id} className={`lb-tab ${selected?.id === b.id ? 'active' : ''}`} onClick={() => setSelected(b)}>
            {b.name}
          </button>
        ))}
      </div>

      {selected && (
        <>
          {selected.description && <p className="lb-desc">{selected.description}</p>}
          <div className="table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  {selected.columns.map((c, i) => <th key={i}>{c.header}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={selected.columns.length + 1} className="no-results">No users match this leaderboard.</td></tr>
                ) : rows.map((row, i) => (
                  <tr key={row.uid || i}>
                    <td className="rank-cell">{i + 1}</td>
                    {selected.columns.map((c, ci) => {
                      const v = evalCell(c.expr, row);
                      if (v && v.__err) return <td key={ci} title={v.__err} style={{ color: '#ef4444' }}>#ERR</td>;
                      return <td key={ci}>{v == null ? '' : String(v)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
