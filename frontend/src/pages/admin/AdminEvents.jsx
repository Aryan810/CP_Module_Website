import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Api from '../../services/api';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([Api.loadStaticEvents(), Api.listEvents()])
      .then(([s, d]) => {
        const map = new Map();
        for (const e of s) map.set(e.slug, { ...e, source: 'file' });
        for (const e of d) map.set(e.slug, { ...e, source: 'live' });
        setEvents([...map.values()].sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const del = async (slug) => {
    if (!window.confirm(`Delete event "${slug}"? (file-based events can't be deleted from here)`)) return;
    try { await Api.deleteEvent(slug); load(); } catch (e) { alert(e.message); }
  };

  return (
    <main className="page-content-area">
      <div className="section-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Events</h1>
          <div className="section-subtitle">{events.length} total</div>
        </div>
        <Link to="/admin/events/new" className="btn btn-primary btn-sm">
          <Plus size={14} /> New event
        </Link>
      </div>

      {loading ? (
        <p className="text-dim">Loading…</p>
      ) : events.length === 0 ? (
        <div className="empty-state">
          No events yet.<br />
          <Link to="/admin/events/new" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            <Plus size={14} /> Create your first event
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>Date</th><th>Source</th><th></th></tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.slug}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }} className="mono">{e.slug}</div>
                  </td>
                  <td className="mono">{new Date(e.date).toLocaleString()}</td>
                  <td><span className={`chip ${e.source === 'live' ? 'chip-live' : 'chip-tag'}`}>{e.source}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/admin/events/${e.slug}`} className="btn btn-ghost btn-sm">
                      <Edit2 size={12} /> Edit
                    </Link>
                    {e.source === 'live' && (
                      <button onClick={() => del(e.slug)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
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
