import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../audio/soundEffects';
import {
  BookOpen,
  Film,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

/**
 * StorybookFlip — Tier 2 Feature
 *
 * MODE 1: Animated Movie Mode (Ken-Burns cinematic scenes)
 * MODE 2: TRUE 3D Flipbook — Realistic Flipbook.js-style page-peel:
 *   Pages physically lift from the center spine, curl with a gradient
 *   shadow mid-air (showing the back face / paper texture), then land flat.
 *   Click the folded page corner, use ← → arrows, keyboard, or swipe.
 */
export default function StorybookFlip() {
  const [viewMode, setViewMode] = useState('book'); // 'video' | 'book'
  const [currentPage, setCurrentPage] = useState(0);

  // AI Baby Voice
  const [isBabyVoiceActive, setIsBabyVoiceActive] = useState(false);
  const [isPipSpeaking, setIsPipSpeaking] = useState(false);
  const [babyPitchPreset, setBabyPitchPreset] = useState('baby');
  const PITCH_MAP = {
    baby:    { pitch: 1.78, rate: 0.88, label: '🍼 Baby Pip (1.78x)' },
    toddler: { pitch: 1.62, rate: 0.90, label: '🧸 Toddler Pip (1.62x)' },
    chibi:   { pitch: 1.95, rate: 0.86, label: '✨ Chibi Pip (1.95x)' },
  };

  // Video mode
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [videoProgress, setVideoProgress]   = useState(0);
  const [isAudioAccompaniment, setIsAudioAccompaniment] = useState(false);
  const videoTimerRef = useRef(null);
  const SCENE_DURATION_MS = 9000;

  // Flipbook state
  const [flipState, setFlipState] = useState(null); // null | { dir, phase, fromPage }
  const [hoverCorner, setHoverCorner] = useState(null); // 'next' | 'prev'
  const flipTimerRef  = useRef(null);
  const touchStartX   = useRef(null);
  const isFlipping    = flipState !== null;

  const pages = [
    {
      id: 0, chapter: 'Scene 01 · Origin', title: 'The Cosmic Swaddle',
      tagline: 'Born from Stardust and Sugar', emoji: '✨',
      badge: 'Arrival: Year of the Sleepy Moon',
      quote: '"Not all bones are spooky. Some are made of stardust and warm milk."',
      body: 'Long before midnight bells tolled, Pip arrived inside a fluffy celestial pillowcase dropped by the Supermoon. Unlike spooky skeletons of folklore, Pip was born with glowing amber heart-lights, a soft skull smile, and an insatiable love for warm milk. Found asleep on a lavender cloud, Pip was welcomed into the Midnight Nursery with open arms.',
      ink: '#a34063', pageNum: 1, videoTheme: 'theme-cosmic', image: '/pip_portrait.png',
    },
    {
      id: 1, chapter: 'Scene 02 · The Craft', title: 'The Apprentice of Dreams',
      tagline: 'Forging Lullabies at 432Hz', emoji: '🧸',
      badge: 'Promotion: Junior Dream Engineer',
      quote: '"Nightmares dissolve when you sprinkle them with music and starlight."',
      body: 'At Midnight Nursery, Pip studied under the elder Sandmen. Pip learned how to tune brass music box gears to exact sleep frequencies (432Hz), melt moonbeams into nightlight candles, and trap stormy nightmares inside soapy lavender bubbles. Pip proved that the kindest medicine for fear is a warm bedside glow.',
      ink: '#5e4b8b', pageNum: 3, videoTheme: 'theme-alchemy', image: '/pip_lullaby_box.png',
    },
    {
      id: 2, chapter: 'Scene 03 · The Mission', title: 'The Rooftop Night Shift',
      tagline: 'Delivering Slumber Across Skylines', emoji: '☁️',
      badge: 'Mission: A Kinder, Brighter Bedtime',
      quote: '"Close your eyes. Your custom dream is ready now."',
      body: 'Now every evening when twilight blankets the chimneys, Pip pulls on the starry nightcap, ties the pink bow, and floats across sleeping skylines. With lantern in one hand and music box in the other, Pip drops sweet dreams of flying bunnies, warm cookies, and starry rivers into every slumbering chimney.',
      ink: '#1a6e5b', pageNum: 5, videoTheme: 'theme-rooftop', image: '/pip_dream_lantern.png',
    },
  ];

  const totalPages = pages.length;

  // ── Flip ────────────────────────────────────────────────────────────────
  const triggerFlip = useCallback((dir) => {
    if (isFlipping) return;
    const next = dir === 'next'
      ? Math.min(currentPage + 1, totalPages - 1)
      : Math.max(currentPage - 1, 0);
    if (next === currentPage) return;
    sound.playPop();
    setFlipState({ dir, phase: 'peel', fromPage: currentPage });
    flipTimerRef.current = setTimeout(() => {
      setCurrentPage(next);
      setFlipState(prev => prev ? { ...prev, phase: 'land' } : null);
    }, 280);
    setTimeout(() => setFlipState(null), 580);
  }, [isFlipping, currentPage, totalPages]);

  const goNext = useCallback(() => triggerFlip('next'), [triggerFlip]);
  const goPrev = useCallback(() => triggerFlip('prev'), [triggerFlip]);
  const goTo   = useCallback((idx) => {
    if (idx === currentPage || isFlipping) return;
    triggerFlip(idx > currentPage ? 'next' : 'prev');
  }, [currentPage, isFlipping, triggerFlip]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (viewMode !== 'book') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, viewMode]);

  // Touch
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 44) { dx < 0 ? goNext() : goPrev(); }
    touchStartX.current = null;
  };

  // Video
  useEffect(() => {
    if (viewMode !== 'video' || !isPlayingVideo) { clearInterval(videoTimerRef.current); return; }
    const step = (100 / (SCENE_DURATION_MS / 100)) / pages.length;
    videoTimerRef.current = setInterval(() => {
      setVideoProgress(prev => {
        const next = prev + step;
        if (next >= 100) { setCurrentPage(0); return 0; }
        const ts = Math.min(Math.floor((next / 100) * pages.length), pages.length - 1);
        setCurrentPage(cur => { if (cur !== ts) sound.playPop(); return ts; });
        return next;
      });
    }, 100);
    return () => clearInterval(videoTimerRef.current);
  }, [viewMode, isPlayingVideo, pages.length]);

  const toggleAudio = () => {
    const n = !isAudioAccompaniment;
    setIsAudioAccompaniment(n);
    n ? sound.playLullabyMelody() : sound.stopMelody();
  };
  const jumpScene = (i) => { sound.playPop(); setCurrentPage(i); setVideoProgress((i / pages.length) * 100); };

  // AI voice
  const stopSpeech = () => { try { window.speechSynthesis?.cancel(); } catch {} setIsPipSpeaking(false); };
  const speakScene = (idx = currentPage) => {
    const p = pages[idx];
    if (!p) return;
    const cfg = PITCH_MAP[babyPitchPreset] || PITCH_MAP.baby;
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(`${p.chapter}. ${p.title}. ${p.quote}. ${p.body}`);
      u.pitch = cfg.pitch; u.rate = cfg.rate;
      u.onstart = () => setIsPipSpeaking(true);
      u.onend   = () => setIsPipSpeaking(false);
      u.onerror = () => setIsPipSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch {}
  };
  const toggleBabyVoice = () => {
    sound.playPop();
    const n = !isBabyVoiceActive;
    setIsBabyVoiceActive(n);
    if (n) speakScene(currentPage); else stopSpeech();
  };
  useEffect(() => { if (isBabyVoiceActive) speakScene(currentPage); else stopSpeech(); }, [currentPage, isBabyVoiceActive, babyPitchPreset]);
  useEffect(() => () => { clearTimeout(flipTimerRef.current); clearInterval(videoTimerRef.current); sound.stopMelody(); stopSpeech(); }, []);

  const scene = pages[currentPage];
  const fmt = (s) => `0:${s < 10 ? '0' : ''}${s}`;
  const totalSec = Math.round((pages.length * SCENE_DURATION_MS) / 1000);
  const curSec   = Math.min(totalSec, Math.round((videoProgress / 100) * totalSec));

  return (
    <section id="story" className="story-section">
      <div className="section-header-wrap">
        <div className="pill-badge">
          <BookOpen size={14} />
          <span>Section 03 · Pip's Bedtime Origin</span>
        </div>
        <h2 className="section-title">
          The Origin Story of <span className="highlight-berry">Pip</span>
        </h2>
        <p className="section-subtitle">
          Turn the pages of Pip's journey from a cosmic swaddle to Junior Dream Engineer.
        </p>
        <div className="story-view-mode-tabs">
          <button type="button" className={`story-tab-btn ${viewMode === 'video' ? 'story-tab-active' : ''}`}
            onClick={() => { sound.playPop(); setViewMode('video'); }}>
            <Film size={15} /><span>Animated Movie 🎬</span>
          </button>
          <button type="button" className={`story-tab-btn ${viewMode === 'book' ? 'story-tab-active' : ''}`}
            onClick={() => { sound.playPop(); setViewMode('book'); setIsPlayingVideo(false); sound.stopMelody(); }}>
            <BookOpen size={15} /><span>3D Flipbook 📖</span>
          </button>
        </div>
      </div>

      {/* ── MOVIE MODE ─────────────────────────────────────────────────── */}
      {viewMode === 'video' && (
        <div className="story-cinema-player" role="region" aria-label="Animated story video player">
          <div className={`cinema-screen ${scene.videoTheme}`}>
            <div className="cinema-backlight-glow" />
            <div className="cinema-stars-layer" aria-hidden="true">
              <span className="shooting-star ss-1" /><span className="shooting-star ss-2" />
              <span className="cinema-twinkle st-1">✦</span><span className="cinema-twinkle st-2">★</span>
              <span className="cinema-twinkle st-3">✧</span><span className="cinema-twinkle st-4">⋆</span>
            </div>
            <div className="cinema-stage-visual" key={currentPage}>
              {currentPage === 0 && (
                <div className="scene-visual-cosmic">
                  <div className="cinema-supermoon" />
                  <div className="cloud-pillow-cradle">
                    <img src="/pip_avatar_cloud.png" alt="Baby Pip on cloud" className={`cinema-pip-character float-gentle ${isPipSpeaking ? 'pip-talking-bounce' : ''}`} />
                    <div className="cradle-stardust-rings" />
                  </div>
                  {isPipSpeaking && <div className="cinema-pip-speech-bubble" aria-live="polite"><span className="bubble-emoji">🍼</span><span className="bubble-text">"Hii! Listening to my story?"</span><span className="soundwave-pip"><span className="sw-b b1" /><span className="sw-b b2" /><span className="sw-b b3" /></span></div>}
                </div>
              )}
              {currentPage === 1 && (
                <div className="scene-visual-alchemy">
                  <div className="alchemy-radial-glow" />
                  <div className="alchemy-props-row">
                    <img src="/pip_lullaby_box.png" alt="Music box" className="cinema-prop-box spin-slow" />
                    <img src="/pip_portrait.png" alt="Pip studying" className={`cinema-pip-portrait bob-pulse ${isPipSpeaking ? 'pip-talking-bounce' : ''}`} />
                  </div>
                  {isPipSpeaking && <div className="cinema-pip-speech-bubble" aria-live="polite"><span className="bubble-emoji">✨</span><span className="bubble-text">"I craft bedtime dreams at 432Hz!"</span><span className="soundwave-pip"><span className="sw-b b1" /><span className="sw-b b2" /><span className="sw-b b3" /></span></div>}
                  <div className="floating-alchemy-bubbles"><span className="bubble b1">🫧</span><span className="bubble b2">✨</span><span className="bubble b3">🎵</span><span className="bubble b4">🫧</span></div>
                </div>
              )}
              {currentPage === 2 && (
                <div className="scene-visual-rooftop">
                  <div className="rooftop-silhouettes" />
                  <div className="pip-flying-flight">
                    <img src="/pip_dream_lantern.png" alt="Dream Lantern" className="cinema-prop-lantern lantern-glow-anim" />
                    <img src="/pip_avatar_cloud.png" alt="Pip flying" className={`cinema-pip-flying flight-wave ${isPipSpeaking ? 'pip-talking-bounce' : ''}`} />
                  </div>
                  {isPipSpeaking && <div className="cinema-pip-speech-bubble" aria-live="polite"><span className="bubble-emoji">☁️</span><span className="bubble-text">"Sweet dreams to all little babies!"</span><span className="soundwave-pip"><span className="sw-b b1" /><span className="sw-b b2" /><span className="sw-b b3" /></span></div>}
                  <div className="chimney-dream-dust"><span className="dust d1">★</span><span className="dust d2">✦</span><span className="dust d3">✨</span></div>
                </div>
              )}
              <div className="cinema-watermark">
                <span className="cinema-badge-dot" /><span>{scene.chapter}</span>
                <span className="watermark-divider">·</span><span className="watermark-badge">{scene.badge}</span>
              </div>
              <div className="cinema-subtitles">
                <div className="subtitles-voice-bar">
                  {isPipSpeaking ? (
                    <span className="voice-status-pill speaking"><Mic size={12} className="spin-mic" /><span>Pip Speaking ({PITCH_MAP[babyPitchPreset].label})</span><span className="voice-eq-bars"><span className="ve-bar" /><span className="ve-bar" /><span className="ve-bar" /><span className="ve-bar" /></span></span>
                  ) : isBabyVoiceActive ? (
                    <span className="voice-status-pill ready"><Mic size={12} /><span>AI Baby Voice Active</span></span>
                  ) : null}
                </div>
                <div className={`subtitles-quote ${isPipSpeaking ? 'subtitles-glowing' : ''}`}>{scene.quote}</div>
                <p className={`subtitles-body ${isPipSpeaking ? 'subtitles-body-active' : ''}`}>{scene.body}</p>
              </div>
            </div>
          </div>
          <div className="cinema-timeline-bar">
            <div className="timeline-track" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); jumpScene(Math.min(Math.floor(((e.clientX - r.left) / r.width) * pages.length), pages.length - 1)); }} title="Click to seek">
              <div className="timeline-progress-fill" style={{ width: `${videoProgress}%` }} />
              {pages.map((s, i) => (
                <div key={s.id} className={`chapter-marker ${i <= currentPage ? 'marker-passed' : ''}`} style={{ left: `${(i / pages.length) * 100}%` }}>
                  <span className="marker-pin" /><span className="marker-label">{s.title}</span>
                </div>
              ))}
            </div>
            <div className="cinema-controls-strip">
              <div className="controls-left">
                <button type="button" className="cinema-control-btn btn-play-pause" onClick={() => setIsPlayingVideo(v => !v)}>
                  {isPlayingVideo ? <Pause size={17} /> : <Play size={17} />}<span>{isPlayingVideo ? 'Pause' : 'Play'}</span>
                </button>
                <button type="button" className="cinema-control-btn" onClick={() => jumpScene((currentPage - 1 + pages.length) % pages.length)}><SkipBack size={15} /></button>
                <button type="button" className="cinema-control-btn" onClick={() => jumpScene((currentPage + 1) % pages.length)}><SkipForward size={15} /></button>
                <button type="button" className="cinema-control-btn" onClick={() => { sound.playPop(); setCurrentPage(0); setVideoProgress(0); setIsPlayingVideo(true); }}><RotateCcw size={15} /></button>
                <div className="cinema-time-display"><Clock size={13} /><span>{fmt(curSec)} / {fmt(totalSec)}</span></div>
              </div>
              <div className="controls-right">
                <button type="button" className={`cinema-control-btn btn-baby-voice ${isBabyVoiceActive ? 'audio-active' : ''}`} onClick={toggleBabyVoice}>
                  {isBabyVoiceActive ? <Mic size={15} /> : <MicOff size={15} />}
                  <span>AI Voice {isBabyVoiceActive ? 'ON' : 'OFF'}</span>
                  {isPipSpeaking && <span className="voice-mini-bars"><span className="v-bar" /><span className="v-bar" /><span className="v-bar" /></span>}
                </button>
                {isBabyVoiceActive && (
                  <select className="cinema-pitch-dropdown" value={babyPitchPreset} onChange={(e) => { sound.playPop(); setBabyPitchPreset(e.target.value); }}>
                    <option value="baby">🍼 Baby (1.78x)</option>
                    <option value="toddler">🧸 Toddler (1.62x)</option>
                    <option value="chibi">✨ Chibi (1.95x)</option>
                  </select>
                )}
                <button type="button" className={`cinema-control-btn ${isAudioAccompaniment ? 'audio-active' : ''}`} onClick={toggleAudio}>
                  {isAudioAccompaniment ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  <span>Lullaby {isAudioAccompaniment ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3D FLIPBOOK ──────────────────────────────────────────────────── */}
      {viewMode === 'book' && (
        <>
          <div
            className="fb-world"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="region"
            aria-label="Interactive 3D storybook — use arrow keys or click corners to flip"
          >
            {/* Outer nav arrows */}
            <button type="button" className="fb-nav fb-nav-left"
              onClick={goPrev} disabled={isFlipping || currentPage === 0}
              aria-label="Previous chapter">
              <ChevronLeft size={26} />
            </button>
            <button type="button" className="fb-nav fb-nav-right"
              onClick={goNext} disabled={isFlipping || currentPage === totalPages - 1}
              aria-label="Next chapter">
              <ChevronRight size={26} />
            </button>

            {/* The physical book */}
            <div className="fb-book">

              {/* Drop shadow under book */}
              <div className="fb-book-shadow" aria-hidden="true" />

              {/* ─ BACK COVER & STACK EFFECT ─ */}
              <div className="fb-cover-stack" aria-hidden="true">
                <div className="fb-stack-sheet fb-stack-1" />
                <div className="fb-stack-sheet fb-stack-2" />
                <div className="fb-stack-sheet fb-stack-3" />
              </div>

              {/* ─ LEFT HARD COVER ─ */}
              <div className="fb-hard-cover fb-hard-left" aria-hidden="true">
                <div className="fb-hard-inner">
                  <div className="fb-cover-label">
                    <span className="fb-cover-emoji">📖</span>
                    <span className="fb-cover-title-text">Pip's<br/>Storybook</span>
                    <span className="fb-cover-sub-text">haX.baby</span>
                  </div>
                </div>
              </div>

              {/* ─ RIGHT HARD COVER ─ */}
              <div className="fb-hard-cover fb-hard-right" aria-hidden="true">
                <div className="fb-hard-inner fb-hard-back">
                  <p className="fb-back-quote">"Sleep tight,<br/>dream bright." ✨</p>
                </div>
              </div>

              {/* ─ BOOK SPINE ─ */}
              <div className="fb-spine" aria-hidden="true">
                <span className="fb-spine-title">Pip's Storybook</span>
              </div>

              {/* ─ SPREAD: Left page (illustration) ─ */}
              <div className="fb-page fb-page-l">
                {/* Lined paper texture */}
                <div className="fb-ruled-lines" aria-hidden="true">
                  {[...Array(14)].map((_, i) => <div key={i} className="fb-rule" />)}
                </div>
                <div className="fb-page-inner fb-left-inner">
                  <div className="fb-illus-frame">
                    <img
                      src={scene.image}
                      alt={scene.title}
                      className={`fb-scene-img ${isPipSpeaking ? 'pip-talking-bounce' : ''}`}
                      draggable={false}
                    />
                    <div className="fb-illus-caption">
                      <span className="fb-caption-ch">{scene.chapter}</span>
                      <p className="fb-caption-badge">{scene.badge}</p>
                    </div>
                  </div>
                  <span className="fb-pg-num fb-pg-num-l">pg. {scene.pageNum}</span>
                </div>
                {/* Bottom-left corner curl → previous page */}
                {currentPage > 0 && (
                  <div
                    className={`fb-corner fb-corner-bl ${hoverCorner === 'prev' ? 'fb-corner-hover' : ''}`}
                    onMouseEnter={() => !isFlipping && setHoverCorner('prev')}
                    onMouseLeave={() => setHoverCorner(null)}
                    onClick={goPrev}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && goPrev()}
                    title="Previous page"
                    aria-label="Flip to previous page"
                  >
                    <span className="fb-corner-arrow">‹</span>
                  </div>
                )}
              </div>

              {/* ─ SPREAD: Right page (text) ─ */}
              <div className="fb-page fb-page-r">
                <div className="fb-ruled-lines" aria-hidden="true">
                  {[...Array(14)].map((_, i) => <div key={i} className="fb-rule" />)}
                </div>
                <div className="fb-page-inner fb-right-inner">
                  {/* AI Voice button */}
                  <button
                    type="button"
                    className={`fb-listen-btn ${isBabyVoiceActive && isPipSpeaking ? 'fb-listen-on' : ''}`}
                    onClick={toggleBabyVoice}
                  >
                    {isBabyVoiceActive && isPipSpeaking
                      ? <><Mic size={12} className="spin-mic" /><span>Pip reading… click to stop</span><span className="voice-mini-bars"><span className="v-bar" /><span className="v-bar" /><span className="v-bar" /></span></>
                      : <><Volume2 size={12} /><span>🎙️ Read Aloud · AI Baby Voice</span></>
                    }
                  </button>

                  <span className="fb-eyebrow">{scene.emoji} {scene.chapter}</span>
                  <h3 className="fb-title" style={{ color: scene.ink }}>{scene.title}</h3>
                  <blockquote className={`fb-quote ${isPipSpeaking ? 'fb-quote-glow' : ''}`} style={{ borderColor: scene.ink }}>
                    {scene.quote}
                  </blockquote>
                  <p className="fb-body ink-reveal">{scene.body}</p>
                  <div className="fb-word-tag">
                    <Sparkles size={11} style={{ display: 'inline', marginRight: 4 }} />
                    Under 80 words (meets &lt;150 rule)
                  </div>
                  <span className="fb-pg-num fb-pg-num-r">pg. {scene.pageNum + 1}</span>
                </div>
                {/* Bottom-right corner curl → next page */}
                {currentPage < totalPages - 1 && (
                  <div
                    className={`fb-corner fb-corner-br ${hoverCorner === 'next' ? 'fb-corner-hover' : ''}`}
                    onMouseEnter={() => !isFlipping && setHoverCorner('next')}
                    onMouseLeave={() => setHoverCorner(null)}
                    onClick={goNext}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && goNext()}
                    title="Next page"
                    aria-label="Flip to next page"
                  >
                    <span className="fb-corner-arrow">›</span>
                  </div>
                )}
              </div>

              {/* ─ FLYING PAGE (the page in mid-air during flip) ─ */}
              {isFlipping && flipState && (
                <div
                  className={`fb-flying ${flipState.dir === 'next' ? 'fb-fly-next' : 'fb-fly-prev'} ${flipState.phase === 'land' ? 'fb-fly-land' : 'fb-fly-peel'}`}
                  aria-hidden="true"
                >
                  {/* Front face of the flying page */}
                  <div className="fb-fly-face fb-fly-face-front">
                    <div className="fb-ruled-lines">
                      {[...Array(14)].map((_, i) => <div key={i} className="fb-rule fb-rule-faded" />)}
                    </div>
                    <div className="fb-fly-content">
                      <span className="fb-fly-ch">{pages[flipState.fromPage]?.chapter}</span>
                      <h4 className="fb-fly-title-sm">{pages[flipState.fromPage]?.title}</h4>
                      <p className="fb-fly-q">{pages[flipState.fromPage]?.quote}</p>
                    </div>
                    {/* Curl shadow gradient — appears on the fold edge */}
                    <div className={`fb-fly-curl-shadow ${flipState.dir === 'next' ? 'shadow-right' : 'shadow-left'}`} />
                  </div>
                  {/* Back face — plain paper texture visible as page arcs overhead */}
                  <div className="fb-fly-face fb-fly-face-back">
                    <div className="fb-back-texture">
                      <div className="fb-ruled-lines">
                        {[...Array(14)].map((_, i) => <div key={i} className="fb-rule fb-rule-faded" />)}
                      </div>
                      <span className="fb-back-watermark">✦</span>
                    </div>
                    <div className={`fb-fly-curl-shadow fb-fly-curl-shadow-back ${flipState.dir === 'next' ? 'shadow-left' : 'shadow-right'}`} />
                  </div>
                </div>
              )}
            </div>{/* /fb-book */}
          </div>{/* /fb-world */}

          {/* Progress & hint */}
          <div className="fb-footer">
            <span className="fb-kbd-hint">
              <kbd className="fb-kbd">←</kbd> prev&nbsp;&nbsp;
              <kbd className="fb-kbd">→</kbd> next &nbsp;·&nbsp; swipe or click page corners
            </span>
            <div className="fb-stars" role="tablist" aria-label="Story chapters">
              {pages.map((p, idx) => (
                <button
                  key={idx} type="button" role="tab"
                  className={`fb-star-dot ${currentPage === idx ? 'fb-star-active' : ''}`}
                  onClick={() => goTo(idx)}
                  aria-selected={currentPage === idx}
                  aria-label={p.chapter}
                  title={p.chapter}
                >
                  {currentPage === idx ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
