import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import config from '../config/env.js';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        console.log('Attempting login for:', formData.username);
        console.log('API URL:', `${config.apiBaseUrl}/users/login/${formData.username}`);
        
        const response = await fetch(`${config.apiBaseUrl}/users/login/${formData.username}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: formData.password
          })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const responseText = await response.text();
          console.log('Response text:', responseText);
          
          if (responseText) {
            try {
              const userData = JSON.parse(responseText);
              console.log('Login successful:', userData);
              login(userData.user);
              navigate('/');
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              setErrors({ submit: 'Invalid response from server' });
            }
          } else {
            console.error('Empty response received');
            setErrors({ submit: 'Empty response from server' });
          }
        } else {
          const responseText = await response.text();
          console.log('Error response text:', responseText);
          
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              setErrors({ submit: errorData.message || 'Login failed' });
            } catch (parseError) {
              setErrors({ submit: `Server error: ${response.status}` });
            }
          } else {
            setErrors({ submit: `Server error: ${response.status}` });
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ submit: 'Network error. Please try again.' });
      }
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
            
            {errors.submit && (
              <div className="error-message" style={{ textAlign: 'center', marginTop: '1rem' }}>
                {errors.submit}
              </div>
            )}
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
