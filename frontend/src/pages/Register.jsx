import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config/env.js';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    cfusername: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@iitg.ac.in')) {
      newErrors.email = 'Email must be from IIT Guwahati domain (@itg.ac.in)';
    }
    
    if (!formData.cfusername.trim()) {
      newErrors.cfusername = 'Codeforces username is required';
    } else if (formData.cfusername.length < 3) {
      newErrors.cfusername = 'Codeforces username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Send POST request to backend API
        const response = await fetch(`${config.apiBaseUrl}/api/users/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: 'user', // Default role for registration
            cfusername: formData.cfusername, // Using separate cfusername field
            name: formData.username // Using username as default name
          })
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Registration successful:', userData);
          
          // Clear form and show success
          setFormData({
            username: '',
            email: '',
            cfusername: '',
            password: '',
            confirmPassword: ''
          });
          
          // Redirect to login page with success message
          alert('Registration successful! Please login with your credentials.');
          navigate('/login');
          
        } else {
          const errorData = await response.json();
          
          // Handle different types of errors
          if (response.status === 400) {
            // Validation errors or duplicate user
            if (errorData.message.includes('username') || errorData.message.includes('duplicate')) {
              setErrors({ submit: 'Username or email already exists. Please try different credentials.' });
            } else {
              setErrors({ submit: errorData.message || 'Registration failed. Please check your information.' });
            }
          } else {
            setErrors({ submit: 'Server error. Please try again later.' });
          }
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ submit: 'Network error. Please check your connection and try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <main className="auth-page-container">
      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join our competitive programming community</p>
          </div>

          <form className="auth-form register-form-layout" onSubmit={handleSubmit}>
            <div className="form-columns-container">
              {/* Left Column - Personal Details */}
              <div className="form-column form-column-left">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`form-input ${errors.username ? 'input-error' : ''}`}
                    placeholder="Choose a username"
                  />
                  {errors.username && <span className="error-message">{errors.username}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="your.name@iitg.ac.in"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                  <span className="form-helper-text">Only IIT Guwahati email addresses are allowed</span>
                </div>

                <div className="form-group">
                  <label htmlFor="cfusername" className="form-label">Codeforces Username</label>
                  <input
                    type="text"
                    id="cfusername"
                    name="cfusername"
                    value={formData.cfusername}
                    onChange={handleInputChange}
                    className={`form-input ${errors.cfusername ? 'input-error' : ''}`}
                    placeholder="Your Codeforces handle"
                  />
                  {errors.cfusername && <span className="error-message">{errors.cfusername}</span>}
                  <span className="form-helper-text">Enter your existing Codeforces username</span>
                </div>
              </div>

              {/* Right Column - Security Details */}
              <div className="form-column form-column-right">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a strong password"
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                {/* Empty div to balance the layout */}
                <div className="form-group form-group-spacer"></div>
              </div>
            </div>

            <div className="form-submit-section">
              <button type="submit" className="btn-auth-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
              Already have an account?{' '}
              <Link to="/login" className="auth-redirect-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
