import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../audio/soundEffects';
import { Sparkles, Moon } from 'lucide-react';

export default function IntroGate({ isRevealed, onRevealed }) {
  const [pipVisible, setPipVisible] = useState(false);
  const [dialogue, setDialogue] = useState("Peek-a-boo! 🌙 Hiii! Wanna know more? Click me!");
  const [isWaving, setIsWaving] = useState(false);
  const [showClickHint, setShowClickHint] = useState(false);
  const [bobbing, setBobbing] = useState(false);

  useEffect(() => {
    // Pip floats up from the bottom after 450ms
    const timer = setTimeout(() => {
      setPipVisible(true);
      // Play baby welcome voice "Hiii!" when Pip appears
      setTimeout(() => {
        sound.playBabyWelcome();
      }, 600);
    }, 450);

    // Show click hint after 2.5s
    const hintTimer = setTimeout(() => {
      setShowClickHint(true);
    }, 2500);

    // Play "click me!" baby sound after hint appears
    const clickMeTimer = setTimeout(() => {
      sound.playBabyClickMe();
    }, 3000);

    // Repeated gentle bob + sound every 8s to remind user
    const bouncePing = setInterval(() => {
      setBobbing(true);
      sound.playBabyClickMe();
      setTimeout(() => setBobbing(false), 800);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hintTimer);
      clearTimeout(clickMeTimer);
      clearInterval(bouncePing);
    };
  }, []);

  const handleReveal = () => {
    sound.playBabyGiggle();
    setIsWaving(true);
    setDialogue("Yay!! Hehehe~ Welcome to my dream world! ✨");

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#ffd166', '#ff99c8', '#a34063', '#a9def9', '#fff8f1'],
      });
    } catch (e) {}

    setTimeout(() => onRevealed(), 1100);
  };

  if (isRevealed) return null;

  return (
    <div
      className="intro-overlay"
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
        padding: '20px',
      }}
    >
      {/* Background Stars */}
      <div className="intro-stars" aria-hidden="true">
        <span className="star-twinkle s-1">✦</span>
        <span className="star-twinkle s-2">★</span>
        <span className="star-twinkle s-3">✧</span>
        <span className="star-twinkle s-4">⋆</span>
        <span className="star-twinkle s-5">♡</span>
      </div>

      {/* Pip entrance container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
          transform: pipVisible ? 'translateY(0) scale(1)' : 'translateY(110vh) scale(0.8)',
          opacity: pipVisible ? 1 : 0,
          transition: 'transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease',
        }}
      >
        {/* Speech Bubble */}
        <div
          className={`pip-speech-bubble ${showClickHint ? 'bubble-pulse' : ''}`}
          style={{
            background: 'rgba(255, 248, 241, 0.96)',
            color: '#5c4033',
            padding: '14px 22px',
            borderRadius: '24px',
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 'clamp(15px, 4vw, 18px)',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.35), 0 0 20px rgba(255,209,102,0.4)',
            border: '2.5px solid #ffd166',
            marginBottom: '18px',
            position: 'relative',
            animation: 'gentleFloat 3s ease-in-out infinite',
            maxWidth: '340px',
          }}
        >
          <span>{dialogue}</span>
          {/* Bubble tail */}
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '12px solid #ffd166',
          }} />
        </div>

        {/* Pip Avatar */}
        <div
          onClick={handleReveal}
          onMouseEnter={() => sound.playBabyClickMe()}
          onTouchStart={() => sound.playBabyClickMe()}
          style={{
            cursor: 'pointer',
            filter: 'drop-shadow(0 15px 35px rgba(255,179,71,0.45))',
            animation: isWaving
              ? 'celebrateBounce 0.5s ease-in-out 2'
              : bobbing
              ? 'celebrateBounce 0.6s ease-in-out 1'
              : 'cloudSway 4s ease-in-out infinite alternate',
            position: 'relative',
            WebkitTapHighlightColor: 'transparent',
          }}
          role="button"
          tabIndex={0}
          aria-label="Click Pip to enter the portfolio"
          onKeyDown={(e) => e.key === 'Enter' && handleReveal()}
        >
          <img
            src="/pip_avatar_cloud.png"
            alt="Pip the Skull Baby sitting on a cloud waving"
            style={{
              width: '100%',
              maxWidth: 'clamp(200px, 60vw, 320px)',
              height: 'auto',
              display: 'block',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
          {/* Glowing amber eyes */}
          <div style={{
            position: 'absolute', top: '39%', left: '42.5%',
            width: '10px', height: '10px',
            background: '#ffeaa7', borderRadius: '50%',
            boxShadow: '0 0 14px 5px #ffd166, 0 0 25px 8px #ff9f43',
            animation: 'eyePulse 2.5s infinite alternate',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '37.5%', left: '58.5%',
            width: '10px', height: '10px',
            background: '#ffeaa7', borderRadius: '50%',
            boxShadow: '0 0 14px 5px #ffd166, 0 0 25px 8px #ff9f43',
            animation: 'eyePulse 2.5s infinite alternate 0.4s',
            pointerEvents: 'none',
          }} />

          {/* Click hint bounce arrow */}
          {showClickHint && (
            <div style={{
              position: 'absolute',
              bottom: '-46px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#ffd166',
              fontSize: '28px',
              animation: 'bounceArrow 1s ease-in-out infinite',
            }} aria-hidden="true">
              ↑
            </div>
          )}
        </div>

        {/* "Who am I?" Button */}
        <button
          type="button"
          id="who-am-i-btn"
          onClick={handleReveal}
          onMouseEnter={() => sound.playBabyClickMe()}
          onTouchStart={() => sound.playBabyClickMe()}
          style={{
            marginTop: '40px',
            background: 'linear-gradient(135deg, #a34063 0%, #e2829d 100%)',
            color: '#fff',
            border: '2.5px solid #fff8f1',
            borderRadius: '999px',
            padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 42px)',
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: 700,
            fontFamily: "'Fredoka', sans-serif",
            letterSpacing: '0.04em',
            boxShadow: '0 10px 30px rgba(163,64,99,0.5), 0 0 25px rgba(255,209,102,0.4)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
            outline: 'none',
            animation: 'buttonPulse 2.2s infinite',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <Sparkles size={20} />
          <span>Who am I? (Meet Pip!)</span>
          <Moon size={18} />
        </button>

        <p style={{
          marginTop: '14px',
          color: 'rgba(255,248,241,0.65)',
          fontSize: 'clamp(11px, 3vw, 13px)',
          fontFamily: "'Outfit', sans-serif",
        }}>
          ✨ Tap / click to unlock Pip's dream portfolio!
        </p>
      </div>
    </div>
  );
}
