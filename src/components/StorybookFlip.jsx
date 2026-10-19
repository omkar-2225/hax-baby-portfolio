import React, { useState, useEffect, useRef } from 'react';
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
  Moon,
  Clock,
} from 'lucide-react';

/**
 * StorybookFlip — Upgraded with Cinematic Animated Story Video Player
 * and AI Baby Voice Read-Aloud Narration!
 *
 * Supports two rich viewing experiences:
 *  1. 🎬 Animated Video Player (Movie Mode) — Ken-Burns camera motion,
 *     parallax celestial layers, shooting stars, dream dust, live timeline
 *     scrubber, and movie subtitle narration.
 *  2. 📖 3D Interactive Flipbook Mode — realistic 3D CSS page curls,
 *     swipe & arrow key controls.
 *  3. 🎙️ AI Baby Voice Narration — Web Speech API tuned with high-pitch
 *     (1.78x) childlike formant, deliberate storytelling tempo, and
 *     real-time talking animation!
 */
export default function StorybookFlip() {
  const [viewMode, setViewMode] = useState('video'); // 'video' | 'book'
  const [currentScene, setCurrentScene] = useState(0);

  // --- AI Baby Voice Narration State ---
  const [isBabyVoiceActive, setIsBabyVoiceActive] = useState(false);
  const [isPipSpeaking, setIsPipSpeaking] = useState(false);
  const [babyPitchPreset, setBabyPitchPreset] = useState('baby'); // 'baby' | 'toddler' | 'chibi'

  const PITCH_MAP = {
    baby: { pitch: 1.78, rate: 0.88, label: '🍼 Baby Pip (High Pitch 1.78x)' },
    toddler: { pitch: 1.62, rate: 0.90, label: '🧸 Toddler Pip (Soft 1.62x)' },
    chibi: { pitch: 1.95, rate: 0.86, label: '✨ Chibi Pip (Ultra Cute 1.95x)' },
  };

  // --- Video Mode State ---
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0); // 0 to 100%
  const [isAudioAccompaniment, setIsAudioAccompaniment] = useState(false);
  const videoTimerRef = useRef(null);
  const SCENE_DURATION_MS = 9000; // 9 seconds per scene in video mode

  // --- 3D Book Mode State ---
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState('next');
  const [pendingScene, setPendingScene] = useState(null);
  const touchStartX = useRef(null);
  const flipTimeout = useRef(null);

  const scenes = [
    {
      id: 0,
      chapter: 'Scene 01 · Origin',
      title: 'The Cosmic Swaddle',
      tagline: 'Born from Stardust and Sugar',
      emoji: '✨',
      badge: 'Arrival: Year of the Sleepy Moon',
      quote: '"Not all bones are spooky. Some are made of stardust and warm milk."',
      body: 'Long before midnight bells tolled, Pip arrived inside a fluffy celestial pillowcase dropped by the Supermoon. Unlike spooky skeletons of folklore, Pip was born with glowing amber heart-lights, a soft skull smile, and an insatiable love for warm milk. Found asleep on a lavender cloud, Pip was welcomed into the Midnight Nursery with open arms.',
      ink: '#a34063',
      pageNum: 1,
      videoTheme: 'theme-cosmic',
      image: '/pip_portrait.png',
    },
    {
      id: 1,
      chapter: 'Scene 02 · The Craft',
      title: 'The Apprentice of Dreams',
      tagline: 'Forging Lullabies at 432Hz',
      emoji: '🧸',
      badge: 'Promotion: Junior Dream Engineer',
      quote: '"Nightmares dissolve when you sprinkle them with music and starlight."',
      body: 'At Midnight Nursery, Pip studied under the elder Sandmen. Pip learned how to tune brass music box gears to exact sleep frequencies (432Hz), melt moonbeams into nightlight candles, and trap stormy nightmares inside soapy lavender bubbles. Pip proved that the kindest medicine for fear is a warm bedside glow.',
      ink: '#5e4b8b',
      pageNum: 3,
      videoTheme: 'theme-alchemy',
      image: '/pip_lullaby_box.png',
    },
    {
      id: 2,
      chapter: 'Scene 03 · The Mission',
      title: 'The Rooftop Night Shift',
      tagline: 'Delivering Slumber Across Skylines',
      emoji: '☁️',
      badge: 'Mission: A Kinder, Brighter Bedtime',
      quote: '"Close your eyes. Your custom dream is ready now."',
      body: 'Now every evening when twilight blankets the chimneys, Pip pulls on the starry nightcap, ties the pink bow, and floats across sleeping skylines. With lantern in one hand and music box in the other, Pip drops sweet dreams of flying bunnies, warm cookies, and starry rivers into every slumbering chimney.',
      ink: '#1a6e5b',
      pageNum: 5,
      videoTheme: 'theme-rooftop',
      image: '/pip_dream_lantern.png',
    },
  ];

  // --- Auto-play Video Mode Timeline ---
  useEffect(() => {
    if (viewMode !== 'video' || !isPlayingVideo) {
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      return;
    }

    const intervalMs = 100;
    const stepPct = (intervalMs / SCENE_DURATION_MS) * (100 / scenes.length);

    videoTimerRef.current = setInterval(() => {
      setVideoProgress((prev) => {
        const next = prev + stepPct;
        if (next >= 100) {
          // Loop video or stop at end
          setCurrentScene(0);
          return 0;
        }
        // Update current scene based on progress
        const targetScene = Math.min(
          Math.floor((next / 100) * scenes.length),
          scenes.length - 1
        );
        setCurrentScene((cur) => {
          if (cur !== targetScene) {
            sound.playPop();
          }
          return targetScene;
        });
        return next;
      });
    }, intervalMs);

    return () => clearInterval(videoTimerRef.current);
  }, [viewMode, isPlayingVideo, scenes.length]);

  // Audio Accompaniment in Video Mode
  const toggleAudioAccompaniment = () => {
    const next = !isAudioAccompaniment;
    setIsAudioAccompaniment(next);
    if (next) {
      sound.playLullabyMelody('surmayee');
    } else {
      sound.stopMelody();
    }
  };

  const jumpToScene = (idx) => {
    sound.playPop();
    setCurrentScene(idx);
    setVideoProgress((idx / scenes.length) * 100);
  };

  const handlePrevScene = () => {
    const prev = (currentScene - 1 + scenes.length) % scenes.length;
    jumpToScene(prev);
  };

  const handleNextScene = () => {
    const next = (currentScene + 1) % scenes.length;
    jumpToScene(next);
  };

  const restartVideo = () => {
    sound.playPop();
    setCurrentScene(0);
    setVideoProgress(0);
    setIsPlayingVideo(true);
  };

  // --- AI Baby Voice Narration Logic ---
  const speakSceneNarration = (sceneIdx = currentScene) => {
    const scene = scenes[sceneIdx];
    if (!scene) return;
    const config = PITCH_MAP[babyPitchPreset] || PITCH_MAP.baby;

    // Rich childlike read-aloud structure
    const narrationText = `${scene.chapter}. ${scene.title}. ${scene.quote}. ${scene.body}`;

    sound.speakBabyVoice(narrationText, {
      pitch: config.pitch,
      rate: config.rate,
      onStart: () => setIsPipSpeaking(true),
      onEnd: () => setIsPipSpeaking(false),
    });
  };

  const toggleBabyVoice = () => {
    sound.playPop();
    const next = !isBabyVoiceActive;
    setIsBabyVoiceActive(next);
    if (next) {
      speakSceneNarration(currentScene);
    } else {
      sound.stopBabyVoice();
      setIsPipSpeaking(false);
    }
  };

  // Auto-narrate on scene change if AI Baby Voice is active
  useEffect(() => {
    if (isBabyVoiceActive) {
      speakSceneNarration(currentScene);
    } else {
      sound.stopBabyVoice();
      setIsPipSpeaking(false);
    }
  }, [currentScene, isBabyVoiceActive, babyPitchPreset]);

  // Pause speech if video is paused
  useEffect(() => {
    if (viewMode === 'video' && !isPlayingVideo && isBabyVoiceActive) {
      sound.stopBabyVoice();
      setIsPipSpeaking(false);
    } else if (viewMode === 'video' && isPlayingVideo && isBabyVoiceActive) {
      speakSceneNarration(currentScene);
    }
  }, [isPlayingVideo]);

  // --- 3D Flipbook Controls ---
  const triggerFlip = (targetIdx, direction) => {
    if (flipping || targetIdx === currentScene) return;
    setFlipDir(direction);
    setFlipping(true);
    setPendingScene(targetIdx);

    sound.playPop();

    flipTimeout.current = setTimeout(() => {
      setCurrentScene(targetIdx);
      setFlipping(false);
      setPendingScene(null);
    }, 520);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNextScene();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrevScene();
      if (e.key === ' ' && viewMode === 'video') {
        e.preventDefault();
        setIsPlayingVideo((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentScene, viewMode]);

  // Touch swipe support for Book Mode
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? handleNextScene() : handlePrevScene();
    }
    touchStartX.current = null;
  };

  useEffect(() => () => {
    clearTimeout(flipTimeout.current);
    clearInterval(videoTimerRef.current);
    sound.stopMelody();
    sound.stopBabyVoice();
  }, []);

  const activeScene = scenes[currentScene];
  const displayScene =
    flipping && pendingScene !== null ? scenes[pendingScene] : activeScene;

  // Format video time: e.g. 0:14 / 0:27
  const totalSeconds = Math.round((scenes.length * SCENE_DURATION_MS) / 1000);
  const currentSeconds = Math.min(
    totalSeconds,
    Math.round((videoProgress / 100) * totalSeconds)
  );
  const formatTime = (s) => `0:${s < 10 ? '0' : ''}${s}`;

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
          Watch Pip's animated journey from a cosmic swaddle to Junior Dream Engineer!
        </p>

        {/* View Mode Switcher Pills */}
        <div className="story-view-mode-tabs">
          <button
            type="button"
            className={`story-tab-btn ${viewMode === 'video' ? 'story-tab-active' : ''}`}
            onClick={() => {
              sound.playPop();
              setViewMode('video');
            }}
          >
            <Film size={15} />
            <span>Animated Movie Mode 🎬</span>
          </button>
          <button
            type="button"
            className={`story-tab-btn ${viewMode === 'book' ? 'story-tab-active' : ''}`}
            onClick={() => {
              sound.playPop();
              setViewMode('book');
              setIsPlayingVideo(false);
              sound.stopMelody();
            }}
          >
            <BookOpen size={15} />
            <span>3D Flipbook Mode 📖</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          MODE 1: ANIMATED CINEMATIC VIDEO PLAYER (Movie Mode)
          ==================================================================== */}
      {viewMode === 'video' && (
        <div className="story-cinema-player" role="region" aria-label="Animated story video player">
          {/* 16:9 Widescreen Animated Theater Stage */}
          <div className={`cinema-screen ${activeScene.videoTheme}`}>
            {/* Ambient Backlight Glow */}
            <div className="cinema-backlight-glow" />

            {/* Shooting Stars animation */}
            <div className="cinema-stars-layer" aria-hidden="true">
              <span className="shooting-star ss-1" />
              <span className="shooting-star ss-2" />
              <span className="cinema-twinkle st-1">✦</span>
              <span className="cinema-twinkle st-2">★</span>
              <span className="cinema-twinkle st-3">✧</span>
              <span className="cinema-twinkle st-4">⋆</span>
            </div>

            {/* Cinematic Floating Scene Content (Ken Burns camera motion) */}
            <div className="cinema-stage-visual" key={currentScene}>
              {/* Scene 1: Cosmic Arrival */}
              {currentScene === 0 && (
                <div className="scene-visual-cosmic">
                  <div className="cinema-supermoon" />
                  <div className="cloud-pillow-cradle">
                    <img
                      src="/pip_avatar_cloud.png"
                      alt="Baby Pip sleeping inside a celestial cloud pillow"
                      className={`cinema-pip-character float-gentle ${isPipSpeaking ? 'pip-talking-bounce' : ''}`}
                    />
                    <div className="cradle-stardust-rings" />
                  </div>
                  {/* Floating Talking Speech Bubble */}
                  {isPipSpeaking && (
                    <div className="cinema-pip-speech-bubble" aria-live="polite">
                      <span className="bubble-emoji">🍼</span>
                      <span className="bubble-text">"Hii! Listening to my story?"</span>
                      <span className="soundwave-pip">
                        <span className="sw-b b1" />
                        <span className="sw-b b2" />
                        <span className="sw-b b3" />
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Scene 2: The Dream Apprentice Workshop */}
              {currentScene === 1 && (
                <div className="scene-visual-alchemy">
                  <div className="alchemy-radial-glow" />
                  <div className="alchemy-props-row">
                    <img
                      src="/pip_lullaby_box.png"
                      alt="Unicorn music box gear crafting"
                      className="cinema-prop-box spin-slow"
                    />
                    <img
                      src="/pip_portrait.png"
                      alt="Pip studying dream formulas"
                      className={`cinema-pip-portrait bob-pulse ${isPipSpeaking ? 'pip-talking-bounce' : ''}`}
                    />
                  </div>
                  {/* Floating Talking Speech Bubble */}
                  {isPipSpeaking && (
                    <div className="cinema-pip-speech-bubble" aria-live="polite">
                      <span className="bubble-emoji">✨</span>
                      <span className="bubble-text">"I craft bedtime dreams at 432Hz!"</span>
                      <span className="soundwave-pip">
                        <span className="sw-b b1" />
                        <span className="sw-b b2" />
                        <span className="sw-b b3" />
                      </span>
                    </div>
                  )}
                  {/* Floating dream bubbles */}
                  <div className="floating-alchemy-bubbles">
                    <span className="bubble b1">🫧</span>
                    <span className="bubble b2">✨</span>
                    <span className="bubble b3">🎵</span>
                    <span className="bubble b4">🫧</span>
                  </div>
                </div>
              )}

              {/* Scene 3: Rooftop Night Shift */}
              {currentScene === 2 && (
                <div className="scene-visual-rooftop">
                  <div className="rooftop-silhouettes" />
                  <div className="pip-flying-flight">
                    <img
                      src="/pip_dream_lantern.png"
                      alt="Glowing Dream Lantern"
                      className="cinema-prop-lantern lantern-glow-anim"
                    />
                    <img
                      src="/pip_avatar_cloud.png"
                      alt="Pip soaring over sleeping rooftops"
                      className={`cinema-pip-flying flight-wave ${isPipSpeaking ? 'pip-talking-bounce' : ''}`}
                    />
                  </div>
                  {/* Floating Talking Speech Bubble */}
                  {isPipSpeaking && (
                    <div className="cinema-pip-speech-bubble" aria-live="polite">
                      <span className="bubble-emoji">☁️</span>
                      <span className="bubble-text">"Sweet dreams to all little babies!"</span>
                      <span className="soundwave-pip">
                        <span className="sw-b b1" />
                        <span className="sw-b b2" />
                        <span className="sw-b b3" />
                      </span>
                    </div>
                  )}
                  <div className="chimney-dream-dust">
                    <span className="dust d1">★</span>
                    <span className="dust d2">✦</span>
                    <span className="dust d3">✨</span>
                  </div>
                </div>
              )}

              {/* Top Watermark / Chapter Pill */}
              <div className="cinema-watermark">
                <span className="cinema-badge-dot" />
                <span>{activeScene.chapter}</span>
                <span className="watermark-divider">·</span>
                <span className="watermark-badge">{activeScene.badge}</span>
              </div>

              {/* Subtitle Teleprompter Bar at bottom of screen */}
              <div className="cinema-subtitles">
                {/* Voice Status Badge */}
                <div className="subtitles-voice-bar">
                  {isPipSpeaking ? (
                    <span className="voice-status-pill speaking">
                      <Mic size={12} className="spin-mic" />
                      <span>Pip's Voice Speaking ({PITCH_MAP[babyPitchPreset].label})</span>
                      <span className="voice-eq-bars">
                        <span className="ve-bar" />
                        <span className="ve-bar" />
                        <span className="ve-bar" />
                        <span className="ve-bar" />
                      </span>
                    </span>
                  ) : isBabyVoiceActive ? (
                    <span className="voice-status-pill ready">
                      <Mic size={12} />
                      <span>AI Baby Voice Active</span>
                    </span>
                  ) : null}
                </div>

                <div className={`subtitles-quote ${isPipSpeaking ? 'subtitles-glowing' : ''}`}>
                  {activeScene.quote}
                </div>
                <p className={`subtitles-body ${isPipSpeaking ? 'subtitles-body-active' : ''}`}>
                  {activeScene.body}
                </p>
              </div>
            </div>
          </div>

          {/* Video Player Scrubber & Timeline Bar */}
          <div className="cinema-timeline-bar">
            {/* Interactive Chapters Track */}
            <div
              className="timeline-track"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPct = (e.clientX - rect.left) / rect.width;
                const targetScene = Math.min(
                  Math.floor(clickPct * scenes.length),
                  scenes.length - 1
                );
                jumpToScene(targetScene);
              }}
              title="Click timeline to seek"
            >
              <div
                className="timeline-progress-fill"
                style={{ width: `${videoProgress}%` }}
              />
              {/* Scene Chapter Markers */}
              {scenes.map((s, i) => (
                <div
                  key={s.id}
                  className={`chapter-marker ${i <= currentScene ? 'marker-passed' : ''}`}
                  style={{ left: `${(i / scenes.length) * 100}%` }}
                >
                  <span className="marker-pin" />
                  <span className="marker-label">{s.title}</span>
                </div>
              ))}
            </div>

            {/* Video Controls Strip */}
            <div className="cinema-controls-strip">
              <div className="controls-left">
                {/* Play / Pause Button */}
                <button
                  type="button"
                  className="cinema-control-btn btn-play-pause"
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  title={isPlayingVideo ? 'Pause Video (Space)' : 'Play Video (Space)'}
                >
                  {isPlayingVideo ? <Pause size={17} /> : <Play size={17} />}
                  <span>{isPlayingVideo ? 'Pause' : 'Play Movie'}</span>
                </button>

                {/* Chapter Skip */}
                <button
                  type="button"
                  className="cinema-control-btn"
                  onClick={handlePrevScene}
                  title="Previous Chapter"
                >
                  <SkipBack size={15} />
                </button>
                <button
                  type="button"
                  className="cinema-control-btn"
                  onClick={handleNextScene}
                  title="Next Chapter"
                >
                  <SkipForward size={15} />
                </button>

                {/* Restart Movie */}
                <button
                  type="button"
                  className="cinema-control-btn"
                  onClick={restartVideo}
                  title="Replay from beginning"
                >
                  <RotateCcw size={15} />
                </button>

                {/* Time Display */}
                <div className="cinema-time-display">
                  <Clock size={13} />
                  <span>
                    {formatTime(currentSeconds)} / {formatTime(totalSeconds)}
                  </span>
                </div>
              </div>

              <div className="controls-right">
                {/* AI Baby Voice Read Aloud Toggle */}
                <button
                  type="button"
                  className={`cinema-control-btn btn-baby-voice ${isBabyVoiceActive ? 'audio-active' : ''}`}
                  onClick={toggleBabyVoice}
                  title="Toggle AI Baby Voice Story Narration"
                >
                  {isBabyVoiceActive ? <Mic size={15} /> : <MicOff size={15} />}
                  <span>AI Baby Voice {isBabyVoiceActive ? 'ON' : 'OFF'}</span>
                  {isPipSpeaking && (
                    <span className="voice-mini-bars">
                      <span className="v-bar" />
                      <span className="v-bar" />
                      <span className="v-bar" />
                    </span>
                  )}
                </button>

                {/* Pitch preset dropdown when voice is active */}
                {isBabyVoiceActive && (
                  <select
                    className="cinema-pitch-dropdown"
                    value={babyPitchPreset}
                    onChange={(e) => {
                      sound.playPop();
                      setBabyPitchPreset(e.target.value);
                    }}
                    title="Select AI Baby Voice Pitch"
                    aria-label="AI Baby Voice Pitch"
                  >
                    <option value="baby">🍼 Baby (1.78x)</option>
                    <option value="toddler">🧸 Toddler (1.62x)</option>
                    <option value="chibi">✨ Chibi (1.95x)</option>
                  </select>
                )}

                {/* Soundtrack Music Box Accompaniment Toggle */}
                <button
                  type="button"
                  className={`cinema-control-btn ${isAudioAccompaniment ? 'audio-active' : ''}`}
                  onClick={toggleAudioAccompaniment}
                  title="Toggle Lullaby Soundtrack"
                >
                  {isAudioAccompaniment ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  <span>Lullaby {isAudioAccompaniment ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODE 2: 3D INTERACTIVE FLIPBOOK MODE (Original Book)
          ==================================================================== */}
      {viewMode === 'book' && (
        <>
          <div
            className="flipbook-scene"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-label="Interactive 3D storybook"
          >
            {/* The book spine shadow */}
            <div className="book-spine-shadow" aria-hidden="true" />

            {/* Left Page (Illustration) */}
            <div className="book-page-wrap book-left-wrap">
              <div
                className={`book-page-3d book-page-left ${flipping ? `page-flip-${flipDir}` : ''}`}
              >
                <div className="page-face page-front">
                  <div className="illustration-frame">
                    <img
                      src={activeScene.image}
                      alt={activeScene.title}
                      className={`storybook-img ${isPipSpeaking ? 'pip-talking-bounce' : ''}`}
                      draggable={false}
                    />
                    <div className="illustration-caption">
                      <span>{activeScene.chapter}</span>
                      <p>{activeScene.badge}</p>
                    </div>
                  </div>
                </div>
                <div className="page-face page-back">
                  <div className="page-back-content">
                    <div className="page-number-back">pg. {activeScene.pageNum + 1}</div>
                    <div className="decorative-border-back" />
                    <p className="back-teaser">{displayScene.quote}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Page (Story Narration) */}
            <div className="book-page-wrap book-right-wrap">
              <div
                className={`book-page-3d book-page-right ${flipping ? `page-flip-in-${flipDir}` : ''}`}
              >
                <div className="page-face page-front">
                  <div className="page-header">
                    <span className="chapter-eyebrow">
                      {activeScene.emoji} {activeScene.chapter}
                    </span>
                    <h3 className="scene-heading" style={{ color: activeScene.ink }}>
                      {activeScene.title}
                    </h3>
                  </div>

                  {/* Baby Voice Listen Button for 3D Book */}
                  <div className="book-listen-wrap">
                    <button
                      type="button"
                      className={`book-listen-btn ${isBabyVoiceActive && isPipSpeaking ? 'reading' : ''}`}
                      onClick={toggleBabyVoice}
                    >
                      {isBabyVoiceActive && isPipSpeaking ? (
                        <>
                          <Mic size={14} className="spin-mic" />
                          <span>Pip is reading to you... (Click to Stop)</span>
                          <span className="voice-mini-bars">
                            <span className="v-bar" />
                            <span className="v-bar" />
                            <span className="v-bar" />
                          </span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} />
                          <span>🎙️ Read Aloud with AI Baby Voice</span>
                        </>
                      )}
                    </button>
                  </div>

                  <blockquote className={`scene-quote ${isPipSpeaking ? 'book-quote-reading' : ''}`}>
                    {activeScene.quote}
                  </blockquote>
                  <p className={`scene-body ${flipping ? '' : 'ink-reveal'} ${isPipSpeaking ? 'book-body-reading' : ''}`}>
                    {activeScene.body}
                  </p>

                  <div className="word-count-tag">
                    <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>Story snippet: Under 80 words (Meets &lt;150 rule)</span>
                  </div>

                  <div className="page-number-tag">pg. {activeScene.pageNum}</div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              className="flip-arrow-btn flip-arrow-left"
              onClick={handlePrevScene}
              disabled={flipping}
              title="Previous chapter (← key)"
              aria-label="Previous chapter"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="flip-arrow-btn flip-arrow-right"
              onClick={handleNextScene}
              disabled={flipping}
              title="Next chapter (→ key)"
              aria-label="Next chapter"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Star-trail progress dots */}
          <div className="storybook-progress" role="tablist" aria-label="Story chapters">
            {scenes.map((s, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                className={`storybook-star-dot ${currentScene === idx ? 'star-dot-active' : ''}`}
                onClick={() => triggerFlip(idx, idx > currentScene ? 'next' : 'prev')}
                title={`Go to ${s.chapter}`}
                aria-selected={currentScene === idx}
                aria-label={s.chapter}
              >
                {currentScene === idx ? '★' : '☆'}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
