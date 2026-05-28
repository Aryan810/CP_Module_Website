import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <main className="page-content-area" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin · Events</h1>
        <Link to="/admin/events/new" className="btn-cta-primary">+ New event</Link>
      </div>
      {loading ? <p>Loading…</p> : (
        <table style={{ width: '100%', marginTop: '1rem' }}>
          <thead><tr><th align="left">Title</th><th align="left">Date</th><th>Source</th><th></th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.slug}>
                <td>{e.title}</td>
                <td>{new Date(e.date).toLocaleString()}</td>
                <td style={{ textAlign: 'center', opacity: 0.7 }}>{e.source}</td>
                <td style={{ textAlign: 'right' }}>
                  <Link to={`/admin/events/${e.slug}`}>Edit</Link>
                  {e.source === 'live' && <>{' · '}<button onClick={() => del(e.slug)} style={{ color: '#ef4444', background: 'none', border: 0, cursor: 'pointer' }}>Delete</button></>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
