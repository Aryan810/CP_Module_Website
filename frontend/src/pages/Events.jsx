import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../services/api';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <main className="page-content-area"><p>Loading events…</p></main>;

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  const card = (e) => (
    <Link key={e.slug} to={`/events/${e.slug}`} className="event-card">
      {e.banner && <img src={e.banner} alt="" className="event-banner" />}
      <div className="event-card-body">
        <h3>{e.title}</h3>
        <p className="event-meta">{new Date(e.date).toLocaleString()} · {e.location || 'TBA'}</p>
        {e.shortDescription && <p>{e.shortDescription}</p>}
        {e.tags?.length > 0 && <div className="event-tags">{e.tags.map((t) => <span key={t} className="event-tag">#{t}</span>)}</div>}
      </div>
    </Link>
  );

  return (
    <main className="page-content-area events-page">
      <h1>Events</h1>
      {upcoming.length > 0 && (<>
        <h2>Upcoming</h2>
        <div className="event-grid">{upcoming.map(card)}</div>
      </>)}
      {past.length > 0 && (<>
        <h2 style={{ marginTop: '2rem' }}>Past</h2>
        <div className="event-grid">{past.map(card)}</div>
      </>)}
      {events.length === 0 && <p>No events yet.</p>}
    </main>
  );
}
