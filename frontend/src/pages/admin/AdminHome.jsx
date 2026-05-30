import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Users, ArrowRight } from 'lucide-react';

const cards = [
  { to: '/admin/events',       title: 'Events',       desc: 'Create, edit and publish events.',          icon: Calendar },
  { to: '/admin/leaderboards', title: 'Leaderboards', desc: 'Design custom leaderboards with the DSL.',  icon: Trophy   },
  { to: '/admin/users',        title: 'Users',        desc: 'Manage roles and view member directory.',   icon: Users    },
];

export default function AdminHome() {
  return (
    <main className="page-content-area">
      <div className="section-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="section-title" style={{ fontSize: '1.5rem' }}>Dashboard</h1>
          <div className="section-subtitle">Manage events, leaderboards and members</div>
        </div>
      </div>

      <div className="admin-card-grid">
        {cards.map(({ to, title, desc, icon: Icon }) => (
          <Link key={to} to={to} className="admin-tile">
            <div className="admin-tile-icon"><Icon size={20} /></div>
            <div className="admin-tile-body">
              <div className="admin-tile-title">{title}</div>
              <div className="admin-tile-desc">{desc}</div>
            </div>
            <ArrowRight size={16} className="admin-tile-arrow" />
          </Link>
        ))}
      </div>

      <style>{`
        .admin-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .admin-tile {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.2rem;
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          color: inherit;
          text-decoration: none;
          transition: all var(--t);
        }
        .admin-tile:hover {
          border-color: var(--accent);
          background: var(--surface-2);
          transform: translateY(-1px);
        }
        .admin-tile-icon {
          width: 40px; height: 40px;
          display: grid; place-items: center;
          background: var(--accent-soft);
          color: var(--accent-strong);
          border-radius: var(--r);
          flex-shrink: 0;
        }
        .admin-tile-body { flex: 1; min-width: 0; }
        .admin-tile-title { font-weight: 600; font-size: 1rem; }
        .admin-tile-desc { font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; }
        .admin-tile-arrow { color: var(--text-dim); transition: transform var(--t); }
        .admin-tile:hover .admin-tile-arrow { color: var(--accent-strong); transform: translateX(2px); }
      `}</style>
    </main>
  );
}
