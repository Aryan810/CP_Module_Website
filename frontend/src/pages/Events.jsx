import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../services/api';
import './Events.css';

const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | upcoming | past

  useEffect(() => {
    Promise.all([Api.loadStaticEvents(), Api.listEvents()])
      .then(([s, d]) => {
        const map = new Map();
        for (const e of s) map.set(e.slug, { ...e, source: 'file' });
        for (const e of d) map.set(e.slug, { ...e, source: 'live' });
        setEvents([...map.values()].sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filtered = useMemo(() => {
    if (filter === 'upcoming') return events.filter((e) => new Date(e.date) >= now);
    if (filter === 'past') return events.filter((e) => new Date(e.date) < now);
    return events;
  }, [events, filter]);

  if (loading) return <main className="page-content-area"><p className="text-dim">Loading events…</p></main>;

  return (
    <main className="page-content-area">
      <div className="events-page-header">
        <div>
          <h1>Events</h1>
          <p className="events-page-sub">Workshops, contests and meetups from the Coding Club</p>
        </div>
      </div>

      <div className="events-filter-tabs">
        {['all', 'upcoming', 'past'].map((f) => (
          <button
            key={f}
            className={`event-filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No events to show.</div>
      ) : (
        <div className="events-grid">
          {filtered.map((e) => {
            const upcoming = new Date(e.date) >= now;
            return (
              <Link key={e.slug} to={`/events/${e.slug}`} className="event-card">
                <div className="event-card-banner" style={e.banner ? { backgroundImage: `url(${e.banner})` } : null} />
                <div className="event-card-body">
                  <div className="event-card-meta">
                    <span className="event-card-date">{fmtDate(e.date)}</span>
                    <span className={`chip ${upcoming ? 'chip-soon' : 'chip-past'}`}>{upcoming ? 'Upcoming' : 'Past'}</span>
                  </div>
                  <div className="event-card-title">{e.title}</div>
                  {e.shortDescription && <div className="event-card-desc">{e.shortDescription}</div>}
                  {e.tags?.length > 0 && (
                    <div className="event-card-tags">
                      {e.tags.slice(0, 4).map((t) => <span key={t} className="chip chip-tag">{t}</span>)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
