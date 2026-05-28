import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Register.css';

const Register = () => {
  const { register, firebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', cfusername: '', name: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.username.trim() || formData.username.length < 3) e.username = 'At least 3 chars';
    if (!formData.email.trim()) e.email = 'Email is required';
    if (!formData.cfusername.trim()) e.cfusername = 'Codeforces handle required';
    if (!formData.password || formData.password.length < 6) e.password = 'At least 6 chars';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page-container">
      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Join CP-Hub</h1>
            <p className="auth-subtitle">Create your account</p>
          </div>

          {!firebaseConfigured && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              Firebase is not configured. See <code>FIREBASE_SETUP.md</code>.
            </div>
          )}

          <form className="auth-form register-form-layout" onSubmit={handleSubmit}>
            <div className="form-columns-container">
              <div className="form-column form-column-left">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input name="username" value={formData.username} onChange={handleChange}
                    className={`form-input ${errors.username ? 'input-error' : ''}`}
                    placeholder="Choose a username" />
                  {errors.username && <span className="error-message">{errors.username}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange}
                    className="form-input" placeholder="(optional)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@iitg.ac.in" />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Codeforces Handle</label>
                  <input name="cfusername" value={formData.cfusername} onChange={handleChange}
                    className={`form-input ${errors.cfusername ? 'input-error' : ''}`}
                    placeholder="Your CF handle" />
                  {errors.cfusername && <span className="error-message">{errors.cfusername}</span>}
                </div>
              </div>

              <div className="form-column form-column-right">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="At least 6 characters" />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm" />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            <div className="form-submit-section">
              <button type="submit" className="btn-auth-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Account'}
              </button>
              {errors.submit && (
                <div className="error-message" style={{ textAlign: 'center', marginTop: '1rem' }}>
                  {errors.submit}
                </div>
              )}
            </div>
          </form>

          <div className="auth-footer">
            <p className="auth-redirect-text">
              Already have an account? <Link to="/login" className="auth-redirect-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
