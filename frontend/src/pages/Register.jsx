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
    if (!formData.username.trim() || formData.username.length < 3) e.username = 'At least 3 characters';
    if (!formData.email.trim()) e.email = 'Email is required';
    if (!formData.cfusername.trim()) e.cfusername = 'Codeforces handle required';
    if (!formData.password || formData.password.length < 6) e.password = 'At least 6 characters';
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
    <main className="auth-page-wrapper">
      <div className="auth-form-container" style={{ maxWidth: 480 }}>
        <div className="eyebrow" style={{ textAlign: 'center' }}>CP-Hub</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join the Coding Club community</p>

        {!firebaseConfigured && (
          <div className="auth-error-msg" style={{ marginBottom: '1rem' }}>
            Firebase is not configured. See <code>FIREBASE_SETUP.md</code>.
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <div className="auth-field">
              <label>Username</label>
              <input name="username" value={formData.username} onChange={handleChange} placeholder="e.g. mehul_v0" />
              {errors.username && <span className="auth-error-msg">{errors.username}</span>}
            </div>
            <div className="auth-field">
              <label>Full name</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="optional" />
            </div>
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@iitg.ac.in" />
            {errors.email && <span className="auth-error-msg">{errors.email}</span>}
          </div>
          <div className="auth-field">
            <label>Codeforces handle</label>
            <input name="cfusername" value={formData.cfusername} onChange={handleChange} placeholder="your CF handle" />
            {errors.cfusername && <span className="auth-error-msg">{errors.cfusername}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="6+ characters" />
              {errors.password && <span className="auth-error-msg">{errors.password}</span>}
            </div>
            <div className="auth-field">
              <label>Confirm</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="repeat password" />
              {errors.confirmPassword && <span className="auth-error-msg">{errors.confirmPassword}</span>}
            </div>
          </div>
          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
          {errors.submit && <div className="auth-error-msg">{errors.submit}</div>}
        </form>

        <p className="auth-footer-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
