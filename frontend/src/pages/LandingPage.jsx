import React from 'react';
import Navbar from '../components/Navbar';
import VideoHero from '../components/VideoHero';
import WorkingFlowCards from '../components/WorkingFlowCards';
import HowItWorksMarquee from '../components/HowItWorksMarquee';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <VideoHero />
        <WorkingFlowCards />
        <HowItWorksMarquee />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}
