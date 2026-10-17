import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../audio/soundEffects';
import { Sparkles, Moon, Heart, ChevronDown } from 'lucide-react';

export default function IntroGate({ onRevealed, isRevealed, onReplay }) {
  const [pipVisible, setPipVisible] = useState(false);
  const [dialogue, setDialogue] = useState("Peek-a-boo! 🌙 Yawn... Are you sleepy yet?");
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation: Pip floats up from the bottom after 400ms
    const timer = setTimeout(() => {
      setPipVisible(true);
      sound.playPop();
    }, 450);

    return () => clearTimeout(timer);
  }, [isRevealed]);

  const handleWhoAmIClick = () => {
    sound.playChime(1.15);
    setIsWaving(true);
    setDialogue("Yay! Welcome to Midnight Nursery! Let me show you around... ✨");

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#ffd166', '#ff99c8', '#a34063', '#a9def9', '#fff8f1'],
      });
    } catch (e) {
      // fallback
    }

    setTimeout(() => {
      onRevealed();
    }, 1100);
  };

  if (isRevealed) {
    return null;
  }

  return (
    <div
      className="intro-gate-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at bottom, #1d1538 0%, #0d0a1a 85%)',
        overflow: 'hidden',
        transition: 'opacity 0.8s ease, visibility 0.8s ease',
      }}
    >
      {/* Background dreamy floating clouds */}
      <div className="dream-cloud dream-cloud-1" aria-hidden="true" />
      <div className="dream-cloud dream-cloud-2" aria-hidden="true" />
      <div className="dream-cloud dream-cloud-3" aria-hidden="true" />

      {/* Floating Constellation Stars */}
      <div className="intro-stars" aria-hidden="true">
        <span className="star-twinkle s-1">✦</span>
        <span className="star-twinkle s-2">★</span>
        <span className="star-twinkle s-3">✧</span>
        <span className="star-twinkle s-4">⋆</span>
        <span className="star-twinkle s-5">♡</span>
      </div>

      {/* Center stage container */}
      <div
        className={`pip-entrance-container ${pipVisible ? 'pip-entered' : ''} ${isWaving ? 'pip-celebrating' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '520px',
          width: '90%',
          transform: pipVisible ? 'translateY(0) scale(1)' : 'translateY(110vh) scale(0.8)',
          opacity: pipVisible ? 1 : 0,
          transition: 'transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease',
        }}
      >
        {/* Cute Speech Bubble above Pip */}
        <div
          className="pip-speech-bubble"
          style={{
            background: 'rgba(255, 248, 241, 0.95)',
            color: '#5c4033',
            padding: '14px 24px',
            borderRadius: '24px',
            fontFamily: "'Fredoka', sans-serif",
            fontSize: '18px',
            fontWeight: 500,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35), 0 0 15px rgba(255, 209, 102, 0.3)',
            border: '2px solid #ffd166',
            marginBottom: '20px',
            position: 'relative',
            animation: 'gentleFloat 3s ease-in-out infinite',
          }}
        >
          <span>{dialogue}</span>
          <div
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '12px solid #ffd166',
            }}
          />
        </div>

        {/* Pip Floating Avatar with Glow */}
        <div
          className="pip-avatar-wrapper"
          style={{
            position: 'relative',
            cursor: 'pointer',
            filter: 'drop-shadow(0 15px 35px rgba(255, 179, 71, 0.45))',
            animation: 'cloudSway 4s ease-in-out infinite alternate',
          }}
          onClick={handleWhoAmIClick}
          title="Click Pip or the button below!"
        >
          <img
            src="/pip_avatar_cloud.png"
            alt="Pip the Skull Baby floating on a cloud"
            style={{
              width: '100%',
              maxWidth: '340px',
              height: 'auto',
              display: 'block',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          {/* Glowing amber pinprick eyes animation overlay */}
          <div
            className="pip-glowing-eye pip-eye-left"
            style={{
              position: 'absolute',
              top: '39%',
              left: '42.5%',
              width: '10px',
              height: '10px',
              background: '#ffeaa7',
              borderRadius: '50%',
              boxShadow: '0 0 14px 5px #ffd166, 0 0 25px 8px #ff9f43',
              animation: 'eyePulse 2.5s infinite alternate',
              pointerEvents: 'none',
            }}
          />
          <div
            className="pip-glowing-eye pip-eye-right"
            style={{
              position: 'absolute',
              top: '37.5%',
              left: '58.5%',
              width: '10px',
              height: '10px',
              background: '#ffeaa7',
              borderRadius: '50%',
              boxShadow: '0 0 14px 5px #ffd166, 0 0 25px 8px #ff9f43',
              animation: 'eyePulse 2.5s infinite alternate 0.4s',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* The requested "Who am I?" Button */}
        <button
          type="button"
          id="who-am-i-btn"
          className="who-am-i-btn"
          onClick={handleWhoAmIClick}
          style={{
            marginTop: '28px',
            background: 'linear-gradient(135deg, #a34063 0%, #e2829d 100%)',
            color: '#fff',
            border: '2.5px solid #fff8f1',
            borderRadius: '999px',
            padding: '16px 42px',
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: "'Fredoka', sans-serif",
            letterSpacing: '0.04em',
            boxShadow: '0 10px 30px rgba(163, 64, 99, 0.5), 0 0 25px rgba(255, 209, 102, 0.4)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            outline: 'none',
            animation: 'buttonPulse 2.2s infinite',
          }}
          onMouseEnter={() => sound.playPop()}
        >
          <Sparkles size={22} className="spin-slow" />
          <span>Who am I? (Meet Pip)</span>
          <Moon size={20} />
        </button>

        <p
          style={{
            marginTop: '16px',
            color: 'rgba(255, 248, 241, 0.7)',
            fontSize: '13px',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.05em',
          }}
        >
          ✨ Click to unlock Pip's dream portfolio & story
        </p>
      </div>
    </div>
  );
}
