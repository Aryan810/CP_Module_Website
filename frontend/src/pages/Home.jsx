import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Api from '../services/api';
import './Home.css';

const Home = () => {
  const [site, setSite] = useState(null);
  const [home, setHome] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Api.loadSite().then(setSite).catch(() => setSite({ name: 'CP-Hub' }));
    Api.loadHome().then(setHome).catch(() => setHome(null));
    Promise.all([Api.loadStaticEvents(), Api.listEvents()])
      .then(([staticE, dynE]) => {
        const map = new Map();
        for (const e of staticE) map.set(e.slug, e);
        for (const e of dynE) map.set(e.slug, e); // dynamic wins
        const list = [...map.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(list);
      })
      .catch(() => setEvents([]));
  }, []);

  if (!home) return <main className="page-content-area"><p>Loading…</p></main>;

  const upcoming = events.filter((e) => new Date(e.date) >= new Date()).slice(0, home.upcomingEventsCount || 3);

  return (
    <main className="page-content-area">
      <section className="hero-banner-section">
        <div className="hero-content-container">
          <h1 className="hero-primary-title">{home.hero.title}</h1>
          <p className="hero-description-text">{home.hero.subtitle}</p>
          <div className="hero-actions-wrapper">
            {home.hero.ctaPrimary && <Link to={home.hero.ctaPrimary.to} className="btn-cta-primary">{home.hero.ctaPrimary.label}</Link>}
            {home.hero.ctaSecondary && <Link to={home.hero.ctaSecondary.to} className="btn-cta-secondary">{home.hero.ctaSecondary.label}</Link>}
          </div>
        </div>
      </section>

      {home.intro && (
        <section className="features-showcase-section" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
          <h2>{home.intro.title}</h2>
          <p style={{ lineHeight: 1.6 }}>{home.intro.body}</p>
        </section>
      )}

      <section className="features-showcase-section">
        <div className="features-grid-layout">
          {home.features.map((f, i) => (
            <div className="feature-card-item" key={i}>
              <div style={{ fontSize: '2rem' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="features-showcase-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
          <h2>Upcoming Events</h2>
          <div className="features-grid-layout">
            {upcoming.map((e) => (
              <Link key={e.slug} to={`/events/${e.slug}`} className="feature-card-item" style={{ textDecoration: 'none' }}>
                <h3>{e.title}</h3>
                <p>{new Date(e.date).toLocaleString()}</p>
                {e.shortDescription && <p>{e.shortDescription}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {site?.footer && <footer style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>{site.footer}</footer>}
    </main>
  );
};

export default Home;
