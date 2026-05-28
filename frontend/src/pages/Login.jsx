import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

const Login = () => {
  const { login, firebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErr = {};
    if (!formData.email.trim()) newErr.email = 'Email is required';
    if (!formData.password) newErr.password = 'Password is required';
    setErrors(newErr);
    if (Object.keys(newErr).length) return;
    setSubmitting(true);
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.message || 'Login failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page-container">
      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to CP-Hub</p>
          </div>

          {!firebaseConfigured && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              Firebase is not configured. See <code>FIREBASE_SETUP.md</code>.
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email" id="email" name="email"
                value={formData.email} onChange={handleChange}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@iitg.ac.in"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password" id="password" name="password"
                value={formData.password} onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit" className="btn-auth-primary" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>

            {errors.submit && (
              <div className="error-message" style={{ textAlign: 'center', marginTop: '1rem' }}>
                {errors.submit}
              </div>
            )}
          </form>

          <div className="auth-footer">
            <p className="auth-redirect-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-redirect-link">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
