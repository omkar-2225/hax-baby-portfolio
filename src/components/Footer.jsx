import React from 'react';
import { Sparkles, Heart, Moon, ExternalLink, ShieldCheck } from 'lucide-react';
import { sound } from '../audio/soundEffects';

export default function Footer({ onTriggerEasterEgg }) {
  return (
    <footer className="site-footer">
      <div className="footer-cloud-divider" aria-hidden="true" />

      <div className="footer-content-wrap">
        <div className="footer-grid">
          {/* Brand & Mission */}
          <div className="footer-col brand-col">
            <div className="footer-brand-lockup">
              <img
                src="/pip_avatar_cloud.png"
                alt="Pip miniature icon"
                className="footer-pip-icon"
                width="34"
                height="41"
                style={{ objectFit: 'contain' }}
              />
              <span className="footer-brand-title">haX<span className="brand-dot">.baby</span></span>
            </div>
            <p className="footer-tagline">
              “small ideas. brighter beginnings.”
            </p>
            <p className="footer-mission-text">
              Official entry for <strong>Baby’s First Website</strong> 48-Hour Online Hackathon
              (17–19 October 2026). Dedicated to building a kinder, brighter, and cozier web.
            </p>
          </div>

          {/* Track 1 Details */}
          <div className="footer-col">
            <h4 className="footer-heading">Track 1 Canon Spec</h4>
            <ul className="footer-list">
              <li><strong>Character:</strong> Pip the Skull Baby</li>
              <li><strong>Job:</strong> Junior Dream Engineer</li>
              <li><strong>Station:</strong> Midnight Nursery</li>
              <li><strong>Motto:</strong> “I build the dreams you fall asleep inside.”</li>
              <li><strong>Tone:</strong> 100% Gentle & Cute (Never scary or gory)</li>
            </ul>
          </div>

          {/* Mandatory Asset Credits & Open Source Attributions */}
          <div className="footer-col">
            <h4 className="footer-heading">
              <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Credits &amp; Attributions
            </h4>
            <ul className="footer-list">
              <li>
                <strong>Official 3D Assets:</strong> haX.baby Creator Asset Pack (pip_avatar_cloud, pip_lullaby_box, pip_dream_lantern, pip_portrait)
              </li>
              <li>
                <strong>Audio Synth:</strong> Custom Web Audio API Oscillator Matrix (Zero external audio files)
              </li>
              <li>
                <strong>3D WebGL:</strong> Three.js Ambient Particle System
              </li>
              <li>
                <strong>Typography:</strong> Fraunces Serif &amp; Fredoka Variable
              </li>
            </ul>
          </div>

          {/* Quick Links & Easter Egg */}
          <div className="footer-col">
            <h4 className="footer-heading">Event Links</h4>
            <div className="footer-links-stack">
              <a
                href="https://hax.baby/baby-problem"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
                onClick={() => sound.playPop()}
              >
                <span>Official Challenge Brief</span>
                <ExternalLink size={13} />
              </a>
              <a
                href="https://unstop.com/p/babys-first-website-hackathon-hax-baby-1758510"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
                onClick={() => sound.playPop()}
              >
                <span>Unstop Hackathon Listing</span>
                <ExternalLink size={13} />
              </a>
              <button
                type="button"
                className="footer-secret-btn"
                onClick={onTriggerEasterEgg}
              >
                <Sparkles size={14} />
                <span>Wake Pip (Easter Egg)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© 2026 Midnight Nursery · Crafted for haX.baby · May all your little dreams come true ✨</p>
          <div className="footer-badges">
            <span className="footer-pill">Tier 1: Complete</span>
            <span className="footer-pill">Tier 2: Music Box Synth</span>
            <span className="footer-pill">Tier 3: 3D WebGL</span>
            <span className="footer-pill highlight">+13 Bonus Pts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
