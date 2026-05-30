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
    <main className="auth-page-wrapper">
      <div className="auth-form-container">
        <div className="eyebrow" style={{ textAlign: 'center' }}>CP-Hub</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {!firebaseConfigured && (
          <div className="auth-error-msg" style={{ marginBottom: '1rem' }}>
            Firebase is not configured. See <code>FIREBASE_SETUP.md</code>.
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="you@iitg.ac.in" />
            {errors.email && <span className="auth-error-msg">{errors.email}</span>}
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="••••••••" />
            {errors.password && <span className="auth-error-msg">{errors.password}</span>}
          </div>
          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          {errors.submit && <div className="auth-error-msg">{errors.submit}</div>}
        </form>

        <p className="auth-footer-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
