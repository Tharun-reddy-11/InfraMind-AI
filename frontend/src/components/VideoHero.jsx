import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, AlertTriangle, Wrench, CheckCircle2, CloudSun, MapPin, ClipboardList } from 'lucide-react';

export default function VideoHero() {
  const navigate = useNavigate();

  const handleExplore = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const marqueeFeatures = [
    { icon: <Activity size={16} color="#38bdf8" />, text: 'Bridge Structural Health & Degradation Scoring' },
    { icon: <AlertTriangle size={16} color="#fbbf24" />, text: 'Early Risk Prevention to Eliminate Emergency Road Closures' },
    { icon: <MapPin size={16} color="#34d399" />, text: 'Pothole & Roadway Hazard Tracking with GPS Coordinates' },
    { icon: <Wrench size={16} color="#38bdf8" />, text: 'Field Maintenance Crew Dispatch with Action Directives' },
    { icon: <CheckCircle2 size={16} color="#4ade80" />, text: 'Closed-Loop Repair Photo Verification by Municipal Officers' },
    { icon: <CloudSun size={16} color="#60a5fa" />, text: 'Live Weather Telemetry & Thermal Stress Compensation' },
    { icon: <ClipboardList size={16} color="#f472b6" />, text: 'Zero-Paperwork Municipal Infrastructure Audit Records' },
    { icon: <ShieldCheck size={16} color="#a78bfa" />, text: 'Seamless Multi-Department Coordination Across City Services' },
  ];

  return (
    <section id="hero" className="hero">
      {/* 5-15s Zoom-in/Zoom-out Motion Background */}
      <div className="hero-motion-bg-wrap">
        <img
          src="/images/landing_hero_bg.png"
          alt="InfraMind AI Municipal Infrastructure Monitoring"
          className="hero-motion-bg"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Translucent Overlay */}
      <div className="hero-overlay" />

      <div className="hero-content">
        {/* 3 Distinct Bold Colors matching previous design system */}
        <h1 className="hero-title" style={{ marginTop: '1.5rem' }}>
          <span style={{ color: '#ffffff', display: 'inline-block', marginRight: '14px' }}>
            Predict Structural Risk.
          </span>
          <br />
          <span style={{ color: '#38bdf8', display: 'inline-block' }}>
            Empower Municipal Engineers.
          </span>
          <br />
          <span style={{ color: '#fbbf24', display: 'inline-block', marginTop: '6px' }}>
            Protect Public Safety.
          </span>
        </h1>

        <p className="hero-subtitle">
          An end-to-end municipal platform unifying Infrastructure Engineers, Municipal Authorities,
          Field Maintenance Crews, and Citizens. Featuring real-time ML risk forecasting from NBI data,
          bridge displacement telemetry, AI crack vision, and closed-loop repair verification.
        </p>

        <div className="hero-cta" style={{ marginBottom: '1.2rem' }}>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
            style={{ padding: '14px 34px', fontSize: '1.05rem', gap: '10px' }}
          >
            <span>Launch Workspace</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={handleExplore}
            className="btn-secondary"
            style={{
              padding: '13px 28px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            Explore Operating Loop
          </button>
        </div>
      </div>

      {/* Real-World Features Continuous Moving Marquee */}
      <div className="hero-marquee-container">
        <div className="hero-marquee-track">
          {marqueeFeatures.concat(marqueeFeatures).map((feat, idx) => (
            <div key={idx} className="hero-marquee-item">
              <span className="hero-marquee-dot" />
              {feat.icon}
              <span>{feat.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
