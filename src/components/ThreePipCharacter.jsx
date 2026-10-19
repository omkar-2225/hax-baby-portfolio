import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../audio/soundEffects';
import {
  RotateCw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TOTAL_FRAMES = 60;
const FRONT_FRAME_INDEX = 38; // Pip faces directly forward at frame 38

export default function ThreePipCharacter({
  viewMode = 'model', // 'model' (360° Turntable) | 'video' (Live 3D Video)
  isNight = true,
  onPipTickle,
  className = '',
}) {
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
  const lastAutoStepTimeRef = useRef(0);

  // 1. Preload 60 transparent WebP frames for instantaneous 360° rotation
  useEffect(() => {
    let loadedCount = 0;
    const imgs = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/pip3d/frame_${String(i).padStart(2, '0')}.webp`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= 8) {
          setIsLoaded(true);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // 2. Draw current 3D frame to canvas with crisp high DPI
  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const img = imagesRef.current[frameIdx];

    if (!img || !img.complete) return;

    // High DPI crisp resolution setup
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Compute aspect-fit dimensions with zoomScale
    const imgW = img.naturalWidth || 452;
    const imgH = img.naturalHeight || 500;
    const scale = Math.min((rect.width * 0.85) / imgW, (rect.height * 0.85) / imgH) * zoomScale;

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (rect.width - drawW) / 2;
    const drawY = (rect.height - drawH) / 2 + 6;

    // Ambient stardust aura under Pip
    const glowGrad = ctx.createRadialGradient(
      rect.width / 2,
      drawY + drawH * 0.86,
      8,
      rect.width / 2,
      drawY + drawH * 0.86,
      drawW * 0.48
    );
    glowGrad.addColorStop(0, 'rgba(255, 209, 102, 0.28)');
    glowGrad.addColorStop(0.5, 'rgba(255, 112, 166, 0.12)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(rect.width / 2, drawY + drawH * 0.86, drawW * 0.44, drawH * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw the crisp transparent 3D model frame
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }, [zoomScale]);

  // Redraw when currentFrame, zoom, or viewMode changes
  useEffect(() => {
    if (viewMode === 'model') {
      drawFrame(currentFrame);
    }
  }, [currentFrame, drawFrame, viewMode, isLoaded]);

  // Handle window resize for canvas redraw
  useEffect(() => {
    const handleResize = () => {
      if (viewMode === 'model') {
        drawFrame(currentFrame);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentFrame, drawFrame, viewMode]);

  // 3. Auto-spin rotation loop (smooth 360° rotation)
  useEffect(() => {
    if (!autoRotate || isDraggingRef.current || viewMode !== 'model') return;

    let animId;
    const stepIntervalMs = 65; // ~15 FPS rotation step, buttery smooth

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
      if (video.readyState >= 2 && !video.paused) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr) || 452;
        const h = Math.round(rect.height * dpr) || 500;

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }

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
        x: Math.max(Math.min(-dy * 6, 6), -6),
        y: Math.max(Math.min(dx * 6, 6), -6),
      });
    }

    if (!isDraggingRef.current || clientX === undefined) return;

    const deltaX = clientX - dragStartXRef.current;
    // Every 7 pixels dragged moves 1 frame (6 degrees)
    const framesMoved = Math.round(deltaX / 7);
    let nextFrame = (startFrameRef.current + framesMoved) % TOTAL_FRAMES;
    if (nextFrame < 0) nextFrame += TOTAL_FRAMES;

    setCurrentFrame(nextFrame);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    // Resume continuous 360° spin immediately
    setAutoRotate(true);
  };

  // 6. Tickle Pip Reaction
  const triggerTickle = useCallback(() => {
    sound.playBabyGiggle();
    setIsTickling(true);
    setTimeout(() => setIsTickling(false), 900);

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.45 },
        colors: ['#ffd166', '#ff99c8', '#a34063'],
      });
    } catch (e) {}

    if (onPipTickle) onPipTickle();
  }, [onPipTickle]);

  // Zoom controls
  const handleZoomChange = (delta) => {
    sound.playPop();
    setZoomScale((prev) => Math.max(Math.min(prev + delta, 1.35), 0.78));
  };

  const handleResetView = () => {
    sound.playPop();
    setCurrentFrame(FRONT_FRAME_INDEX);
    setZoomScale(1.0);
    setTilt({ x: 0, y: 0 });
    setAutoRotate(true);
  };

  // Compute rotation angle in degrees for the HUD
  const angleDeg = Math.round(((currentFrame - FRONT_FRAME_INDEX + TOTAL_FRAMES) % TOTAL_FRAMES) * (360 / TOTAL_FRAMES));

  return (
    <div className={`three-pip-container ${className}`} ref={containerRef}>
      {/* Floating Stardust Sparkles in Background */}
      <div className="pip-orbit-stars" aria-hidden="true">
        <span className="orbit-star os-1">✦</span>
        <span className="orbit-star os-2">★</span>
        <span className="orbit-star os-3">✧</span>
        <span className="orbit-star os-4">⋆</span>
        <span className="orbit-star os-5">♡</span>
      </div>

      {/* VIEWPORT: 360° Continuous Turntable Canvas (Transparent Background) */}
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
        title="Continuous 360° 3D Model! Drag horizontally to rotate or click to tickle."
        role="region"
        aria-label="Interactive 3D Turntable of Pip the Skull Baby"
      >
        <canvas ref={canvasRef} className="turntable-canvas" />
      </div>

      {/* Floating 3D Interaction Control HUD (Centered, no clipping) */}
      <div className="three-pip-hud">
        <div className="hud-status-badge">
          <span className="live-pulse-dot" />
          <span>360° ({angleDeg}°)</span>
        </div>

        <div className="hud-buttons-row">
          <button
            type="button"
            className={`hud-btn ${autoRotate ? 'hud-btn-active' : ''}`}
            onClick={() => {
              sound.playPop();
              setAutoRotate(!autoRotate);
            }}
            title={autoRotate ? 'Pause 3D auto-spin' : 'Start continuous auto-spin'}
            aria-label="Toggle continuous 3D auto-spin"
          >
            <RotateCw size={13} className={autoRotate ? 'spin-slow' : ''} />
            <span>{autoRotate ? 'Spinning' : 'Spin'}</span>
          </button>

          <button
            type="button"
            className={`hud-btn hud-btn-tickle ${isTickling ? 'tickle-active' : ''}`}
            onClick={triggerTickle}
            title="Tickle Pip for giggles and star confetti!"
            aria-label="Tickle Pip in 3D"
          >
            <Sparkles size={13} />
            <span>Tickle</span>
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={() => handleZoomChange(0.1)}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={13} />
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={() => handleZoomChange(-0.1)}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={13} />
          </button>

          <button
            type="button"
            className="hud-btn hud-btn-icon"
            onClick={handleResetView}
            title="Reset front view (0°)"
            aria-label="Reset front view"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Helpful Quick Tip Pill */}
      <div className="three-pip-tip">
        <span>🖱️ Drag to rotate 360° · Click Pip to giggle!</span>
      </div>
    </div>
  );
}
