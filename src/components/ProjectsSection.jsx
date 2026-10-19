import { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../audio/soundEffects';
import DreamDeliveryMap from './DreamDeliveryMap';
import DreamCatcherGame from './DreamCatcherGame';
import {
  Music,
  Lightbulb,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Square,
  Compass,
} from 'lucide-react';

export default function ProjectsSection({ isMuted, onToggleMute }) {
  // --- Project 1: Lullaby Lab State & Indian Melody Presets ---
  const [isPlayingLullaby, setIsPlayingLullaby] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [selectedMelody, setSelectedMelody] = useState('lalla_lori');

  const lullabyPlaylist = [
    { id: 'lalla_lori', label: 'Lalla Lalla Lori', badge: '🇮🇳 Classic Lori', icon: '🪷' },
    { id: 'bala_jo_jo', label: 'Bala Jo Jo Re', badge: '🇮🇳 Marathi Angai', icon: '👶' },
    { id: 'chanda_mama', label: 'Chanda Mama', badge: '🇮🇳 Playful Lori', icon: '🥣' },
    { id: 'surmayee', label: 'Surmayee Ankhiyon', badge: '🇮🇳 Dreamy Lori', icon: '🌙' },
    { id: 'raag_bhupali', label: 'Raag Bhupali', badge: '🇮🇳 Night Raga', icon: '🪈' },
    { id: 'celestial_box', label: 'Starlight Box', badge: '✨ Western Box', icon: '⭐' },
  ];

  // 8-Note Indian Sargam (Swara) & Western Glockenspiel Keys
  const musicBoxKeys = [
    { sargam: 'Sa', note: 'C5', freq: 523.25, color: '#ffb3ba' },
    { sargam: 'Re', note: 'D5', freq: 587.33, color: '#ffdfba' },
    { sargam: 'Ga', note: 'E5', freq: 659.25, color: '#ffffba' },
    { sargam: 'Ma', note: 'F5', freq: 698.46, color: '#baffc9' },
    { sargam: 'Pa', note: 'G5', freq: 783.99, color: '#bae1ff' },
    { sargam: 'Dha', note: 'A5', freq: 880.00, color: '#e8c5ff' },
    { sargam: 'Ni', note: 'B5', freq: 987.77, color: '#ffd1dc' },
    { sargam: "Sa'", note: 'C6', freq: 1046.50, color: '#fff0f5' },
  ];

  const handleKeyClick = (key) => {
    setActiveNote(key.sargam);
    sound.playMusicBoxNote(key.freq);
    setTimeout(() => setActiveNote(null), 300);
  };

  const playChosenMelody = (melodyId) => {
    setIsPlayingLullaby(true);
    sound.playLullabyMelody(melodyId, (note) => {
      setActiveNote(note);
    });
  };

  const handleSelectMelody = (melodyId) => {
    sound.playPop();
    setSelectedMelody(melodyId);
    if (isPlayingLullaby) {
      playChosenMelody(melodyId);
    }
  };

  const toggleAutoLullaby = () => {
    if (isPlayingLullaby) {
      sound.stopMelody();
      setIsPlayingLullaby(false);
      setActiveNote(null);
    } else {
      playChosenMelody(selectedMelody);
    }
  };

  // Waveform Visualizer — canvas-drawn real-time oscilloscope
  const vizCanvasRef = useRef(null);
  const vizRafRef = useRef(null);
  const vizAnimating = useRef(false);
  const vizPhase = useRef(0);
  const vizTargetNote = useRef(440);

  const drawViz = useCallback(() => {
    const canvas = vizCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!vizAnimating.current) {
      ctx.strokeStyle = 'rgba(163, 64, 99, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      return;
    }

    vizPhase.current += 0.06;
    const speed = vizTargetNote.current / 440;

    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#ff99c8');
    grad.addColorStop(0.5, '#c77dff');
    grad.addColorStop(1, '#ffd166');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#c77dff';

    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const t = x / W;
      const amp = H * 0.38;
      const y = H / 2
        + amp * 0.6 * Math.sin(t * Math.PI * 8 * speed + vizPhase.current)
        + amp * 0.25 * Math.sin(t * Math.PI * 16 * speed + vizPhase.current * 1.3)
        + amp * 0.12 * Math.sin(t * Math.PI * 4 * speed + vizPhase.current * 0.7);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    vizRafRef.current = requestAnimationFrame(drawViz);
  }, []);

  useEffect(() => {
    vizAnimating.current = isPlayingLullaby;
    if (isPlayingLullaby) {
      drawViz();
    } else {
      cancelAnimationFrame(vizRafRef.current);
      drawViz();
    }
  }, [isPlayingLullaby, drawViz]);

  useEffect(() => {
    const noteFreqMap = {
      C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
      A5: 880, C6: 1046.5, D6: 1174.66, E6: 1318.51,
    };
    if (activeNote && noteFreqMap[activeNote]) {
      vizTargetNote.current = noteFreqMap[activeNote];
    }
  }, [activeNote]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(vizRafRef.current);
      sound.stopMelody();
    };
  }, []);

  // --- Project 2: Nightlight Lantern State ---
  const [lanternOn, setLanternOn] = useState(true);
  const [brightness, setBrightness] = useState(85);
  const [lightColor, setLightColor] = useState('#ffd166'); // Amber gold

  const lightPresets = [
    { name: 'Warm Amber', color: '#ffd166' },
    { name: 'Dreamy Lavender', color: '#c77dff' },
    { name: 'Starfall Aqua', color: '#4cc9f0' },
    { name: 'Cotton Candy', color: '#ff85a1' },
  ];


  // --- Project 4: Rattle Toy Blocks State ---
  const [blocks, setBlocks] = useState([
    { id: 1, letter: 'h', color: '#ff99c8', rotation: 0 },
    { id: 2, letter: 'a', color: '#ffd166', rotation: 0 },
    { id: 3, letter: 'X', color: '#a9def9', rotation: 0 },
    { id: 4, letter: '♡', color: '#e2829d', rotation: 0 },
  ]);

  const handleBlockTap = (id) => {
    sound.playRattle();
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, rotation: (b.rotation + 15) % 360 } : b
      )
    );
  };

  return (
    <section id="projects" className="projects-section">
      <div className="section-header-wrap">
        <div className="pill-badge">
          <Sparkles size={14} />
          <span>Section 02 · What Pip Does</span>
        </div>
        <h2 className="section-title">
          Pip's Dream Engineering <span className="highlight-berry">Showcase</span>
        </h2>
        <p className="section-subtitle">
          Explore the official inventions, musical instruments, bedside nightlights,
          and rooftop routes created at Midnight Nursery.
        </p>
      </div>

      <div className="projects-grid">
        {/* ================= PROJECT 1: THE LULLABY LAB ================= */}
        <div id="lullaby-lab" className="project-card highlight-card">
          <div className="project-badge">
            <Music size={15} />
            <span>Showcase 01 · Generative Web Audio API</span>
          </div>

          <div className="project-content-split">
            {/* Asset Image */}
            <div className="project-img-box">
              <img
                src="/pip_lullaby_box.png"
                alt="Pip's Lullaby Music Box with unicorn and golden winding key"
                className={`project-render ${isPlayingLullaby ? 'render-bob' : ''}`}
              />
              {isPlayingLullaby && (
                <div className="floating-music-notes">
                  <span className="floating-note n1">🎵</span>
                  <span className="floating-note n2">🎶</span>
                  <span className="floating-note n3">✨</span>
                </div>
              )}
            </div>

            {/* Interactive Music Box Controls */}
            <div className="project-info">
              <h3 className="project-name">The Lullaby Lab (Unicorn Music Box)</h3>
              <p className="project-desc">
                Pip's proudest musical invention! Synthesizes authentic Indian bedtime loris,
                classical night ragas (Raag Bhupali), and celestial bell chimes using Web Audio API
                oscillators. Select an Indian tune or tap the Indian Sargam keys!
              </p>

              {/* Indian Lullaby & Classical Raga Selector */}
              <div className="lullaby-melody-picker">
                <span className="picker-label">🌙 Choose Bedtime Tune (Indian Loris & Ragas):</span>
                <div className="melody-pills-wrap">
                  {lullabyPlaylist.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`melody-pill-btn ${selectedMelody === m.id ? 'melody-pill-active' : ''}`}
                      onClick={() => handleSelectMelody(m.id)}
                      title={`Select ${m.label}`}
                    >
                      <span className="melody-icon">{m.icon}</span>
                      <span className="melody-title">{m.label}</span>
                      <span className="melody-badge">{m.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Play / Stop Button + Mute Status */}
              <div className="music-box-actions">
                <button
                  type="button"
                  className={`btn-play-melody ${isPlayingLullaby ? 'is-playing' : ''}`}
                  onClick={toggleAutoLullaby}
                >
                  {isPlayingLullaby ? (
                    <>
                      <Square size={16} fill="currentColor" />
                      <span>Stop Lullaby</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" />
                      <span>
                        Play {lullabyPlaylist.find((m) => m.id === selectedMelody)?.label || "Pip's Melody"}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-audio-mute-pill"
                  onClick={onToggleMute}
                  title="Accessible Mute Switch (Required by Hackathon)"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{isMuted ? 'Muted' : 'Sound On'}</span>
                </button>
              </div>

              {/* 8-Note Interactive Glockenspiel Keys with Indian Sargam Swaras */}
              <div className="keys-container">
                <div className="keys-header-row">
                  <span className="keys-label">Tap keys to play chime bells:</span>
                  <span className="keys-badge-sargam">Indian Sargam (Swaras) + Western Pitch</span>
                </div>
                <div className="piano-keys-grid">
                  {musicBoxKeys.map((k) => (
                    <button
                      key={k.note}
                      type="button"
                      className={`chime-key ${
                        activeNote?.includes(k.sargam) || activeNote === k.sargam || activeNote === k.note
                          ? 'key-active'
                          : ''
                      }`}
                      style={{ borderBottomColor: k.color }}
                      onClick={() => handleKeyClick(k)}
                      title={`Play note ${k.sargam} (${k.note} · ${k.freq}Hz)`}
                    >
                      <span className="key-sargam">{k.sargam}</span>
                      <span className="key-name">{k.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier 2: Real-Time Waveform Visualizer */}
              <div className="lullaby-visualizer-wrap">
                <span className="lullaby-visualizer-label">🎵 Live Waveform</span>
                <canvas
                  ref={vizCanvasRef}
                  className="lullaby-visualizer-canvas"
                  width={400}
                  height={56}
                  aria-label="Real-time audio waveform visualizer"
                />
                {activeNote && (
                  <div className="lullaby-active-note-badge" key={activeNote}>
                    <span className="note-badge-dot" />
                    <span>Playing: {activeNote}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= PROJECT 2: NIGHTLIGHT COLLECTION ================= */}
        <div id="nightlight" className="project-card">
          <div className="project-badge">
            <Lightbulb size={15} />
            <span>Showcase 02 · Ambient Lighting & Lanterns</span>
          </div>

          <div className="project-content-split">
            {/* Asset Image with Dynamic Lighting Glow */}
            <div
              className="project-img-box lantern-stage"
              style={{
                boxShadow: lanternOn
                  ? `0 0 ${brightness * 0.8}px ${brightness * 0.3}px ${lightColor}66`
                  : 'none',
              }}
            >
              <img
                src="/pip_dream_lantern.png"
                alt="Dream Nightlight Lantern with smiling sleeping moon"
                className={`project-render ${lanternOn ? 'lantern-active' : 'lantern-dim'}`}
                style={{
                  filter: lanternOn
                    ? `drop-shadow(0 0 ${brightness * 0.35}px ${lightColor}) brightness(${
                        0.7 + (brightness / 100) * 0.5
                      })`
                    : 'grayscale(0.6) brightness(0.55)',
                }}
              />
            </div>

            {/* Lantern Controls */}
            <div className="project-info">
              <h3 className="project-name">Dream Nightlight Lantern</h3>
              <p className="project-desc">
                Hand-carved porcelain sleeping crescent moon nightlight with antique
                brass ring. Casts a soft ambient halo that calms midnight jitterbugs
                and dispels spooky shadows.
              </p>

              {/* Switch and Dimmer */}
              <div className="lantern-controls">
                <div className="control-row">
                  <span className="control-label">Lamp Power:</span>
                  <button
                    type="button"
                    className={`toggle-switch-btn ${lanternOn ? 'switch-on' : 'switch-off'}`}
                    onClick={() => {
                      sound.playPop();
                      setLanternOn(!lanternOn);
                    }}
                  >
                    {lanternOn ? 'Glowing (ON)' : 'Extinguished (OFF)'}
                  </button>
                </div>

                <div className="control-row">
                  <span className="control-label">Glow Brightness ({brightness}%):</span>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={brightness}
                    disabled={!lanternOn}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="range-slider"
                  />
                </div>

                {/* Color Spectrum Presets */}
                <div className="control-row">
                  <span className="control-label">Starlight Mood Tone:</span>
                  <div className="preset-colors-row">
                    {lightPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        className={`preset-color-btn ${lightColor === preset.color ? 'preset-active' : ''}`}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => {
                          sound.playPop();
                          setLightColor(preset.color);
                        }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PROJECT 3: DREAM DELIVERY MAP (Tier 2 SVG Animation) ================= */}
        <div id="delivery-routes" className="project-card">
          <div className="project-badge">
            <Compass size={15} />
            <span>Showcase 03 · Interactive Rooftop Flight Route</span>
          </div>
          <DreamDeliveryMap />
        </div>

        {/* ================= PROJECT 4 & 5: RATTLE TOYS & GROWTH CHART ================= */}
        <div className="project-card-duo">
          {/* Rattle & Blocks */}
          <div className="project-subcard">
            <div className="project-badge">
              <Sparkles size={14} />
              <span>Showcase 04 · Interactive haX Toys</span>
            </div>
            <h4>Playable haX Toy Blocks</h4>
            <p className="subcard-desc">
              Tap each building block to shake, chime, and tumble!
            </p>
            <div className="toy-blocks-row">
              {blocks.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  className="toy-block-btn"
                  style={{
                    backgroundColor: block.color,
                    transform: `rotate(${block.rotation}deg)`,
                  }}
                  onClick={() => handleBlockTap(block.id)}
                  title="Click to shake and rattle!"
                >
                  {block.letter}
                </button>
              ))}
            </div>
          </div>

          {/* Growth Chart */}
          <div className="project-subcard">
            <div className="project-badge">
              <Sparkles size={14} />
              <span>Showcase 05 · Nursery Growth Chart</span>
            </div>
            <h4>Pip's Nursery Skills Meter</h4>
            <div className="growth-skills-list">
              <div className="skill-item">
                <div className="skill-meta">
                  <span>Dream Weaving</span>
                  <span>98%</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: '98%', backgroundColor: '#a34063' }} />
                </div>
              </div>

              <div className="skill-item">
                <div className="skill-meta">
                  <span>Lullaby Harmonics</span>
                  <span>96%</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: '96%', backgroundColor: '#ff99c8' }} />
                </div>
              </div>

              <div className="skill-item">
                <div className="skill-meta">
                  <span>Nightlight Crafting</span>
                  <span>92%</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: '92%', backgroundColor: '#ffd166' }} />
                </div>
              </div>

              <div className="skill-item">
                <div className="skill-meta">
                  <span>Staying Awake Past 9 PM</span>
                  <span>14% (Zzz...)</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: '14%', backgroundColor: '#a9def9' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TIER 2 MINI-GAME: DREAM CATCHER ================= */}
        <div id="dream-catcher" className="project-card">
          <DreamCatcherGame />
        </div>
      </div>
    </section>
  );
}
