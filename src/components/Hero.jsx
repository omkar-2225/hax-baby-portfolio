import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../audio/soundEffects';
import { Sparkles, Moon, Heart, Compass, Volume2, Box, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import ThreePipCharacter from './ThreePipCharacter';
import VisitorMemoryBadge from './VisitorMemoryBadge';

export default function Hero({ onTriggerEasterEgg, onReplayIntro, isNight = true }) {
  const cardRef = useRef(null);
  const [characterMode, setCharacterMode] = useState('3d-model'); // '3d-model' | '3d-video' | '2d'
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isNodding, setIsNodding] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // 3D Tilt calculation for 2D mode fallback
      if (cardRef.current && characterMode === '2d') {
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
  }, [characterMode]);

  const handlePipClick = () => {
    sound.playBabyGiggle();
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
        {/* Left Column: Character Bio, Memory Badge & Credentials */}
        <div className="hero-bio-col animate-scroll-up">
          {/* Visitor Memory Badge (Tier 3 Legendary: Character remembers visitor) */}
          <VisitorMemoryBadge />

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

        {/* Right Column: Character Stage (Interactive 3D WebGL vs Storybook Portrait) */}
        <div className="hero-floating-pip-col animate-scroll-up" style={{ animationDelay: '0.2s' }}>
          {/* Unified Hero Model Segmented Control (Bug 2: Rebuilt clean control, min 44px targets) */}
          <div className="hero-segmented-control-wrap" role="toolbar" aria-label="Pip character view options">
            <div className="hero-segmented-control">
              <button
                type="button"
                className={`segmented-tab-btn ${characterMode === '3d-model' ? 'tab-active' : ''}`}
                onClick={() => {
                  sound.playPop();
                  setCharacterMode('3d-model');
                }}
                aria-pressed={characterMode === '3d-model'}
                title="Rotate and inspect Pip in full 3D (360°)"
              >
                <Box size={15} />
                <span>3D Model</span>
              </button>

              <button
                type="button"
                className={`segmented-tab-btn ${characterMode === '3d-video' ? 'tab-active' : ''}`}
                onClick={() => {
                  sound.playPop();
                  setCharacterMode('3d-video');
                }}
                aria-pressed={characterMode === '3d-video'}
                title="Watch Pip's live 3D animation video"
              >
                <Sparkles size={15} />
                <span>Live 3D Video</span>
              </button>

              <button
                type="button"
                className={`segmented-tab-btn ${characterMode === '2d' ? 'tab-active' : ''}`}
                onClick={() => {
                  sound.playPop();
                  setCharacterMode('2d');
                }}
                aria-pressed={characterMode === '2d'}
                title="Switch to storybook illustrated portrait"
              >
                <ImageIcon size={15} />
                <span>Portrait Art</span>
              </button>

              <button
                type="button"
                className="segmented-tab-btn btn-poke-giggle"
                onClick={handlePipClick}
                title="Poke Pip to giggle and toss star confetti!"
                aria-label="Poke Pip to giggle"
              >
                <Heart size={15} className="heart-icon-beat" />
                <span>Poke to Giggle ✨</span>
              </button>
            </div>
          </div>

          {/* 3D WebGL / Live Video Three.js Model View */}
          {characterMode === '3d-model' || characterMode === '3d-video' ? (
            <ThreePipCharacter
              viewMode={characterMode === '3d-video' ? 'video' : 'model'}
              isNight={isNight}
              onPipTickle={handlePipClick}
            />
          ) : (
            /* 2D Storybook Floating Stage with Parallax Tilt */
            <div
              ref={cardRef}
              className={`floating-pip-stage ${isNodding ? 'pip-nod' : ''}`}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              onClick={handlePipClick}
              title="Click Pip for a gentle giggle & stardust!"
              role="button"
              tabIndex={0}
              aria-label="Interactive floating Pip character"
              onKeyDown={(e) => e.key === 'Enter' && handlePipClick()}
            >
              {/* Ambient Aura Halo behind Pip */}
              <div className="pip-halo-aura" aria-hidden="true" />

              {/* Orbiting Stardust Stars */}
              <div className="pip-orbit-stars" aria-hidden="true">
                <span className="orbit-star os-1">✦</span>
                <span className="orbit-star os-2">★</span>
                <span className="orbit-star os-3">✧</span>
                <span className="orbit-star os-4">⋆</span>
                <span className="orbit-star os-5">♡</span>
              </div>

              {/* Cute Floating Thought / Poke Bubble */}
              <div className="pip-thought-bubble">
                <Sparkles size={14} style={{ color: '#ffd166' }} />
                <span>Poke me to giggle! ✨</span>
              </div>

              {/* Pip Character Render & Eyes */}
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

              {/* Breathing Cloud Shadow Underneath */}
              <div className="pip-cloud-shadow" aria-hidden="true" />

              {/* Floating Status Pill */}
              <div className="pip-floating-status">
                <span className="status-ping" />
                <span>Currently Dreaming · 92% Deep Sleep</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
