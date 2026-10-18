import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../audio/soundEffects';
import { Play, Pause, ChevronUp, X, Sparkles, Gamepad2 } from 'lucide-react';

/**
 * DreamCatcherGame — Tier 2 Standout Mini-Game
 *
 * Enhanced with:
 *  - Spacious, high-res canvas (800x480) for generous catch window
 *  - Continuous gameplay: PiP floating dock when scrolled out of view!
 *  - Keyboard support (← / → or A / D keys + Space to pause)
 *  - Full window pointer tracking so basket never gets stuck outside canvas
 *  - Touch-action: none to prevent unwanted mobile page scrolling while swiping
 *  - Live 60fps canvas mirroring into floating dock
 */
export default function DreamCatcherGame() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pipCanvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);

  const [gameState, setGameState] = useState('idle'); // idle | playing | gameover
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [isScrolledOutOfView, setIsScrolledOutOfView] = useState(false);
  const [dockDismissed, setDockDismissed] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('pip_dream_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Generous high-res canvas resolution
  const CANVAS_W = 800;
  const CANVAS_H = 480;

  const DREAM_TYPES = [
    { emoji: '⭐', color: '#ffd166', glow: '#ffd166', isNightmare: false, points: 1 },
    { emoji: '🌙', color: '#c77dff', glow: '#c77dff', isNightmare: false, points: 2 },
    { emoji: '✨', color: '#ff99c8', glow: '#ff99c8', isNightmare: false, points: 1 },
    { emoji: '💤', color: '#4cc9f0', glow: '#4cc9f0', isNightmare: false, points: 3 },
    { emoji: '🌈', color: '#a9def9', glow: '#a9def9', isNightmare: false, points: 5 },
    { emoji: '💀', color: '#333355', glow: '#ff2255', isNightmare: true,  points: -1 },
  ];

  function initState() {
    return {
      basket: { x: CANVAS_W / 2, y: CANVAS_H - 42, w: 110, h: 32 },
      dreams: [],
      particles: [],
      score: 0,
      combo: 0,
      lives: 3,
      spawnTimer: 0,
      spawnInterval: 75,
      speed: 2.0,
      frame: 0,
      running: true,
      paused: false,
    };
  }

  const spawnDream = (state) => {
    const typeWeights = state.score < 10 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5];
    const typeIdx = typeWeights[Math.floor(Math.random() * typeWeights.length)];
    const type = DREAM_TYPES[typeIdx];
    const r = 22 + Math.random() * 12;
    return {
      id: Math.random(),
      x: r + Math.random() * (CANVAS_W - r * 2),
      y: -r * 2,
      r,
      vx: (Math.random() - 0.5) * 1.0,
      vy: state.speed + Math.random() * 1.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.04 + Math.random() * 0.03,
      ...type,
    };
  };

  const spawnParticles = (x, y, color, count = 12) => {
    return Array.from({ length: count }, () => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7 - 2.5,
      r: 3.5 + Math.random() * 4.5,
      life: 1,
      decay: 0.035 + Math.random() * 0.035,
      color,
    }));
  };

  const drawGame = useCallback((ctx, state) => {
    // 1. Background gradient
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bg.addColorStop(0, '#0a0526');
    bg.addColorStop(0.6, '#130a38');
    bg.addColorStop(1, '#1f104d');
    ctx.fillStyle = bg;
    ctx.roundRect(0, 0, CANVAS_W, CANVAS_H, 20);
    ctx.fill();

    // 2. Twinkling background starfield
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 45; i++) {
      const sx = ((i * 79 + state.frame * 0.03 + i * 0.5) * 41) % CANVAS_W;
      const sy = ((i * 57 + 13) * 31) % (CANVAS_H * 0.85);
      const alpha = 0.25 + Math.sin(state.frame * 0.03 + i) * 0.35;
      ctx.globalAlpha = Math.max(0.1, alpha);
      ctx.beginPath();
      ctx.arc(sx, sy, i % 4 === 0 ? 2.5 : 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Falling Dream Bubbles
    state.dreams.forEach((d) => {
      ctx.save();
      ctx.translate(d.x, d.y);

      // Ambient outer glow
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, d.r * 2.3);
      grd.addColorStop(0, d.glow + '77');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, d.r * 2.3, 0, Math.PI * 2);
      ctx.fill();

      // Bubble orb
      ctx.fillStyle = d.color + 'd9';
      ctx.beginPath();
      ctx.arc(0, 0, d.r, 0, Math.PI * 2);
      ctx.fill();

      // Highlight shimmer
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(-d.r * 0.32, -d.r * 0.35, d.r * 0.32, d.r * 0.18, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Centered emoji
      ctx.font = `${d.r * 1.15}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.emoji, 0, 1);
      ctx.restore();
    });

    // 4. Catch particles
    state.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 5. Pip's Dream Net Basket
    const { basket } = state;
    ctx.save();

    // Basket bottom glow
    const basketGlow = ctx.createRadialGradient(basket.x, basket.y, 0, basket.x, basket.y, basket.w * 0.9);
    basketGlow.addColorStop(0, 'rgba(255,209,102,0.35)');
    basketGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = basketGlow;
    ctx.fillRect(basket.x - basket.w, basket.y - basket.h, basket.w * 2, basket.h * 2.8);

    // Basket container
    const grad = ctx.createLinearGradient(basket.x - basket.w / 2, basket.y, basket.x + basket.w / 2, basket.y);
    grad.addColorStop(0, '#ffd166');
    grad.addColorStop(0.5, '#ff99c8');
    grad.addColorStop(1, '#c77dff');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(basket.x - basket.w / 2, basket.y - basket.h / 2, basket.w, basket.h, 14);
    ctx.fill();
    ctx.stroke();

    // Basket decorative tag
    ctx.font = 'bold 13px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Pip's Net 🧺", basket.x, basket.y + 1);
    ctx.restore();

    // 6. HUD / In-game Score
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 16px "Fredoka", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${state.score}`, 18, 30);

    if (state.combo > 1) {
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 15px "Fredoka", sans-serif';
      ctx.fillText(`× ${state.combo} Combo!`, 18, 54);
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff99c8';
    ctx.font = '22px serif';
    ctx.fillText('❤️'.repeat(state.lives), CANVAS_W - 18, 32);

    if (state.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 28px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⏸️ GAME PAUSED', CANVAS_W / 2, CANVAS_H / 2 - 10);
      ctx.font = '16px "Outfit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Press Space or Resume to continue playing', CANVAS_W / 2, CANVAS_H / 2 + 25);
    }
    ctx.restore();
  }, []);

  const startGame = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const state = initState();
    stateRef.current = state;
    setScore(0);
    setCombo(0);
    setLives(3);
    setIsPaused(false);
    setDockDismissed(false);
    setGameState('playing');

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      if (!stateRef.current?.running) return;
      const s = stateRef.current;

      if (!s.paused) {
        s.frame++;

        // Spawn dreams
        s.spawnTimer++;
        if (s.spawnTimer >= s.spawnInterval) {
          s.dreams.push(spawnDream(s));
          s.spawnTimer = 0;
          s.spawnInterval = Math.max(26, 75 - s.score * 1.5);
          s.speed = Math.min(4.8, 2.0 + s.score * 0.07);
        }

        // Update dreams
        s.dreams = s.dreams.filter((d) => {
          d.wobble += d.wobbleSpeed;
          d.x += d.vx + Math.sin(d.wobble) * 0.7;
          d.y += d.vy;

          // Catch collision check
          const bx = s.basket.x;
          const by = s.basket.y - s.basket.h / 2;
          const inX = Math.abs(d.x - bx) < s.basket.w / 2 + d.r * 0.55;
          const inY = d.y + d.r >= by && d.y - d.r <= by + s.basket.h;

          if (inX && inY) {
            if (d.isNightmare) {
              s.lives--;
              s.combo = 0;
              s.particles.push(...spawnParticles(d.x, d.y, '#ff2255', 10));
              sound.playRattle && sound.playRattle();
              setLives(s.lives);
              setCombo(0);
              if (s.lives <= 0) {
                s.running = false;
                setGameState('gameover');
                const hs = Math.max(
                  s.score,
                  parseInt(localStorage.getItem('pip_dream_highscore') || '0', 10)
                );
                localStorage.setItem('pip_dream_highscore', hs.toString());
                setHighScore(hs);
              }
            } else {
              s.combo++;
              const points = d.points * Math.max(1, Math.floor(s.combo / 3));
              s.score += points;
              s.particles.push(...spawnParticles(d.x, d.y, d.color, 14));
              sound.playChime && sound.playChime(0.85 + s.combo * 0.05);
              setScore(s.score);
              setCombo(s.combo);
            }
            return false;
          }

          // Miss off-screen
          if (d.y > CANVAS_H + d.r) {
            if (!d.isNightmare) {
              s.combo = 0;
              setCombo(0);
            }
            return false;
          }
          return true;
        });

        // Update particles
        s.particles = s.particles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.16;
          p.life -= p.decay;
          return p.life > 0;
        });
      }

      // Draw to primary canvas
      drawGame(ctx, s);

      // Real-time mirror into floating Picture-in-Picture canvas
      if (pipCanvasRef.current) {
        const pipCtx = pipCanvasRef.current.getContext('2d');
        pipCtx.drawImage(
          canvas,
          0,
          0,
          pipCanvasRef.current.width,
          pipCanvasRef.current.height
        );
      }

      if (s.running) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  const togglePause = () => {
    if (!stateRef.current || gameState !== 'playing') return;
    const nextPaused = !stateRef.current.paused;
    stateRef.current.paused = nextPaused;
    setIsPaused(nextPaused);
  };

  // Move basket to X
  const moveBasketTo = useCallback((canvasX) => {
    if (stateRef.current) {
      stateRef.current.basket.x = Math.max(55, Math.min(CANVAS_W - 55, canvasX));
    }
  }, []);

  // Main canvas touch and mouse controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getXFromClient = (clientX, targetCanvas) => {
      const rect = targetCanvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      return (clientX - rect.left) * scaleX;
    };

    const onCanvasMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      if (clientX !== undefined) {
        moveBasketTo(getXFromClient(clientX, canvas));
      }
    };

    // Window-level tracking during active play so basket moves even when cursor is on the edges
    const onWindowMove = (e) => {
      if (gameState === 'playing' && canvas) {
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        if (clientX !== undefined) {
          moveBasketTo(getXFromClient(clientX, canvas));
        }
      }
    };

    canvas.addEventListener('mousemove', onCanvasMove);
    canvas.addEventListener('touchmove', onCanvasMove, { passive: true });
    canvas.addEventListener('touchstart', onCanvasMove, { passive: true });
    window.addEventListener('mousemove', onWindowMove, { passive: true });

    return () => {
      canvas.removeEventListener('mousemove', onCanvasMove);
      canvas.removeEventListener('touchmove', onCanvasMove);
      canvas.removeEventListener('touchstart', onCanvasMove);
      window.removeEventListener('mousemove', onWindowMove);
    };
  }, [gameState, moveBasketTo]);

  // Keyboard navigation & spacebar pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || !stateRef.current) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveBasketTo(stateRef.current.basket.x - 28);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveBasketTo(stateRef.current.basket.x + 28);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // IntersectionObserver: Detect when user scrolls away from the game section
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolledOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToGameSection = () => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const showPipDock = gameState === 'playing' && isScrolledOutOfView && !dockDismissed;

  return (
    <div className="dream-game-wrap" ref={containerRef}>
      {/* Top Header Bar */}
      <div className="game-top-bar">
        <div className="game-header">
          <div className="project-badge">
            <Gamepad2 size={15} />
            <span>Mini-Game · Catch Falling Dreams</span>
          </div>
          <h4>Dream Catcher Challenge</h4>
          <p className="subcard-desc">
            Guide Pip's golden net — catch glowing dream bubbles, dodge dark nightmares!
            Continuous arcade play runs seamlessly even while scrolling.
          </p>
        </div>

        <div className="game-controls-row">
          {highScore > 0 && (
            <div className="game-highscore">⭐ High Score: {highScore}</div>
          )}
          {gameState === 'playing' && (
            <button
              type="button"
              className="btn-game-pause"
              onClick={togglePause}
              title="Pause or Resume game (Spacebar)"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Spacious Game Canvas */}
      <div className="game-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas"
          aria-label="Dream Catcher mini-game arena"
        />

        {/* Start Game Overlay */}
        {gameState === 'idle' && (
          <div className="game-overlay">
            <div className="game-overlay-content">
              <div className="game-overlay-icon">🌙</div>
              <h4>Dream Catcher</h4>
              <p>
                Catch glowing dream bubbles with Pip's net!<br />
                Dodge dark nightmare bubbles 💀 · Multipliers boost combos!
              </p>
              <button type="button" className="btn-game-start" onClick={startGame}>
                <Sparkles size={18} style={{ display: 'inline', marginRight: 6 }} />
                <span>Start Catching Dreams</span>
              </button>
              <span className="game-keyboard-hint">
                Controls: Mouse, Touch swipe, or ← → Arrow keys
              </span>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="game-overlay">
            <div className="game-overlay-content">
              <div className="game-overlay-icon">😴</div>
              <h4>Pip fell asleep!</h4>
              <p className="game-final-score">
                You caught <strong>{score}</strong> dreams!
              </p>
              {score >= highScore && score > 0 && (
                <div className="game-new-record">🏆 New High Score!</div>
              )}
              <button type="button" className="btn-game-start" onClick={startGame}>
                ↺ Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Stats Bar */}
      {gameState === 'playing' && (
        <div className="game-live-stats">
          <div className="game-stat">
            <span className="game-stat-label">Score</span>
            <span className="game-stat-value">{score}</span>
          </div>
          {combo > 1 && (
            <div className="game-stat game-combo-stat">
              <span className="game-stat-label">Combo</span>
              <span className="game-stat-value">×{combo}</span>
            </div>
          )}
          <div className="game-stat">
            <span className="game-stat-label">Lives</span>
            <span className="game-stat-value">{'❤️'.repeat(lives)}</span>
          </div>
          <div className="game-stat" style={{ marginLeft: 'auto' }}>
            <span className="game-keyboard-hint">
              💡 Scroll freely — game continues in Picture-in-Picture!
            </span>
          </div>
        </div>
      )}

      {/* ====================================================================
          CONTINUOUS GAMEPLAY: FLOATING PICTURE-IN-PICTURE (PiP) ARCADE DOCK
          Appears in the bottom-right corner when scrolled away while playing!
          ==================================================================== */}
      {showPipDock && (
        <div
          className="game-pip-dock"
          role="region"
          aria-label="Floating Dream Catcher mini-game"
        >
          {/* PiP Header */}
          <div className="pip-dock-header">
            <div className="pip-dock-title">
              <span className="pip-pulse-dot" />
              <span>Pip Arcade (Live)</span>
            </div>
            <div className="pip-dock-actions">
              <button
                type="button"
                className="pip-dock-btn"
                onClick={scrollToGameSection}
                title="Scroll back up to the game section"
              >
                <ChevronUp size={14} />
                <span>Jump</span>
              </button>
              <button
                type="button"
                className="pip-dock-btn"
                onClick={togglePause}
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play size={12} /> : <Pause size={12} />}
              </button>
              <button
                type="button"
                className="pip-dock-btn"
                onClick={() => setDockDismissed(true)}
                title="Minimize floating dock"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* PiP Live Mirrored Canvas */}
          <div
            className="pip-canvas-wrap"
            onClick={scrollToGameSection}
            title="Click to jump back to full game"
          >
            <canvas
              ref={pipCanvasRef}
              width={320}
              height={180}
              className="pip-canvas"
            />
            <div className="pip-dock-hint">
              {isPaused ? '⏸️ Paused' : '⚡ Click to Return'}
            </div>
          </div>

          {/* PiP Live Score Footer */}
          <div className="pip-dock-footer">
            <span className="pip-stat-score">
              Score: <strong>{score}</strong> {combo > 1 && `(×${combo})`}
            </span>
            <span className="pip-stat-lives">{'❤️'.repeat(lives)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
