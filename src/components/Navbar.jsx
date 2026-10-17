import React, { useState } from 'react';
import { sound } from '../audio/soundEffects';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';

export default function Navbar({
  isNight,
  onToggleNight,
  isMuted,
  onToggleMute,
  sparklesEnabled,
  onToggleSparkles,
  isChaosMode,
  onToggleChaos,
  onReplayIntro,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-container">
        {/* Brand Lockup */}
        <a
          href="#hero"
          className="brand-lockup"
          onClick={() => sound.playPop()}
        >
          <img
            src="/pip_avatar_cloud.png"
            alt="Pip miniature avatar"
            className="brand-pip-thumb"
          />
          <div className="brand-text">
            <span className="brand-title">Pip</span>
            <span className="brand-badge">Dream Engineer</span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <a href="#hero" onClick={() => sound.playPop()}>
            About
          </a>
          <a href="#projects" onClick={() => sound.playPop()}>
            Projects
          </a>
          <a href="#lullaby-lab" onClick={() => sound.playPop()}>
            Lullaby Lab
          </a>
          <a href="#story" onClick={() => sound.playPop()}>
            Origin Story
          </a>
          <a href="#guestbook" onClick={() => sound.playPop()}>
            Guestbook
          </a>
        </nav>

        {/* Control Action Buttons */}
        <div className="nav-actions">
          {/* Mute Toggle (+3 pts Side Quest & Required by Hackathon) */}
          <button
            type="button"
            className={`nav-icon-btn ${isMuted ? 'btn-muted' : 'btn-sound-on'}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label={isMuted ? 'Sound muted. Click to unmute' : 'Sound playing. Click to mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Day / Night Mood Toggle (Tier 1 Requirement) */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={onToggleNight}
            title={isNight ? 'Switch to Morning Nursery Mode' : 'Switch to Midnight Dream Mode'}
            aria-label="Toggle day and night mode"
          >
            {isNight ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Sparkles Cursor Toggle (+2 pts Side Quest) */}
          <button
            type="button"
            className={`nav-icon-btn ${sparklesEnabled ? 'active-sparkle' : ''}`}
            onClick={onToggleSparkles}
            title="Toggle Sparkle Cursor Trail (+2 pts)"
            aria-label="Toggle sparkle cursor trail"
          >
            <Sparkles size={18} />
          </button>

          {/* Retro Chaos Mode (+5 pts Side Quest) */}
          <button
            type="button"
            className={`nav-chaos-btn ${isChaosMode ? 'chaos-active' : ''}`}
            onClick={onToggleChaos}
            title="Toggle Retro Chaos Mode (+5 pts)"
          >
            <Zap size={15} />
            <span>{isChaosMode ? 'Normal Mode' : 'Chaos Mode'}</span>
          </button>

          {/* Replay Intro */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={onReplayIntro}
            title="Replay Pip's Welcome Entrance"
            aria-label="Replay intro animation"
          >
            <RotateCcw size={17} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <a
            href="#hero"
            onClick={() => {
              sound.playPop();
              setMobileMenuOpen(false);
            }}
          >
            About Pip
          </a>
          <a
            href="#projects"
            onClick={() => {
              sound.playPop();
              setMobileMenuOpen(false);
            }}
          >
            Projects
          </a>
          <a
            href="#lullaby-lab"
            onClick={() => {
              sound.playPop();
              setMobileMenuOpen(false);
            }}
          >
            Lullaby Lab
          </a>
          <a
            href="#story"
            onClick={() => {
              sound.playPop();
              setMobileMenuOpen(false);
            }}
          >
            Origin Story
          </a>
          <a
            href="#guestbook"
            onClick={() => {
              sound.playPop();
              setMobileMenuOpen(false);
            }}
          >
            Guestbook
          </a>
        </div>
      )}
    </header>
  );
}
