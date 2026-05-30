import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Api from '../../services/api';
import { safeEval, DSL_BUILTINS } from '../../leaderboardDsl';

const empty = {
  id: '', name: '', description: '',
  users: [],
  columns: [
    { header: 'Name', expr: 'name' },
    { header: 'CF Rating', expr: 'default(cf_rating, 0)' },
  ],
  sort: { expr: 'default(cf_rating, 0)', direction: 'desc' },
  filter: '',
};

const sampleRow = {
  uid: 'preview', name: 'Sample User', username: 'sample', email: 's@x.com',
  cfusername: 'tourist', cf_rating: 3800, cf_max_rating: 3979, cf_rank: 'legendary grandmaster',
  cf_max_rank: 'legendary grandmaster', extras: { bonus: 10 },
};

export default function AdminLeaderboardEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState(empty);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { Api.listUsers().then(setUsers).catch(() => setUsers([])); }, []);

  useEffect(() => {
    if (isNew) return;
    Api.listLeaderboards().then((all) => {
      const b = all.find((x) => x.id === id);
      if (b) setForm({ ...empty, ...b });
      else Api.loadStaticLeaderboards().then((s) => {
        const f = s.find((x) => x.id === id);
        if (f) setForm({ ...empty, ...f });
      });
    });
  }, [id, isNew]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setCol = (i, k, v) => setForm((p) => ({ ...p, columns: p.columns.map((c, idx) => idx === i ? { ...c, [k]: v } : c) }));
  const addCol = () => set('columns', [...form.columns, { header: 'New', expr: 'name' }]);
  const delCol = (i) => set('columns', form.columns.filter((_, idx) => idx !== i));

  const toggleUser = (uid) => set('users', form.users.includes(uid) ? form.users.filter((u) => u !== uid) : [...form.users, uid]);

  const previewRow = useMemo(() => {
    const pool = form.users?.length ? users.filter((u) => form.users.includes(u.uid)) : users;
    if (!pool.length) return sampleRow;
    const u = pool[0];
    return {
      uid: u.uid, name: u.name || u.username, username: u.username, email: u.email,
      cfusername: u.cfusername, cf_rating: u.cfRating ?? 0, cf_max_rating: u.cfMaxRating ?? 0,
      cf_rank: u.cfRank || 'unrated', extras: {},
    };
  }, [form.users, users]);

  const save = async () => {
    if (!form.id.trim()) return setMsg('id is required.');
    if (!form.name.trim()) return setMsg('name is required.');
    setBusy(true); setMsg('');
    try {
      await Api.saveLeaderboard(form.id, form);
      setMsg('Saved.');
      nav('/admin/leaderboards');
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  return (
    <main className="page-content-area" style={{ maxWidth: 1100 }}>
      <div className="eyebrow">Admin · Leaderboards</div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{isNew ? 'New leaderboard' : `Edit · ${id}`}</h1>
      <p className="text-dim" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Configure participants, columns, sort and filter using the CPHub-DSL.
      </p>

      <div className="grid">
        <label>ID (URL slug)<input value={form.id} onChange={(e) => set('id', e.target.value)} disabled={!isNew} /></label>
        <label>Name<input value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label>Description<input value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
      </div>

      <h2>Participants</h2>
      <p style={{ opacity: 0.7 }}>Leave empty to include <strong>all</strong> registered users.</p>
      <div className="user-picker">
        {users.map((u) => (
          <label key={u.uid} className="user-chip">
            <input type="checkbox" checked={form.users.includes(u.uid)} onChange={() => toggleUser(u.uid)} />
            <span>{u.name || u.username}</span><small>@{u.username}</small>
          </label>
        ))}
        {users.length === 0 && <p>No registered users yet.</p>}
      </div>

      <h2>Columns</h2>
      <p style={{ opacity: 0.7, fontSize: '0.9em' }}>
        Each cell is a CPHub-DSL expression. Available fields: <code>name, username, email, cfusername, cf_rating, cf_max_rating, cf_rank, extras.&lt;key&gt;</code>.
        Built-ins: <code>{DSL_BUILTINS.join(', ')}</code>.
      </p>
      <table className="cols-table">
        <thead><tr><th>Header</th><th>Expression</th><th>Preview</th><th></th></tr></thead>
        <tbody>
          {form.columns.map((c, i) => {
            const preview = safeEval(c.expr, previewRow);
            return (
              <tr key={i}>
                <td><input value={c.header} onChange={(e) => setCol(i, 'header', e.target.value)} /></td>
                <td><input value={c.expr} onChange={(e) => setCol(i, 'expr', e.target.value)} style={{ fontFamily: 'monospace' }} /></td>
                <td style={{ color: preview.ok ? 'inherit' : '#ef4444' }} title={preview.ok ? '' : preview.error}>
                  {preview.ok ? String(preview.value ?? '') : '#ERR'}
                </td>
                <td><button onClick={() => delCol(i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>×</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button onClick={addCol} className="btn btn-outline btn-sm" style={{ marginTop: '0.6rem' }}>+ Add column</button>

      <h2>Sort</h2>
      <div className="grid two">
        <label>Sort by expression<input value={form.sort?.expr || ''} onChange={(e) => set('sort', { ...form.sort, expr: e.target.value })} style={{ fontFamily: 'monospace' }} /></label>
        <label>Direction
          <select value={form.sort?.direction || 'desc'} onChange={(e) => set('sort', { ...form.sort, direction: e.target.value })}>
            <option value="desc">Descending</option><option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      <h2>Filter (optional)</h2>
      <label>Include user if expression is truthy<input value={form.filter || ''} onChange={(e) => set('filter', e.target.value)} style={{ fontFamily: 'monospace' }} placeholder="e.g. cf_rating > 1200" /></label>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save leaderboard'}</button>
        <button className="btn btn-ghost" onClick={() => nav(-1)}>Cancel</button>
      </div>
      {msg && <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{msg}</p>}

      <style>{`
        h2{margin-top:1.75rem; font-size: 1rem; color: var(--text); letter-spacing: 0.02em;}
        h2::before { content: ''; display: inline-block; width: 3px; height: 14px; background: var(--accent); margin-right: 8px; vertical-align: -2px; border-radius: 2px; }
        label{display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.6rem;font-size:0.85rem;color:var(--text-muted);}
        .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;}
        .grid.two{grid-template-columns:1fr 200px;}
        .user-picker{display:flex;flex-wrap:wrap;gap:0.4rem;max-height:200px;overflow:auto;padding:0.6rem;border:1px solid var(--border);border-radius:var(--r);background:var(--surface-1);}
        .user-chip{display:flex;align-items:center;gap:0.35rem;padding:0.3rem 0.6rem;background:var(--surface-2);border:1px solid var(--border);border-radius:999px;cursor:pointer;font-size:0.8rem;}
        .user-chip small{opacity:0.6;}
        .cols-table{width:100%;border-collapse:collapse;}
        .cols-table th,.cols-table td{padding:0.5rem;border-bottom:1px solid var(--border);text-align:left;font-size:0.85rem;}
        .cols-table td:nth-child(1){width:20%}.cols-table td:nth-child(2){width:45%}.cols-table td:nth-child(3){width:25%}
      `}</style>
    </main>
  );
}
