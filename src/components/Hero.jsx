import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../audio/soundEffects';
import { Sparkles, Moon, Heart, Compass, Volume2, Stars, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Hero({ onTriggerEasterEgg, onReplayIntro }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isNodding, setIsNodding] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // 3D Tilt calculation
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const cardX = rect.left + rect.width / 2;
        const cardY = rect.top + rect.height / 2;
        const dx = (e.clientX - cardX) / (window.innerWidth / 2);
        const dy = (e.clientY - cardY) / (window.innerHeight / 2);

        setTilt({
          x: Math.max(Math.min(-dy * 12, 12), -12),
          y: Math.max(Math.min(dx * 12, 12), -12),
        });

        // Eye tracking (subtle pupil shift inside sockets)
        setEyeOffset({
          x: Math.max(Math.min(dx * 5, 5), -5),
          y: Math.max(Math.min(dy * 5, 5), -5),
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePipClick = () => {
    sound.playChime(1.2);
    setIsNodding(true);
    setTimeout(() => setIsNodding(false), 800);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ffd166', '#ff99c8', '#a34063'],
      });
    } catch (e) {}
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-container">
        {/* Left Column: Character Bio & Credentials */}
        <div className="hero-bio-col animate-scroll-up">
          <div className="hero-badge">
            <Sparkles size={15} className="accent-icon" />
            <span>Midnight Nursery · Track 1 Canon</span>
            <span className="badge-dot" />
            <span>haX.baby</span>
          </div>

          <h1 className="hero-title">
            Meet <span className="highlight-berry">Pip</span>, the Sleepy Skull Baby
          </h1>

          <p className="hero-subtitle">
            “I build the dreams you fall asleep inside.”
          </p>

          <p className="hero-description">
            A gentle little creature with a smooth round skull face, glowing warm
            amber pinpricks in soft eye sockets, a tiny crooked smile, and a starry
            nightcap with a pink bow. Pip works at the Midnight Nursery designing
            soothing lullabies, glowing lanterns, and bedtime flight paths for sleepy
            creatures worldwide.
          </p>

          {/* Character Quick Traits */}
          <div className="traits-grid">
            <div className="trait-pill">
              <span className="trait-emoji">💀</span>
              <div>
                <strong>Species</strong>
                <span>Skull Baby (Gentle & Cozy)</span>
              </div>
            </div>
            <div className="trait-pill">
              <span className="trait-emoji">🌙</span>
              <div>
                <strong>Profession</strong>
                <span>Junior Dream Engineer</span>
              </div>
            </div>
            <div className="trait-pill">
              <span className="trait-emoji">✨</span>
              <div>
                <strong>Quirks</strong>
                <span>Sleepy, Giggles, Hates Silence</span>
              </div>
            </div>
            <div className="trait-pill">
              <span className="trait-emoji">🎀</span>
              <div>
                <strong>Attire</strong>
                <span>Star Nightcap & Bow</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="hero-actions">
            <a
              href="#lullaby-lab"
              className="btn-primary"
              onClick={() => sound.playPop()}
            >
              <Volume2 size={18} />
              <span>Listen to Lullaby Lab</span>
            </a>
            <a
              href="#projects"
              className="btn-secondary"
              onClick={() => sound.playPop()}
            >
              <Compass size={18} />
              <span>View 5 Showcase Inventions</span>
            </a>
            <button
              type="button"
              className="btn-text-replay"
              onClick={onReplayIntro}
              title="Watch Pip float up from the bottom again"
            >
              ↺ Replay Entrance
            </button>
          </div>
        </div>

        {/* Right Column: 3D Interactive Pip Character Card */}
        <div className="hero-card-col animate-scroll-up" style={{ animationDelay: '0.2s' }}>
          <div
            ref={cardRef}
            className={`pip-3d-card ${isNodding ? 'pip-nod' : ''}`}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            onClick={handlePipClick}
            title="Click Pip for a gentle giggle & stardust!"
          >
            {/* Card Floating Glow & Accents */}
            <div className="card-glow" />
            <div className="card-halo-stars">
              <span className="halo-star h1">✦</span>
              <span className="halo-star h2">★</span>
              <span className="halo-star h3">✧</span>
            </div>

            {/* Official Pip Avatar Cloud Render */}
            <div className="pip-character-stage">
              <img
                src="/pip_avatar_cloud.png"
                alt="Pip the Skull Baby floating peacefully on a cloud"
                className="pip-render-img"
                draggable={false}
              />

              {/* Interactive Eye Tracking Amber Glow Pinpricks */}
              <div
                className="eye-pupil eye-left"
                style={{
                  transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                }}
              />
              <div
                className="eye-pupil eye-right"
                style={{
                  transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                }}
              />

              {/* Secret Easter Egg Click Spot on Nightcap Bow! */}
              <button
                type="button"
                className="secret-star-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerEasterEgg();
                }}
                title="Secret Star! Click me for an Easter egg!"
                aria-label="Secret star Easter egg trigger"
              >
                ★
              </button>
            </div>

            {/* Interactive Card Footer Badge */}
            <div className="card-footer-ribbon">
              <div className="status-indicator">
                <span className="status-ping" />
                <span>Status: Currently Dreaming (92% Deep Sleep)</span>
              </div>
              <p className="card-hint">
                <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Move mouse to tilt 3D card & guide Pip's eyes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
