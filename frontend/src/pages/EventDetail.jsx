import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Calendar, MapPin, ArrowLeft, ExternalLink } from 'lucide-react';
import Api from '../services/api';
import './Events.css';

const fmtDateTime = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function EventDetail() {
  const { slug } = useParams();
  const [evt, setEvt] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const dyn = await Api.listEvents().then((all) => all.find((e) => e.slug === slug));
        if (dyn) return setEvt(dyn);
        const stat = await Api.loadStaticEvents().then((all) => all.find((e) => e.slug === slug));
        if (stat) return setEvt(stat);
        setErr('Event not found.');
      } catch (e) { setErr(e.message); }
    })();
  }, [slug]);

  if (err) return (
    <main className="page-content-area"><div className="empty-state">{err}<br /><Link to="/events" className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }}><ArrowLeft size={13} /> All events</Link></div></main>
  );
  if (!evt) return <main className="page-content-area"><p className="text-dim">Loading…</p></main>;

  const upcoming = new Date(evt.date) >= new Date();

  return (
    <main className="page-content-area">
      <div className="event-detail-wrap">
        <Link to="/events" className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}><ArrowLeft size={13} /> All events</Link>

        {evt.banner && <div className="event-detail-banner" style={{ backgroundImage: `url(${evt.banner})` }} />}

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`chip ${upcoming ? 'chip-soon' : 'chip-past'}`}>{upcoming ? 'Upcoming' : 'Past'}</span>
          {evt.tags?.length > 0 && evt.tags.map((t) => <span key={t} className="chip chip-tag">{t}</span>)}
        </div>

        <h1 className="event-detail-title">{evt.title}</h1>

        <div className="event-detail-meta">
          <span><Calendar size={14} /> {fmtDateTime(evt.date)}</span>
          {evt.location && <span><MapPin size={14} /> {evt.location}</span>}
        </div>

        {evt.body && (
          <div className="event-detail-body">
            <ReactMarkdown>{evt.body}</ReactMarkdown>
          </div>
        )}

        {evt.images?.length > 0 && (
          <div className="event-detail-gallery">
            {evt.images.map((u, i) => <img key={i} src={u} alt="" />)}
          </div>
        )}

        {evt.links?.length > 0 && (
          <div className="event-detail-links">
            {evt.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                {l.label} <ExternalLink size={12} />
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
