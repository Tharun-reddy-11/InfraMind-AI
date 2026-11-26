import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowRight, LayoutDashboard, LogIn, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <img src="/logo.png" alt="InfraMind AI" style={{ width: '38px', height: '38px' }} />
        <div>
          <span>Infra<span className="brand-ai">Mind</span> AI</span>
          <span className="brand-tagline">MUNICIPAL INFRASTRUCTURE PLATFORM</span>
        </div>
      </Link>

      <div className="nav-links">
        <button onClick={() => handleScroll('features')} className="nav-link">
          Features
        </button>
        <button onClick={() => handleScroll('how-it-works')} className="nav-link">
          How It Works
        </button>
        <button onClick={() => handleScroll('about')} className="nav-link">
          About
        </button>
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.9rem' }}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard ({user.role?.replace('_', ' ')})</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="btn-secondary"
              style={{ padding: '8px 20px', fontSize: '0.9rem', gap: '6px' }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{ padding: '8px 22px', fontSize: '0.9rem' }}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
