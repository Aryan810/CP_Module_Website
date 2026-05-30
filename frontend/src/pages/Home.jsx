import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trophy, BarChart3, Github, ArrowRight, CalendarDays } from 'lucide-react';
import Api from '../services/api';
import './Home.css';

const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

const Home = ({ site: siteProp }) => {
  const [site, setSite] = useState(siteProp || null);
  const [home, setHome] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    if (!siteProp) Api.loadSite().then(setSite).catch(() => setSite({ name: 'CP-Hub' }));
    Api.loadHome().then(setHome).catch(() => setHome(null));
    Promise.all([Api.loadStaticEvents(), Api.listEvents()])
      .then(([s, d]) => {
        const map = new Map();
        for (const e of s) map.set(e.slug, e);
        for (const e of d) map.set(e.slug, e);
        setEvents([...map.values()].sort((a, b) => new Date(a.date) - new Date(b.date)));
      })
      .catch(() => setEvents([]));
    Api.listUsers().then(setUsers).catch(() => setUsers([]));
    Promise.all([Api.loadStaticLeaderboards(), Api.listLeaderboards()])
      .then(([s, d]) => {
        const map = new Map();
        for (const b of s) map.set(b.id, b);
        for (const b of d) map.set(b.id, b);
        setBoards([...map.values()]);
      })
      .catch(() => setBoards([]));
  }, [siteProp]);

  const upcoming = useMemo(
    () => events.filter((e) => new Date(e.date) >= new Date()).slice(0, home?.upcomingEventsCount || 3),
    [events, home]
  );
  const nextEvent = upcoming[0];
  const topUsers = useMemo(
    () => [...users].sort((a, b) => (b.cfRating || 0) - (a.cfRating || 0)).slice(0, 5),
    [users]
  );
  const rankColor = (r) => {
    const x = (r || 0);
    if (x >= 2400) return 'rank-gm';
    if (x >= 2100) return 'rank-master';
    if (x >= 1900) return 'rank-cm';
    if (x >= 1600) return 'rank-expert';
    if (x >= 1400) return 'rank-specialist';
    if (x >= 1200) return 'rank-pupil';
    return 'rank-newbie';
  };

  if (!home) return <main className="page-content-area"><p className="text-dim">Loading…</p></main>;

  return (
    <main className="page-content-area">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-bg" aria-hidden />
        <div className="home-hero-content">
          <div className="eyebrow">{site?.name || 'CP-Hub'} · IIT Guwahati Coding Club</div>
          <h1 className="home-hero-title">{home.hero.title}</h1>
          <p className="home-hero-sub">{home.hero.subtitle}</p>
          <div className="home-hero-actions">
            {home.hero.ctaPrimary && <Link to={home.hero.ctaPrimary.to} className="btn btn-primary">{home.hero.ctaPrimary.label} <ArrowRight size={14} /></Link>}
            {home.hero.ctaSecondary && <Link to={home.hero.ctaSecondary.to} className="btn btn-outline">{home.hero.ctaSecondary.label}</Link>}
          </div>
        </div>
        <div className="home-hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-val">{users.length || '—'}</div>
            <div className="hero-stat-lbl">Members</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val">{events.length || '—'}</div>
            <div className="hero-stat-lbl">Events</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val">{boards.length || '—'}</div>
            <div className="hero-stat-lbl">Leaderboards</div>
          </div>
        </div>
      </section>

      {/* Next Event Banner */}
      {nextEvent && (
        <Link to={`/events/${nextEvent.slug}`} className="next-event-banner">
          <div>
            <div className="eyebrow">Next Event</div>
            <div className="ne-title">{nextEvent.title}</div>
          </div>
          <span className="chip chip-soon">Upcoming</span>
          <div className="ne-meta">
            <span><Calendar size={13} /> {fmtDate(nextEvent.date)}</span>
            <span><Clock size={13} /> {fmtTime(nextEvent.date)}</span>
            {nextEvent.location && <span><MapPin size={13} /> {nextEvent.location}</span>}
          </div>
          <span className="ne-arrow"><ArrowRight size={18} /></span>
        </Link>
      )}

      <div className="home-two-col">
        {/* Left column */}
        <div className="home-col-main">
          {home.intro && (
            <section className="card home-intro">
              <div className="eyebrow">About</div>
              <h2 className="home-intro-title">{home.intro.title}</h2>
              <p className="home-intro-body">{home.intro.body}</p>
            </section>
          )}

          <section>
            <div className="section-header">
              <div>
                <div className="section-title">What we do</div>
                <div className="section-subtitle">A quick look at what CP-Hub offers</div>
              </div>
            </div>
            <div className="feature-grid">
              {home.features.map((f, i) => (
                <div className="feature-card" key={i}>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-body">{f.body}</div>
                </div>
              ))}
            </div>
          </section>

          {upcoming.length > 0 && (
            <section>
              <div className="section-header">
                <div>
                  <div className="section-title">Upcoming Events</div>
                  <div className="section-subtitle">{upcoming.length} scheduled</div>
                </div>
                <Link to="/events" className="btn btn-ghost btn-sm">View all <ArrowRight size={12} /></Link>
              </div>
              <div className="event-list">
                {upcoming.map((e) => (
                  <Link key={e.slug} to={`/events/${e.slug}`} className="event-row">
                    <div className="event-row-left">
                      <div className="event-row-title">{e.title}</div>
                      <div className="event-row-meta">
                        <span><Calendar size={12} /> {fmtDate(e.date)}</span>
                        <span><Clock size={12} /> {fmtTime(e.date)}</span>
                        {e.location && <span><MapPin size={12} /> {e.location}</span>}
                      </div>
                      {e.shortDescription && <div className="event-row-desc">{e.shortDescription}</div>}
                    </div>
                    <span className="chip chip-soon">Upcoming</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <aside className="home-col-side">
          {topUsers.length > 0 && (
            <section className="card">
              <div className="section-header" style={{ marginBottom: '0.75rem' }}>
                <div className="section-title" style={{ fontSize: '0.95rem' }}>Top Rated</div>
                <Link to="/leaderboard" className="btn btn-ghost btn-sm">All <ArrowRight size={12} /></Link>
              </div>
              <ul className="top-list">
                {topUsers.map((u, i) => (
                  <li key={u.uid} className="top-list-row">
                    <span className={`lb-rank-num lb-rank-${i + 1}`}>{i + 1}</span>
                    <div className="top-avatar">{(u.name || u.username || '?').charAt(0).toUpperCase()}</div>
                    <div className="top-user">
                      <div className={`top-handle rank ${rankColor(u.cfRating)}`}>{u.username || u.name}</div>
                      <div className="top-sub">{u.cfusername ? `@${u.cfusername}` : '—'}</div>
                    </div>
                    <span className="top-rating mono">{u.cfRating || '—'}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card">
            <div className="section-title" style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Quick Links</div>
            <div className="quick-links">
              <Link to="/contests" className="quick-link"><CalendarDays size={15} /> Contest Calendar</Link>
              <Link to="/leaderboard" className="quick-link"><Trophy size={15} /> Leaderboards</Link>
              <Link to="/events" className="quick-link"><Calendar size={15} /> Events</Link>
              {site?.links?.github && (
                <a href={site.links.github} className="quick-link" target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
              )}
            </div>
          </section>
        </aside>
      </div>

      {site?.footer && <footer className="home-footer">{site.footer}</footer>}
    </main>
  );
};

export default Home;
