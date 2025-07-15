import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UserProfile from './UserProfile.jsx';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header className="site-primary-header">
        <div className="header-content-wrapper">
          <div className="brand-logo-section">
            <Link to="/" className="brand-name-text">CodeWars</Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="site-primary-header">
      <div className="header-content-wrapper">
        <div className="brand-logo-section">
          <Link to="/" className="brand-name-text">CodeWars</Link>
        </div>
        <nav className="main-navigation-menu">
          <Link 
            to="/" 
            className={`nav-link-item ${location.pathname === '/' ? 'nav-link-active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/problems" 
            className={`nav-link-item ${location.pathname === '/problems' ? 'nav-link-active' : ''}`}
          >
            Problemset
          </Link>
          <Link 
            to="/contests" 
            className={`nav-link-item ${location.pathname === '/contests' ? 'nav-link-active' : ''}`}
          >
            Contests
          </Link>
          <Link 
            to="/leaderboard" 
            className={`nav-link-item ${location.pathname === '/leaderboard' ? 'nav-link-active' : ''}`}
          >
            Leaderboard
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link-item ${location.pathname === '/profile' ? 'nav-link-active' : ''}`}
          >
            Profile
          </Link>
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
