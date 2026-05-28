import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Api from '../services/api';
import './Events.css';

export default function EventDetail() {
  const { slug } = useParams();
  const [evt, setEvt] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Try dynamic first, then static.
        const dyn = await Api.listEvents().then((all) => all.find((e) => e.slug === slug));
        if (dyn) return setEvt(dyn);
        const stat = await Api.loadStaticEvents().then((all) => all.find((e) => e.slug === slug));
        if (stat) return setEvt(stat);
        setErr('Event not found.');
      } catch (e) { setErr(e.message); }
    })();
  }, [slug]);

  if (err) return <main className="page-content-area"><p>{err}</p><Link to="/events">← All events</Link></main>;
  if (!evt) return <main className="page-content-area"><p>Loading…</p></main>;

  return (
    <main className="page-content-area event-detail">
      <Link to="/events" className="event-back">← All events</Link>
      <h1>{evt.title}</h1>
      <p className="event-meta">{new Date(evt.date).toLocaleString()} · {evt.location || 'TBA'}</p>
      {evt.banner && <img src={evt.banner} alt="" className="event-detail-banner" />}
      {evt.tags?.length > 0 && <div className="event-tags">{evt.tags.map((t) => <span key={t} className="event-tag">#{t}</span>)}</div>}
      <div className="event-body">
        <ReactMarkdown>{evt.body || ''}</ReactMarkdown>
      </div>
      {evt.images?.length > 0 && (
        <div className="event-gallery">
          {evt.images.map((u, i) => <img key={i} src={u} alt="" />)}
        </div>
      )}
      {evt.links?.length > 0 && (
        <div className="event-links">
          <h3>Links</h3>
          <ul>{evt.links.map((l, i) => <li key={i}><a href={l.url} target="_blank" rel="noreferrer">{l.label}</a></li>)}</ul>
        </div>
      )}
    </main>
  );
}
