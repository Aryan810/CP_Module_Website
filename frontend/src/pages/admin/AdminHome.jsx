import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  return (
    <main className="page-content-area" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1>Admin</h1>
      <p>Manage events, leaderboards and users.</p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <li><Link to="/admin/events" className="admin-card">📅 Events</Link></li>
        <li><Link to="/admin/leaderboards" className="admin-card">🏆 Leaderboards</Link></li>
      </ul>
      <style>{`
        .admin-card { display: block; padding: 1.5rem; background: #1f2937; border: 1px solid #374151; border-radius: 12px; text-decoration: none; color: inherit; font-size: 1.2rem; }
        .admin-card:hover { border-color: #4f46e5; }
      `}</style>
    </main>
  );
}
