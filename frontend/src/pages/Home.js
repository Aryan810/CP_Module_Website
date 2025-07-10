import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <main className="page-content-area">
      <section className="hero-banner-section">
        <div className="hero-content-container">
          <h1 className="hero-primary-title">Welcome to CodeWars</h1>
          <p className="hero-description-text">
            Master competitive programming with our comprehensive platform
          </p>
          <div className="hero-actions-wrapper">
            <button className="btn-cta-primary">Start Solving</button>
            <button className="btn-cta-secondary">View Contests</button>
          </div>
        </div>
      </section>

      <section className="features-showcase-section">
        <div className="features-grid-layout">
          <div className="feature-card-item">
            <h3>Problem Sets</h3>
            <p>Practice with thousands of curated problems</p>
          </div>
          <div className="feature-card-item">
            <h3>Live Contests</h3>
            <p>Compete in real-time programming contests</p>
          </div>
          <div className="feature-card-item">
            <h3>Progress Tracking</h3>
            <p>Monitor your improvement with detailed analytics</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
