import React from 'react';

export default function HowItWorksMarquee() {
  const steps = [
    {
      num: '01',
      title: 'Initial Asset Registration',
      role: 'Municipal Engineer',
      desc: 'Registers official municipality bridge and roadway assets with GIS coordinates, construction year, and baseline metrics.',
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      badgeColor: '#93c5fd',
      borderColor: 'rgba(147, 197, 253, 0.4)',
    },
    {
      num: '02',
      title: 'Technical Monitoring Telemetry',
      role: 'Infrastructure Engineer',
      desc: 'Monitors bridge strain gauges, displacement sensors, and live Open-Meteo weather parameters at exact coordinates.',
      bg: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
      badgeColor: '#6ee7b7',
      borderColor: 'rgba(110, 231, 183, 0.4)',
    },
    {
      num: '03',
      title: 'Run AI Predictive Models',
      role: 'Infrastructure Engineer',
      desc: 'Executes NBI-trained Random Forest risk model and harmonic thermal drift detector to identify structural anomalies.',
      bg: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
      badgeColor: '#d8b4fe',
      borderColor: 'rgba(216, 180, 254, 0.4)',
    },
    {
      num: '04',
      title: 'Raise Maintenance Request',
      role: 'Infrastructure Engineer',
      desc: 'Submits formal engineering maintenance request with attached displacement evidence and inspection urgency rating.',
      bg: 'linear-gradient(135deg, #0e7490 0%, #0369a1 100%)',
      badgeColor: '#7dd3fc',
      borderColor: 'rgba(125, 211, 252, 0.4)',
    },
    {
      num: '05',
      title: 'Citizen Hazard Geotagging',
      role: 'Public User / Citizen',
      desc: 'Citizens report road potholes or visible concrete fractures with photos; AI instantly estimates cavity severity.',
      bg: 'linear-gradient(135deg, #9a3412 0%, #c2410c 100%)',
      badgeColor: '#fed7aa',
      borderColor: 'rgba(254, 215, 170, 0.4)',
    },
    {
      num: '06',
      title: 'Review & Task Assignment',
      role: 'Municipal Engineer',
      desc: 'Reviews engineering requests and citizen reports, approves work orders, assigns Maintenance Team, and sets deadlines.',
      bg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      badgeColor: '#cbd5e1',
      borderColor: 'rgba(203, 213, 225, 0.4)',
    },
    {
      num: '07',
      title: 'Field Execution & Repairs',
      role: 'Maintenance Team',
      desc: 'Receives assigned task in dashboard, visits physical location, performs inspections, mastic filling, or bearing repair.',
      bg: 'linear-gradient(135deg, #831843 0%, #9d174d 100%)',
      badgeColor: '#fbcfe8',
      borderColor: 'rgba(251, 207, 232, 0.4)',
    },
    {
      num: '08',
      title: 'Evidence Upload & Sign-off',
      role: 'Maintenance Team',
      desc: 'Uploads repair photos, logged materials used, and detailed execution remarks, moving status to Completed.',
      bg: 'linear-gradient(135deg, #115e59 0%, #0f766e 100%)',
      badgeColor: '#99f6e4',
      borderColor: 'rgba(153, 246, 228, 0.4)',
    },
    {
      num: '09',
      title: 'Verification & Loop Closure',
      role: 'Municipal Engineer',
      desc: 'Verifies completed field report and evidence, closes work order, updating official municipal asset health records.',
      bg: 'linear-gradient(135deg, #312e81 0%, #3730a3 100%)',
      badgeColor: '#c7d2fe',
      borderColor: 'rgba(199, 210, 254, 0.4)',
    },
  ];

  // Duplicate for seamless infinite marquee scroll
  const duplicated = [...steps, ...steps];

  return (
    <section
      id="how-it-works"
      style={{
        padding: '5.5rem 0',
        background: 'linear-gradient(145deg, #0a1526 0%, #0f233d 50%, #081220 100%)',
        borderTop: '1px solid rgba(56, 189, 248, 0.15)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto 2.5rem auto',
          padding: '0 2rem',
          textAlign: 'center',
        }}
      >
        <span
          className="section-tag"
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '4px 14px',
            borderRadius: '9999px',
          }}
        >
          THE COMPLETE MUNICIPAL LIFECYCLE
        </span>
        <h2 className="section-title" style={{ color: '#ffffff', marginTop: '0.6rem' }}>
          From Sensor Telemetry to Verified Field Repair
        </h2>
        <p className="section-desc" style={{ color: '#94a3b8' }}>
          Hover over any card to pause and inspect. InfraMind AI enforces strict separation of responsibilities
          across all 5 municipal roles so nothing falls through bureaucratic cracks.
        </p>
      </div>

      <div className="marquee-container">
        <div className="marquee-track">
          {duplicated.map((item, index) => (
            <div
              key={index}
              className="marquee-card"
              style={{
                background: item.bg,
                border: `1.5px solid ${item.borderColor}`,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="marquee-step" style={{ color: item.badgeColor }}>
                  STEP {item.num}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.18)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {item.role}
                </span>
              </div>
              <h4 className="marquee-title" style={{ color: '#ffffff', marginTop: '0.4rem' }}>
                {item.title}
              </h4>
              <p className="marquee-text" style={{ color: '#e2e8f0' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
