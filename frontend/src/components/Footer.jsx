import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <Link to="/" className="brand" style={{ color: '#ffffff' }}>
            <img src="/logo.png" alt="InfraMind AI" style={{ width: '36px', height: '36px' }} />
            <div>
              <span>Infra<span style={{ color: '#38bdf8' }}>Mind</span> AI</span>
              <span className="brand-tagline" style={{ color: '#94a3b8' }}>PREDICTIVE INFRASTRUCTURE RESILIENCE</span>
            </div>
          </Link>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', lineHeight: 1.6, color: '#94a3b8', maxWidth: '340px' }}>
            Full-stack municipal decision platform connecting sensor telemetry, machine learning forecasting,
            and field maintenance operations for safer bridges, roads, and structures.
          </p>
        </div>

        <div className="footer-col">
          <h4>Platform Features</h4>
          <ul className="footer-links">
            <li><a href="#features">NBI Bridge Risk ML</a></li>
            <li><a href="#features">Displacement Telemetry</a></li>
            <li><a href="#features">Concrete Crack Vision</a></li>
            <li><a href="#features">Road Damage & Potholes</a></li>
            <li><a href="#features">Weather Context (Open-Meteo)</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Municipal Roles</h4>
          <ul className="footer-links">
            <li><Link to="/login">Infrastructure Engineer</Link></li>
            <li><Link to="/login">Municipal Engineer</Link></li>
            <li><Link to="/login">Field Maintenance Team</Link></li>
            <li><Link to="/login">System Administrator</Link></li>
            <li><Link to="/register">Citizen Reporting</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Security & Data</h4>
          <ul className="footer-links">
            <li><span>National Bridge Inventory (NBI)</span></li>
            <li><span>SDNET2018 Crack Standards</span></li>
            <li><span>Open-Meteo API Integration</span></li>
            <li><span>Role-Based Access Control</span></li>
            <li><span>Auditable Prediction History</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} InfraMind AI Inc. All rights reserved. Built for municipal resilience.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>API Documentation</span>
        </div>
      </div>
    </footer>
  );
}
