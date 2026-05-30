import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import UserProfile from './UserProfile.jsx';
import './Navbar.css';

const Navbar = ({ site = {} }) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const brand = site.name || 'CP-Hub';
  const isActive = (p) => location.pathname === p ? 'nav-link-active' : '';
  const [open, setOpen] = useState(false);

  // Close drawer on route change.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Lock body scroll when drawer is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : prev || '';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (isLoading) {
    return (
      <header className="site-primary-header">
        <div className="header-content-wrapper">
          <div className="brand-logo-section">
            <Link to="/" className="brand-name-text">{brand}</Link>
          </div>
        </div>
      </header>
    );
  }

  const links = (
    <>
      <Link to="/" className={`nav-link-item ${isActive('/')}`}>Home</Link>
      <Link to="/events" className={`nav-link-item ${isActive('/events')}`}>Events</Link>
      <Link to="/contests" className={`nav-link-item ${isActive('/contests')}`}>Contests</Link>
      <Link to="/leaderboard" className={`nav-link-item ${isActive('/leaderboard')}`}>Leaderboard</Link>
      {user && <Link to="/profile" className={`nav-link-item ${isActive('/profile')}`}>Profile</Link>}
      {user?.role === 'admin' && <Link to="/admin" className={`nav-link-item ${location.pathname.startsWith('/admin') ? 'nav-link-active' : ''}`}>Admin</Link>}
    </>
  );

  return (
    <header className="site-primary-header">
      <div className="header-content-wrapper">
        <div className="brand-logo-section">
          <Link to="/" className="brand-name-text">{brand}</Link>
        </div>
        <nav className="main-navigation-menu">{links}</nav>
        <div className="user-auth-controls">
          {user ? (
            <UserProfile />
          ) : (
            <>
              <Link to="/login" className="btn-login-outline">Login</Link>
              <Link to="/register" className="btn-signup-filled">Sign Up</Link>
            </>
          )}
          <button
            type="button"
            className="nav-hamburger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && <div className="nav-drawer-backdrop" onClick={() => setOpen(false)} />}
      <nav className={`nav-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="nav-drawer-links">{links}</div>
        {!user && (
          <div className="nav-drawer-auth">
            <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Sign Up</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
