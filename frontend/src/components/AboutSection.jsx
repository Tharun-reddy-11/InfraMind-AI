import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function AboutSection() {
  const navigate = useNavigate();

  return (
    <section id="about" className="about-section">
      <div className="about-card">
        <div>
          <span
            className="section-tag"
            style={{
              background: 'rgba(29, 78, 216, 0.1)',
              color: 'var(--primary)',
              padding: '4px 12px',
              borderRadius: '9999px',
            }}
          >
            MUNICIPAL MOTIVATION & OBJECTIVES
          </span>
          <h2
            className="section-title"
            style={{ fontSize: '2.1rem', marginBottom: '1.1rem', marginTop: '0.6rem' }}
          >
            Infrastructure Deserves an Auditable, Living Memory
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.65,
              marginBottom: '1.6rem',
            }}
          >
            Municipal infrastructure often suffers from disconnected systems: inspections stored in
            paper binders, telemetry isolated in vendor dashboards, and citizen complaints lost in email threads.
            InfraMind AI creates a unified operating loop that links every sensor reading, AI risk prediction,
            approval signature, and field repair into one permanent municipal record.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', marginBottom: '2.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CheckCircle2 size={20} color="#1d4ed8" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Trained NBI Machine Learning models deliver honest risk probabilities and degradation forecasts.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CheckCircle2 size={20} color="#1d4ed8" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Clear responsibility division: Municipal Engineers approve, Infrastructure Engineers analyze, Maintenance Crews execute.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CheckCircle2 size={20} color="#1d4ed8" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Live environmental intelligence via Open-Meteo tracks freeze-thaw cycles and severe weather stress.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CheckCircle2 size={20} color="#1d4ed8" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Citizen participation portal with instant computer vision cavity detection closes reporting gaps.
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="btn-primary"
            style={{ padding: '13px 30px', fontSize: '1rem' }}
          >
            <span>Deploy Workspace for Your Municipality</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Right Side: Replaced text box with application-related engineering command center image */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 16px 36px rgba(15, 39, 68, 0.22)',
            minHeight: '380px',
            border: '2px solid rgba(29, 78, 216, 0.2)',
          }}
        >
          <img
            src="/images/about_municipal.jpg"
            alt="Municipal Infrastructure Engineering Command & Decision Intelligence Center"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.5s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15, 39, 68, 0.1) 0%, rgba(15, 39, 68, 0.75) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '1.8rem',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                width: 'fit-content',
                marginBottom: '8px',
              }}
            >
              <Activity size={15} color="#38bdf8" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em', color: '#38bdf8' }}>
                MUNICIPAL DECISION INTELLIGENCE
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
              Integrated Civil Infrastructure Operations Hub
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
              Connecting real-time IoT sensors, drone computer vision, and city maintenance crews into a unified command loop.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
