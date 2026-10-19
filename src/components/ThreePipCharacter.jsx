import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from '../audio/soundEffects';
import {
  RotateCw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Film,
  Box,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TOTAL_FRAMES = 60;
const FRONT_FRAME_INDEX = 38; // Pip faces directly forward at frame 38

export default function ThreePipCharacter({
  isNight = true,
  onPipTickle,
  className = '',
}) {
  // Viewer sub-modes: 'model' (360° Turntable from video with bg removed), 'video' (Live video with real-time chromakey bg removal), 'procedural' (Three.js WebGL mesh)
  const [viewMode, setViewMode] = useState('model');
  const [currentFrame, setCurrentFrame] = useState(FRONT_FRAME_INDEX);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isTickling, setIsTickling] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // References
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const imagesRef = useRef([]);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const startFrameRef = useRef(FRONT_FRAME_INDEX);
  const animFrameIdRef = useRef(null);
  const lastAutoStepTimeRef = useRef(0);

  // Procedural Three.js Canvas Reference
  const proceduralMountRef = useRef(null);
  const threeSceneRef = useRef(null);

  // 1. Preload 60 transparent WebP frames for instantaneous 360° rotation
  useEffect(() => {
    let loadedCount = 0;
    const imgs = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/pip3d/frame_${String(i).padStart(2, '0')}.webp`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= 10) {
          setIsLoaded(true);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // 2. Draw current 3D frame to canvas with high DPI and smooth scaling
  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIdx];

    if (!img || !img.complete) return;

    // High DPI setup
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Compute aspect-fit dimensions with zoomScale
    const imgW = img.naturalWidth || 452;
    const imgH = img.naturalHeight || 500;
    const scale = Math.min((rect.width * 0.88) / imgW, (rect.height * 0.88) / imgH) * zoomScale;

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (rect.width - drawW) / 2;
    const drawY = (rect.height - drawH) / 2 + 10;

    // Draw ambient stardust glow under Pip
    const glowGrad = ctx.createRadialGradient(
      rect.width / 2,
      drawY + drawH * 0.85,
      10,
      rect.width / 2,
      drawY + drawH * 0.85,
      drawW * 0.5
    );
    glowGrad.addColorStop(0, 'rgba(255, 209, 102, 0.25)');
    glowGrad.addColorStop(0.5, 'rgba(255, 112, 166, 0.12)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(rect.width / 2, drawY + drawH * 0.85, drawW * 0.45, drawH * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw the transparent 3D model frame
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }, [zoomScale]);

  // Redraw when currentFrame or zoom changes
  useEffect(() => {
    if (viewMode === 'model') {
      drawFrame(currentFrame);
    }
  }, [currentFrame, drawFrame, viewMode, isLoaded]);

  // 3. Auto-spin rotation loop (smooth 360° rotation)
  useEffect(() => {
    if (!autoRotate || isDraggingRef.current || viewMode !== 'model') return;

    let animId;
    const stepIntervalMs = 65; // ~15 FPS rotation step, smooth & gentle

    const loop = (timestamp) => {
      if (!lastAutoStepTimeRef.current) lastAutoStepTimeRef.current = timestamp;
      const elapsed = timestamp - lastAutoStepTimeRef.current;

      if (elapsed >= stepIntervalMs) {
        lastAutoStepTimeRef.current = timestamp;
        setCurrentFrame((prev) => (prev + 1) % TOTAL_FRAMES);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate, viewMode]);

  // 4. Real-time Video Chroma-Key Background Removal Mode
  useEffect(() => {
    if (viewMode !== 'video') return;

    const video = videoRef.current;
    const canvas = videoCanvasRef.current;
    if (!video || !canvas) return;

    let animId;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const processFrame = () => {
      if (video.readyState >= 2) {
        const w = canvas.width;
        const h = canvas.height;
        ctx.drawImage(video, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const diff = maxVal - minVal;

          // Remove dark studio backdrop & neutral floor grid lines
          if (maxVal < 55 || (maxVal < 112 && diff < 16)) {
            data[i + 3] = 0; // Transparent!
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }
      animId = requestAnimationFrame(processFrame);
    };

    video.play().catch(() => {});
    animId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animId);
      if (video) video.pause();
    };
  }, [viewMode]);

  // 5. Interactive Drag & Touch Handlers (Rotate 360° on X axis)
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startFrameRef.current = currentFrame;
    setAutoRotate(false);
  };

  const handlePointerMove = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    // 3D Tilt calculation
    if (containerRef.current && clientX !== undefined && clientY !== undefined) {
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setTilt({
        x: Math.max(Math.min(-dy * 8, 8), -8),
        y: Math.max(Math.min(dx * 8, 8), -8),
      });
    }

    if (!isDraggingRef.current || clientX === undefined) return;

    const deltaX = clientX - dragStartXRef.current;
    // Every 8 pixels dragged moves 1 frame (6 degrees)
    const framesMoved = Math.round(deltaX / 8);
    let nextFrame = (startFrameRef.current + framesMoved) % TOTAL_FRAMES;
    if (nextFrame < 0) nextFrame += TOTAL_FRAMES;

    setCurrentFrame(nextFrame);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // 6. Tickle Pip Reaction
  const triggerTickle = useCallback(() => {
    sound.playBabyGiggle();
    setIsTickling(true);
    setTimeout(() => setIsTickling(false), 900);

    try {
      confetti({
        particleCount: 40,
        spread: 65,
        origin: { y: 0.45 },
        colors: ['#ffd166', '#ff99c8', '#a34063'],
      });
    } catch (e) {}

    if (onPipTickle) onPipTickle();
  }, [onPipTickle]);

  // Zoom controls
  const handleZoomChange = (delta) => {
    sound.playPop();
    setZoomScale((prev) => Math.max(Math.min(prev + delta, 1.45), 0.75));
  };

  const handleResetView = () => {
    sound.playPop();
    setCurrentFrame(FRONT_FRAME_INDEX);
    setZoomScale(1.0);
    setTilt({ x: 0, y: 0 });
  };

  // Compute rotation angle in degrees for the HUD
  const angleDeg = Math.round(((currentFrame - FRONT_FRAME_INDEX + TOTAL_FRAMES) % TOTAL_FRAMES) * (360 / TOTAL_FRAMES));

  return (
    <div className={`three-pip-container ${className}`} ref={containerRef}>
      {/* 3D Mode Selector Header: Turntable vs Live Video vs Procedural */}
      <div className="pip-submode-bar">
        <button
          type="button"
          className={`submode-pill ${viewMode === 'model' ? 'submode-active' : ''}`}
          onClick={() => {
            sound.playPop();
            setViewMode('model');
          }}
          title="Pip 3D model with background removed and 360° turntable control"
        >
          <Box size={13} />
          <span>3D Model (Turntable 360°)</span>
        </button>

        <button
          type="button"
          className={`submode-pill ${viewMode === 'video' ? 'submode-active' : ''}`}
          onClick={() => {
            sound.playPop();
            setViewMode('video');
          }}
          title="Play 3D model video with real-time chroma-key background removal"
        >
          <Film size={13} />
          <span>Live 3D Video (Clean BG)</span>
        </button>
      </div>

      {/* Floating 3D Interaction Control HUD */}
      <div className="three-pip-hud">
        <div className="hud-status-badge">
          <span className="live-pulse-dot" />
          <span>
            {viewMode === 'model' ? `360° Interactive (${angleDeg}°)` : 'Live Chroma Stream'}
          </span>
        </div>

        <div className="hud-buttons-row">
          {viewMode === 'model' && (
            <button
              type="button"
              className={`hud-btn ${autoRotate ? 'hud-btn-active' : ''}`}
              onClick={() => {
                sound.playPop();
                setAutoRotate(!autoRotate);
              }}
              title={autoRotate ? 'Pause 3D auto-spin' : 'Start 3D auto-spin'}
              aria-label="Toggle 3D auto-rotation"
            >
              <RotateCw size={14} className={autoRotate ? 'spin-slow' : ''} />
              <span>{autoRotate ? 'Spinning' : 'Spin'}</span>
            </button>
          )}

          <button
            type="button"
            className={`hud-btn hud-btn-tickle ${isTickling ? 'tickle-active' : ''}`}
            onClick={triggerTickle}
            title="Tickle Pip for giggles and star confetti!"
            aria-label="Tickle Pip in 3D"
          >
            <Sparkles size={14} />
            <span>Tickle Pip</span>
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={() => handleZoomChange(0.12)}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={() => handleZoomChange(-0.12)}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={handleResetView}
            title="Reset front view (0°)"
            aria-label="Reset front view"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* VIEWPORT: Mode 1 - 360° Turntable Canvas with Background Removed */}
      {viewMode === 'model' && (
        <div
          className={`turntable-viewport-wrap ${isTickling ? 'pip-jump-bounce' : ''}`}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease-out',
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onClick={triggerTickle}
          title="Drag left/right to rotate Pip 360°! Click to tickle."
          role="region"
          aria-label="Interactive 3D Turntable of Pip the Skull Baby"
        >
          {/* Ambient Floating Orbit Stars */}
          <div className="pip-orbit-stars" aria-hidden="true">
            <span className="orbit-star os-1">✦</span>
            <span className="orbit-star os-2">★</span>
            <span className="orbit-star os-3">✧</span>
            <span className="orbit-star os-4">⋆</span>
            <span className="orbit-star os-5">♡</span>
          </div>

          <canvas ref={canvasRef} className="turntable-canvas" />

          {/* Interactive Poke Bubble */}
          <div className="pip-thought-bubble">
            <Sparkles size={14} style={{ color: '#ffd166' }} />
            <span>Drag to rotate 360° · Poke to giggle! ✨</span>
          </div>
        </div>
      )}

      {/* VIEWPORT: Mode 2 - Live Video with Real-Time Chroma-Key Background Removal */}
      {viewMode === 'video' && (
        <div
          className="video-chroma-viewport-wrap"
          onClick={triggerTickle}
          title="3D model video playing with real-time background removal"
        >
          {/* Hidden native video element */}
          <video
            ref={videoRef}
            src="/3D model video.mp4"
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            style={{ display: 'none' }}
          />

          {/* Chroma-key Canvas Output */}
          <canvas
            ref={videoCanvasRef}
            width={452}
            height={500}
            className="video-chroma-canvas"
          />

          <div className="pip-thought-bubble">
            <Film size={14} style={{ color: '#ffd166' }} />
            <span>Streaming 3D Video with Background Removed 🎬</span>
          </div>
        </div>
      )}

      {/* Helpful Quick Tip Pill */}
      <div className="three-pip-tip">
        <span>
          {viewMode === 'model'
            ? '🖱️ Click & drag horizontally to rotate 360° · Scroll/buttons to zoom'
            : '✨ Real-time chroma-key background removal active'}
        </span>
      </div>
    </div>
  );
}
