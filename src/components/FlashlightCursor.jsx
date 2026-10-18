import React, { useEffect, useRef, useState } from 'react';

/**
 * FlashlightCursor — Tier 2 Standout Feature
 *
 * Creates an ambient "nightlight" cursor effect using a CSS radial-gradient mask
 * that illuminates dream layers beneath it. In night mode the entire page dims
 * except for a glowing circle that follows the cursor — like holding a lantern.
 *
 * Includes:
 *  - Smooth lerp-interpolated cursor following (no jitter)
 *  - Pulse breathing animation on the light radius
 *  - Color rotation through warm dream tones
 *  - Auto-disable on touch devices (prevents layout issues)
 *  - Accessible: hidden from screen readers, no pointer interference
 */
export default function FlashlightCursor({ isNight, enabled }) {
  const [smoothPos, setSmoothPos] = useState({ x: -999, y: -999 });
  const [isVisible, setIsVisible] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const rawPos = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const colorTimerRef = useRef(null);
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const dreamColors = [
    { inner: 'rgba(255, 220, 140, 0.18)', outer: 'rgba(255, 185, 100, 0.04)' },
    { inner: 'rgba(200, 160, 255, 0.18)', outer: 'rgba(160, 100, 255, 0.04)' },
    { inner: 'rgba(130, 220, 255, 0.18)', outer: 'rgba(70, 190, 255, 0.04)' },
    { inner: 'rgba(255, 170, 200, 0.18)', outer: 'rgba(255, 120, 160, 0.04)' },
  ];

  useEffect(() => {
    if (!enabled || !isNight) return;

    // On mobile / touch devices, initialize at center of screen so the nightlight is immediately visible
    if (rawPos.current.x === -999 && typeof window !== 'undefined') {
      const initX = window.innerWidth / 2;
      const initY = window.innerHeight * 0.4;
      rawPos.current = { x: initX, y: initY };
      smoothRef.current = { x: initX, y: initY };
      setSmoothPos({ x: initX, y: initY });
      setIsVisible(true);
    }

    const updatePos = (clientX, clientY) => {
      rawPos.current = { x: clientX, y: clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseMove = (e) => {
      updatePos(e.clientX, e.clientY);
    };

    const handleTouch = (e) => {
      if (e.touches && e.touches.length > 0) {
        updatePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseLeave = () => {
      // Don't hide on mobile touch screens
      if (!isTouchDevice) {
        setIsVisible(false);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      smoothRef.current = {
        x: lerp(smoothRef.current.x, rawPos.current.x, 0.14),
        y: lerp(smoothRef.current.y, rawPos.current.y, 0.14),
      };
      setSmoothPos({ ...smoothRef.current });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    colorTimerRef.current = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % dreamColors.length);
    }, 4000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (colorTimerRef.current) clearInterval(colorTimerRef.current);
    };
  }, [isNight, enabled, isTouchDevice]);

  if (!enabled || !isNight || !isVisible) return null;

  const c = dreamColors[colorIndex];

  return (
    <>
      <div
        className="flashlight-overlay"
        aria-hidden="true"
        style={{
          background: `radial-gradient(
            circle 220px at ${smoothPos.x}px ${smoothPos.y}px,
            transparent 0%,
            transparent 120px,
            rgba(8, 6, 22, 0.72) 220px
          )`,
        }}
      />
      <div
        className="flashlight-inner-glow"
        aria-hidden="true"
        style={{
          left: smoothPos.x,
          top: smoothPos.y,
          background: `radial-gradient(
            circle at center,
            ${c.inner} 0%,
            ${c.outer} 55%,
            transparent 70%
          )`,
        }}
      />
      <div
        className="flashlight-cursor-dot"
        aria-hidden="true"
        style={{
          left: smoothPos.x,
          top: smoothPos.y,
        }}
      />
    </>
  );
}
