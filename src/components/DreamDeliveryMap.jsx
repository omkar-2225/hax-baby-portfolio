import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../audio/soundEffects';

/**
 * DreamDeliveryMap — Tier 2 Standout Feature
 *
 * SVG map with scroll-synced Pip travel:
 *  - Pip position computed via cubic-bezier interpolation (NO animateMotion)
 *  - Animated dashed route path (stroke-dashoffset reveal)
 *  - Glowing stop markers that activate as Pip passes
 *  - Twinkling stars in the sky layer
 *  - Click any stop to fast-travel Pip there with sound
 *  - Fully mobile-responsive SVG viewBox with touch support
 */

// Cubic bezier point along the path segments
function lerp(a, b, t) { return a + (b - a) * t; }

function cubicBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

export default function DreamDeliveryMap() {
  const [activeStop, setActiveStop] = useState(0);
  const [pipPos, setPipPos] = useState({ x: 60, y: 280 });
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  const stops = [
    { id: 0, x: 60,  y: 275, icon: '🍼', name: 'Nursery Hub',   time: '20:00', color: '#ff99c8' },
    { id: 1, x: 200, y: 160, icon: '👻', name: 'Ghost Alley',   time: '21:30', color: '#c77dff' },
    { id: 2, x: 360, y: 215, icon: '🐰', name: 'Bunny Burrows', time: '23:00', color: '#baffc9' },
    { id: 3, x: 500, y: 100, icon: '☁️', name: 'Cloud Spire',   time: '01:15', color: '#4cc9f0' },
    { id: 4, x: 640, y: 195, icon: '🏰', name: 'Slumber Haven', time: '03:45', color: '#ffd166' },
  ];

  // Build bezier segment control points
  const segments = [
    { p0: stops[0], p1: { x: stops[0].x + 50, y: stops[0].y - 80 }, p2: { x: stops[1].x - 50, y: stops[1].y - 40 }, p3: stops[1] },
    { p0: stops[1], p1: { x: stops[1].x + 70, y: stops[1].y + 40 }, p2: { x: stops[2].x - 60, y: stops[2].y - 60 }, p3: stops[2] },
    { p0: stops[2], p1: { x: stops[2].x + 70, y: stops[2].y + 30 }, p2: { x: stops[3].x - 80, y: stops[3].y + 60 }, p3: stops[3] },
    { p0: stops[3], p1: { x: stops[3].x + 60, y: stops[3].y - 20 }, p2: { x: stops[4].x - 70, y: stops[4].y - 80 }, p3: stops[4] },
  ];

  const pathD = segments.map((s, i) =>
    i === 0
      ? `M ${s.p0.x} ${s.p0.y} C ${s.p1.x} ${s.p1.y}, ${s.p2.x} ${s.p2.y}, ${s.p3.x} ${s.p3.y}`
      : `C ${s.p1.x} ${s.p1.y}, ${s.p2.x} ${s.p2.y}, ${s.p3.x} ${s.p3.y}`
  ).join(' ');

  // Compute Pip's SVG position from 0–1 global progress
  const getPipPos = useCallback((p) => {
    const clampedP = Math.max(0, Math.min(1, p));
    const segCount = segments.length;
    const segIdx = Math.min(Math.floor(clampedP * segCount), segCount - 1);
    const segT = (clampedP * segCount) - segIdx;
    const seg = segments[segIdx];
    return cubicBezierPoint(seg.p0, seg.p1, seg.p2, seg.p3, segT);
  }, []); // eslint-disable-line

  const TOTAL_PATH_LEN = 900;

  // Scroll sync
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.max(0, Math.min(1,
        (windowH - rect.top) / (windowH + rect.height * 0.5)
      ));
      targetProgress.current = progress;
      const stopIdx = Math.min(Math.floor(progress * stops.length + 0.3), stops.length - 1);
      setActiveStop(stopIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth lerp Pip to target progress
  useEffect(() => {
    const tick = () => {
      currentProgress.current += (targetProgress.current - currentProgress.current) * 0.06;
      setPipPos(getPipPos(currentProgress.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getPipPos]);

  const handleStopClick = (stop) => {
    sound.playChime && sound.playChime(0.9);
    setActiveStop(stop.id);
    const progress = stop.id / (stops.length - 1);
    targetProgress.current = progress;
    currentProgress.current = progress;
    setPipPos(getPipPos(progress));
  };

  const stars = Array.from({ length: 18 }, (_, i) => ({
    cx: (i * 41 + 17) % 680 + 10,
    cy: (i * 37 + 29) % 90 + 15,
    r: i % 3 === 0 ? 2.5 : 1.5,
    delay: (i * 0.31) % 2,
  }));

  const dashOffset = TOTAL_PATH_LEN * (1 - Math.max(0, Math.min(1, targetProgress.current)));
  const activeStopData = stops[activeStop];

  return (
    <div className="dream-map-wrap" ref={sectionRef}>
      <div className="map-header">
        <h3 className="project-name">Dream Delivery Route Map</h3>
        <p className="project-desc">
          Every night at 20:00, Pip boards a puffy cumulus cloud to drop custom-crafted
          dreams into chimneys across the neighborhood.{' '}
          <em>Scroll to fly the route — tap any stop to fast-travel!</em>
        </p>
      </div>

      {/* SVG Map Canvas */}
      <div className="map-svg-container" aria-label="Interactive dream delivery route map">
        <svg
          viewBox="0 0 720 340"
          className="map-svg"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d0630" />
              <stop offset="100%" stopColor="#1a1040" />
            </linearGradient>
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff99c8" />
              <stop offset="50%" stopColor="#c77dff" />
              <stop offset="100%" stopColor="#ffd166" />
            </linearGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="stopGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sky */}
          <rect width="720" height="340" fill="url(#skyGrad)" rx="16" />

          {/* Stars */}
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#fff"
              opacity="0.7"
              className="map-star"
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}

          {/* Ground hills */}
          <ellipse cx="160" cy="335" rx="220" ry="60" fill="#1a0d40" opacity="0.8" />
          <ellipse cx="500" cy="340" rx="280" ry="70" fill="#120830" opacity="0.9" />

          {/* Ghost route track */}
          <path d={pathD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" strokeDasharray="8 6" />

          {/* Animated reveal path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth="3.5"
            strokeDasharray={TOTAL_PATH_LEN}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{ transition: 'stroke-dashoffset 0.12s linear' }}
          />

          {/* Stop markers */}
          {stops.map((stop, i) => {
            const isActive = activeStop === stop.id;
            const isPassed = i <= activeStop;
            return (
              <g
                key={stop.id}
                className="map-stop"
                onClick={() => handleStopClick(stop)}
                onKeyDown={(e) => e.key === 'Enter' && handleStopClick(stop)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`Stop: ${stop.name} at ${stop.time}`}
              >
                {isActive && (
                  <circle cx={stop.x} cy={stop.y} r={24} fill={stop.color} opacity="0.25" filter="url(#stopGlow)" />
                )}
                <circle
                  cx={stop.x} cy={stop.y}
                  r={isActive ? 20 : 16}
                  fill={isPassed ? stop.color : 'rgba(255,255,255,0.08)'}
                  stroke={stop.color}
                  strokeWidth={isActive ? 3 : 2}
                  opacity={isPassed ? 1 : 0.4}
                  style={{ transition: 'all 0.4s ease' }}
                />
                <text x={stop.x} y={stop.y + 6} textAnchor="middle" fontSize={isActive ? 16 : 13}>
                  {stop.icon}
                </text>
                <text
                  x={stop.x} y={stop.y + (stop.y > 200 ? -28 : 38)}
                  textAnchor="middle" fontSize="10"
                  fill={isPassed ? '#fff' : 'rgba(255,255,255,0.4)'}
                  fontWeight={isActive ? 700 : 400}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {stop.time}
                </text>
                <text
                  x={stop.x} y={stop.y + (stop.y > 200 ? -16 : 50)}
                  textAnchor="middle" fontSize="9"
                  fill={isPassed ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {stop.name}
                </text>
              </g>
            );
          })}

          {/* Pip sprite — positioned via JS-computed bezier coordinates */}
          <g transform={`translate(${pipPos.x}, ${pipPos.y})`} filter="url(#glow)">
            <circle r="16" fill="#ffd166" opacity="0.35" />
            <circle r="12" fill="#ffd16666" />
            <text textAnchor="middle" dy="6" fontSize="16">🍼</text>
          </g>
        </svg>
      </div>

      {/* Active stop info card */}
      <div className="map-stop-card" key={activeStop}>
        <div className="map-card-icon">{activeStopData.icon}</div>
        <div className="map-card-info">
          <div className="map-card-time" style={{ color: activeStopData.color }}>
            {activeStopData.time} · Stop {activeStop + 1} of {stops.length}
          </div>
          <div className="map-card-name">{activeStopData.name}</div>
        </div>
        <div className="map-card-status">
          <span className="status-ping" />
          <span>En Route</span>
        </div>
      </div>
    </div>
  );
}
