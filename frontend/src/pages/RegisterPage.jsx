import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { ArrowRight, UserPlus } from 'lucide-react';
import { MUNICIPAL_CORPORATIONS } from '../utils/municipalities';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedCorp, setSelectedCorp] = useState(MUNICIPAL_CORPORATIONS[0]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    city: MUNICIPAL_CORPORATIONS[0].city,
    state: MUNICIPAL_CORPORATIONS[0].state,
    address: '',
    pinCode: MUNICIPAL_CORPORATIONS[0].defaultPin,
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

  const handleMunicipalityChange = (e) => {
    const corpId = e.target.value;
    const corp = MUNICIPAL_CORPORATIONS.find((m) => m.id === corpId) || MUNICIPAL_CORPORATIONS[0];
    setSelectedCorp(corp);
    setFormData((prev) => ({
      ...prev,
      city: corp.city,
      state: corp.state,
      pinCode: corp.defaultPin,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authApi.register({
        ...formData,
        role: 'CITIZEN',
      });
      login(response);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <img
        src="/images/auth_bg.jpg"
        alt="InfraMind AI Municipal Platform"
        className="auth-bg"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div className="auth-overlay-clear" />

      <main className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-block' }}>
            <img src="/logo.png" alt="InfraMind AI" className="auth-logo-img" />
          </Link>
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">Join the InfraMind municipal infrastructure workspace</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name <span className="req">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              className="form-input"
              placeholder="Please enter full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address <span className="req">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="Please enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobile">
                Phone Number
              </label>
              <input
                id="mobile"
                type="tel"
                name="mobile"
                className="form-input"
                placeholder="Please enter phone number"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password (min. 6 characters) <span className="req">*</span>
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Please enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* AP & Telangana Municipal Corporation Dropdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="municipality">
              Municipal Corporation (Andhra Pradesh & Telangana) <span className="req">*</span>
            </label>
            <select
              id="municipality"
              className="form-select"
              value={selectedCorp.id}
              onChange={handleMunicipalityChange}
              style={{ fontWeight: 600, color: 'var(--primary-dark)' }}
            >
              <optgroup label="Andhra Pradesh Municipal Corporations">
                {MUNICIPAL_CORPORATIONS.filter((m) => m.state === 'Andhra Pradesh').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Telangana Municipal Corporations">
                {MUNICIPAL_CORPORATIONS.filter((m) => m.state === 'Telangana').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="state">
                State
              </label>
              <input
                id="state"
                type="text"
                name="state"
                className="form-input"
                value={formData.state}
                readOnly
                style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pinCode">
                Postal PIN Code
              </label>
              <input
                id="pinCode"
                type="text"
                name="pinCode"
                className="form-input"
                placeholder="Please enter PIN code"
                value={formData.pinCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Residential Area / Street Address
            </label>
            <input
              id="address"
              type="text"
              name="address"
              className="form-input"
              placeholder="Please enter street address / locality"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '0.8rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register User Account</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
