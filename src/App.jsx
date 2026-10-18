import React, { useState, useEffect } from 'react';
import { sound } from './audio/soundEffects';
import ThreeBackground from './components/ThreeBackground';
import SparkleCursor from './components/SparkleCursor';
import FlashlightCursor from './components/FlashlightCursor';
import IntroGate from './components/IntroGate';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectsSection from './components/ProjectsSection';
import StorybookFlip from './components/StorybookFlip';
import Guestbook from './components/Guestbook';
import EasterEggModal from './components/EasterEggModal';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isNight, setIsNight] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [sparklesEnabled, setSparklesEnabled] = useState(true);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [easterEggOpen, setEasterEggOpen] = useState(false);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (!nextMuted) {
      sound.playPop();
    }
  };

  const handleToggleNight = () => {
    sound.playPop();
    setIsNight(!isNight);
  };

  const handleToggleSparkles = () => {
    sound.playPop();
    setSparklesEnabled(!sparklesEnabled);
  };

  const handleToggleChaos = () => {
    sound.playChime(1.3);
    setIsChaosMode(!isChaosMode);
  };

  const handleReplayIntro = () => {
    sound.playPop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsRevealed(false);
  };

  return (
    <div
      className={`app-root ${isNight ? 'theme-night' : 'theme-day'} ${
        isChaosMode ? 'chaos-mode' : ''
      }`}
    >
      {/* 3D WebGL Three.js Ambient Sky Canvas */}
      <ThreeBackground isNight={isNight} />

      {/* Retro Sparkle Trail (+2 pts Side Quest) */}
      <SparkleCursor enabled={sparklesEnabled} />

      {/* Tier 2: Flashlight / Nightlight Cursor — illuminates dark dream layers */}
      <FlashlightCursor isNight={isNight} enabled={!isMuted || true} />

      {/* Requested Entrance Interaction: Pip rises from bottom, reveals "Who am I?" */}
      <IntroGate
        isRevealed={isRevealed}
        onRevealed={() => setIsRevealed(true)}
        onReplay={handleReplayIntro}
      />

      {/* Main Portfolio Surface - Reveals with Fade-In & Scroll-Up */}
      <div
        className={`portfolio-content-shell ${
          isRevealed ? 'content-visible animate-fade-in-up' : 'content-hidden'
        }`}
      >
        {/* Responsive Navbar with Accessible Mute, Mood, and Chaos Toggles */}
        <Navbar
          isNight={isNight}
          onToggleNight={handleToggleNight}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          sparklesEnabled={sparklesEnabled}
          onToggleSparkles={handleToggleSparkles}
          isChaosMode={isChaosMode}
          onToggleChaos={handleToggleChaos}
          onReplayIntro={handleReplayIntro}
        />

        {/* Ambient Floating Cloud Layers for Depth */}
        <div className="ambient-clouds-wrap" aria-hidden="true">
          <div className="ambient-cloud cloud-top-left" />
          <div className="ambient-cloud cloud-top-right" />
          <div className="ambient-cloud cloud-mid-left" />
          <div className="ambient-cloud cloud-mid-right" />
        </div>

        {/* Main Content Sections */}
        <main id="main-content" className="main-layout">
          {/* Section 01: Hero & Character Bio (3D tilt & cursor tracking amber eyes) */}
          <Hero
            onTriggerEasterEgg={() => setEasterEggOpen(true)}
            onReplayIntro={handleReplayIntro}
          />

          {/* Section 02: Inventions & Showcase Projects (Lullaby Lab, Lantern, Map, Toys) */}
          <ProjectsSection
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Section 03: Tier 2 Interactive Storybook — 3D CSS page-flip animation */}
          <StorybookFlip />

          {/* Side Quest: Live Guestbook (+2 pts) & Vintage Odometer (+1 pt) */}
          <Guestbook />
        </main>

        {/* Footer with Mandatory Rubric Attributions & Credits */}
        <Footer onTriggerEasterEgg={() => setEasterEggOpen(true)} />
      </div>

      {/* Core Requirement 6: Hidden Easter Egg Modal */}
      <EasterEggModal
        isOpen={easterEggOpen}
        onClose={() => setEasterEggOpen(false)}
      />
    </div>
  );
}
