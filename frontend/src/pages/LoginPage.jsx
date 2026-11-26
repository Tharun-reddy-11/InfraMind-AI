import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both your official email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });
      login(response);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email address or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* High-Resolution Infrastructure Background Image */}
      <img
        src="/images/auth_bg.jpg"
        alt="InfraMind Municipal Intelligence Workspace"
        className="auth-bg"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />

      <div className="auth-overlay-clear" />

      <main className="auth-card" style={{ maxWidth: '460px' }}>
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-block' }}>
            <img src="/logo.png" alt="InfraMind AI" className="auth-logo-img" />
          </Link>
          <h2 className="auth-title">Welcome to InfraMind AI</h2>
          <p className="auth-subtitle">Sign in to your municipal operations workspace</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Official Email Address <span className="req">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="Please enter email address"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="req">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Please enter password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </main>
    </div>
  );
}
