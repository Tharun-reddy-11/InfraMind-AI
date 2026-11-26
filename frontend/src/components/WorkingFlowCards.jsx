import React from 'react';

export default function WorkingFlowCards() {
  const cards = [
    {
      step: '1',
      title: 'Bridge Structural Health & Risk Assessment',
      desc: 'Trained on 1,600+ National Bridge Inventory records. Analyzes deck, superstructure, substructure ratings and traffic load velocity to predict structural degradation.',
      image: '/cards/infra_card_4.png',
    },
    {
      step: '2',
      title: 'Displacement Telemetry & Anomaly Analysis',
      desc: 'Harmonic thermal compensation models separate normal expansion cycles from genuine structural foundation settlement and critical girder deflection.',
      image: '/cards/infra_card_3.png',
    },
    {
      step: '3',
      title: 'Concrete Crack & Surface Defect Vision',
      desc: 'Computer vision algorithms detect structural shear fissures, surface micro-cracks, and estimate crack widths under civil engineering safety standards.',
      image: '/cards/infra_card_6.png',
    },
    {
      step: '4',
      title: 'Roadway Hazard & Pothole Classifier',
      desc: 'Automated road hazard detection classifies severity, cavity depth, and calculates Pavement Condition Index deductions from site photographic evidence.',
      image: '/cards/infra_card_1.png',
    },
    {
      step: '5',
      title: 'Municipal Maintenance Dispatch & Proof Verification',
      desc: 'Closed-loop municipal workflow where Municipal Officers review reports, assign field maintenance crews with deadlines, and verify resolved repair photos.',
      image: '/cards/infra_card_8.png',
    },
    {
      step: '6',
      title: 'Public Infrastructure Reporting & Cartography',
      desc: 'Empowers citizens to pinpoint road hazards and visible infrastructure issues on interactive municipal maps with instant status notifications.',
      image: '/cards/infra_card_7.png',
    },
  ];

  return (
    <section id="features" className="workflow-section">
      <div className="section-head">
        <span className="section-tag">ENGINEERED FOR MUNICIPAL RESILIENCE</span>
        <h2 className="section-title">Operational Features That Protect City Infrastructure</h2>
        <p className="section-desc">
          InfraMind AI replaces fragmented spreadsheets with an interconnected,
          evidence-driven municipal platform connecting asset registration, predictive risk analysis, and field repair execution.
        </p>
      </div>

      <div className="workflow-grid">
        {cards.map((card, idx) => (
          <div key={idx} className="workflow-card" tabIndex={0}>
            <img
              src={card.image}
              alt={card.title}
              className="workflow-card-bg"
              onError={(e) => {
                e.target.src = '/cards/infra_card_1.png';
              }}
            />
            <div className="workflow-card-overlay" />
            <div className="workflow-card-content">
              <span className="workflow-card-step">{card.step}</span>
              <h3 className="workflow-card-title">{card.title}</h3>
              <p className="workflow-card-desc">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
