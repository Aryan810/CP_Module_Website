import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Login submitted:', { ...formData, userType });
      // Handle login logic here
    }
  };

  return (
    <main className="auth-page-container">
      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          {/* Role Selection Slider */}
          <div className="role-selector-container">
            <div className="role-slider-wrapper">
              <button
                type="button"
                className={`role-option ${userType === 'user' ? 'role-active' : ''}`}
                onClick={() => setUserType('user')}
              >
                <span className="role-icon">👨‍💻</span>
                <span className="role-label">User</span>
              </button>
              <button
                type="button"
                className={`role-option ${userType === 'admin' ? 'role-active' : ''}`}
                onClick={() => setUserType('admin')}
              >
                <span className="role-icon">🛡️</span>
                <span className="role-label">Admin</span>
              </button>
              <div className={`role-slider-indicator ${userType === 'admin' ? 'role-slider-right' : ''}`}></div>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                placeholder="Enter your username"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit" className="btn-auth-primary">
              Sign In as {userType === 'user' ? 'User' : 'Admin'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-redirect-text">
              Don't have an account yet?{' '}
              <Link to="/register" className="auth-redirect-link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
