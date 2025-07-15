import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './UserProfile.css';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  // Don't render if no user
  if (!user) return null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still close dropdown even if logout fails
      setIsDropdownOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getCodeforcesImageUrl = (cfusername, cfImageUrl) => {
    // Use the stored image URL from API if available
    if (cfImageUrl) {
      return cfImageUrl;
    }
    // Fallback to CDN pattern if no stored URL
    return `https://cdn.usaco.guide/cf-avatars/${cfusername}.jpg`;
  };

  const handleImageError = (e) => {
    // Prevent infinite loop by checking if we've already set a fallback
    if (e.target.src.startsWith('data:')) return;
    
    const initial = (user.name || user.username).charAt(0).toUpperCase();
    const size = e.target.classList.contains('dropdown-avatar') ? 40 : 32;
    const fontSize = size === 40 ? 18 : 14;
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw background circle
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, size/2, size/2);
    
    e.target.src = canvas.toDataURL();
  };

  return (
    <div className="user-profile-container" ref={dropdownRef}>
      <button 
        className="user-profile-button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <img 
          src={getCodeforcesImageUrl(user.cfusername, user.cfImageUrl)}
          alt={user.name || user.username}
          className="user-avatar"
          onError={handleImageError}
        />
        <span className="user-name">{user.name || user.username}</span>
        <svg 
          className={`dropdown-arrow ${isDropdownOpen ? 'rotated' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <img 
              src={getCodeforcesImageUrl(user.cfusername, user.cfImageUrl)}
              alt={user.name || user.username}
              className="dropdown-avatar"
              onError={handleImageError}
            />
            <div className="dropdown-user-info">
              <div className="dropdown-user-name">{user.name || user.username}</div>
              <div className="dropdown-user-cf">@{user.cfusername}</div>
            </div>
          </div>
          <hr className="dropdown-divider" />
          <button className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
            Profile
          </button>
          <button className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
            Settings
          </button>
          <hr className="dropdown-divider" />
          <button className="dropdown-item logout-item" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
