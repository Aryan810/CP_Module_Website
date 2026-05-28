import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UserProfile from './UserProfile.jsx';
import './Navbar.css';

const Navbar = ({ site = {} }) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const brand = site.name || 'CP-Hub';
  const isActive = (p) => location.pathname === p ? 'nav-link-active' : '';

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

  return (
    <header className="site-primary-header">
      <div className="header-content-wrapper">
        <div className="brand-logo-section">
          <Link to="/" className="brand-name-text">{brand}</Link>
        </div>
        <nav className="main-navigation-menu">
          <Link to="/" className={`nav-link-item ${isActive('/')}`}>Home</Link>
          <Link to="/events" className={`nav-link-item ${isActive('/events')}`}>Events</Link>
          <Link to="/contests" className={`nav-link-item ${isActive('/contests')}`}>Contests</Link>
          <Link to="/leaderboard" className={`nav-link-item ${isActive('/leaderboard')}`}>Leaderboard</Link>
          {user && <Link to="/profile" className={`nav-link-item ${isActive('/profile')}`}>Profile</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={`nav-link-item ${location.pathname.startsWith('/admin') ? 'nav-link-active' : ''}`}>Admin</Link>}
        </nav>
        <div className="user-auth-controls">
          {user ? (
            <UserProfile />
          ) : (
            <>
              <Link to="/login" className="btn-login-outline">Login</Link>
              <Link to="/register" className="btn-signup-filled">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
