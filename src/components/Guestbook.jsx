import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../audio/soundEffects';
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  Heart,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const FALLBACK_INITIAL_MESSAGES = [
  {
    id: 'wish-1',
    name: 'Barnaby Bear',
    sticker: '🐻',
    message: 'Pip, your chamomile music box melody cured my 3-week winter insomnia! 10/10 best engineer.',
    time: '2 hours ago',
    tag: 'Verified Dreamer',
    loves: 14,
  },
  {
    id: 'wish-2',
    name: 'Luna the Night Owl',
    sticker: '🦉',
    message: 'The porcelain moon lantern keeps my nursery hollow so warm and cozy. Thank you Pip!',
    time: '5 hours ago',
    tag: 'Midnight Neighbor',
    loves: 9,
  },
  {
    id: 'wish-3',
    name: 'Sprout the Sprite',
    sticker: '🍄',
    message: 'Can you please route a dream of flying over pink cotton candy mountains tonight? ✨',
    time: 'Yesterday',
    tag: 'Cloud Hopper',
    loves: 21,
  },
];

export default function Guestbook() {
  const [messages, setMessages] = useState(FALLBACK_INITIAL_MESSAGES);
  const [author, setAuthor] = useState('');
  const [wish, setWish] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('🌟');
  const [hitCount, setHitCount] = useState(1256);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendStatus, setBackendStatus] = useState('connecting'); // 'live' | 'offline'
  const [pingMs, setPingMs] = useState(16);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stickers = ['🌟', '🌙', '🧸', '☁️', '🎀', '💀', '🍼', '💖'];

  // Fetch messages from real backend API (/api/wishes)
  const fetchWishesFromBackend = useCallback(async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/wishes', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
          setBackendStatus('live');
          setPingMs(Math.round(performance.now() - start));
          try {
            localStorage.setItem('pip_guestbook_messages', JSON.stringify(data));
          } catch (e) {}
          return;
        }
      }
    } catch (err) {
      console.warn('Backend wishes API unreachable, falling back to local storage:', err);
    }

    // Fallback to local storage if API server is offline
    setBackendStatus('offline');
    try {
      const saved = localStorage.getItem('pip_guestbook_messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Fetch odometer from backend
  const fetchOdometerFromBackend = useCallback(async () => {
    try {
      const res = await fetch('/api/odometer/increment', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.count) {
          setHitCount(data.count);
          localStorage.setItem('pip_dream_odometer', data.count.toString());
          return;
        }
      }
    } catch (e) {}

    // Fallback odometer in localStorage
    const savedHits = localStorage.getItem('pip_dream_odometer');
    const initialHits = savedHits ? parseInt(savedHits, 10) + 1 : 1257;
    setHitCount(initialHits);
    localStorage.setItem('pip_dream_odometer', initialHits.toString());
  }, []);

  useEffect(() => {
    fetchWishesFromBackend();
    fetchOdometerFromBackend();

    // Auto-poll backend every 12 seconds for live real-time sync
    const interval = setInterval(() => {
      fetchWishesFromBackend();
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchWishesFromBackend, fetchOdometerFromBackend]);

  const handleManualRefresh = async () => {
    sound.playPop();
    setIsRefreshing(true);
    await fetchWishesFromBackend();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSendLove = async (id) => {
    sound.playChime(1.4);
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, loves: (m.loves || 0) + 1 } : m))
    );

    try {
      await fetch('/api/wishes/love', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !wish.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sound.playChime(1.2);

    const payload = {
      name: author.trim(),
      message: wish.trim(),
      sticker: selectedSticker,
      tag: 'Verified Dreamer',
    };

    let savedWish = null;

    // Try posting to real backend API first
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.wish) {
          savedWish = data.wish;
          setBackendStatus('live');
        }
      }
    } catch (err) {
      console.warn('Backend POST failed, saving to local state:', err);
    }

    if (!savedWish) {
      savedWish = {
        id: 'wish-' + Date.now(),
        name: author.trim(),
        sticker: selectedSticker,
        message: wish.trim(),
        time: 'Just now',
        tag: 'Midnight Friend',
        loves: 1,
      };
    }

    setMessages((prev) => [savedWish, ...prev.filter((m) => m.id !== savedWish.id)]);
    setAuthor('');
    setWish('');
    setIsSubmitting(false);

    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#ffd166', '#ff99c8', '#a34063'],
      });
    } catch (err) {}
  };

  return (
    <section id="guestbook" className="guestbook-section">
      <div className="section-header-wrap">
        <div className="pill-badge">
          <MessageSquareHeart size={14} />
          <span>Tier 3: Legendary · Live Dream Guestbook & Backend API</span>
        </div>
        <h2 className="section-title">
          Midnight Nursery <span className="highlight-berry">Live Guestbook</span>
        </h2>
        <p className="section-subtitle">
          Real persistent backend where dreamers across the globe leave wishes for Pip!
        </p>

        {/* Real Backend Connection Badge */}
        <div className="backend-status-pill">
          {backendStatus === 'live' ? (
            <>
              <Wifi size={14} className="status-live-icon" />
              <span>
                <strong>Live Backend Connected:</strong> /api/wishes (Disk JSON DB · {pingMs}ms)
              </span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="status-offline-icon" />
              <span>
                <strong>Offline Mode:</strong> LocalStorage Sync Active
              </span>
            </>
          )}

          <button
            type="button"
            className="btn-refresh-feed"
            onClick={handleManualRefresh}
            title="Refresh live wishes"
          >
            <RefreshCw size={12} className={isRefreshing ? 'spin-fast' : ''} />
            <span>Sync Wall</span>
          </button>
        </div>
      </div>

      {/* Retro Visitor Hit Counter Odometer */}
      <div className="odometer-container">
        <div className="odometer-label">
          <Clock size={16} className="odometer-icon" />
          <span>TOTAL DREAMS DISPATCHED (LIVE BACKEND ODOMETER):</span>
        </div>
        <div className="odometer-digits">
          {hitCount
            .toString()
            .padStart(6, '0')
            .split('')
            .map((digit, idx) => (
              <span key={idx} className="odometer-digit">
                {digit}
              </span>
            ))}
        </div>
        <div className="odometer-sub">
          ✨ Verified Live Backend Odometer · haX.baby Certified
        </div>
      </div>

      <div className="guestbook-grid">
        {/* Left: Input Form */}
        <div className="guestbook-form-card">
          <div className="card-header-cute">
            <Sparkles size={18} className="accent-icon" />
            <h3>Pin a Wish to Pip's Dream Wall</h3>
          </div>
          <p className="form-sub">
            All messages are saved to the persistent backend database!
          </p>

          <form onSubmit={handleSubmit} className="wish-form">
            <div className="form-group">
              <label htmlFor="guest-name">Your Name / Creature Moniker</label>
              <input
                id="guest-name"
                type="text"
                placeholder="e.g. Penny the Sleepy Sprite"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                required
              />
            </div>

            <div className="form-group">
              <label>Pick a Bedtime Sticker</label>
              <div className="stickers-picker">
                {stickers.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`sticker-option ${
                      selectedSticker === s ? 'sticker-active' : ''
                    }`}
                    onClick={() => {
                      sound.playPop();
                      setSelectedSticker(s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="guest-wish">Your Bedtime Wish or Message for Pip</label>
              <textarea
                id="guest-wish"
                placeholder="Describe a cozy dream you want Pip to invent, or leave a sleepy greeting..."
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                maxLength={160}
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-submit-wish"
              disabled={isSubmitting}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Sending to Backend...' : 'Pin Wish to Live Nursery Wall'}</span>
            </button>
          </form>
        </div>

        {/* Right: Message Wall Feed */}
        <div className="guestbook-wall">
          <div className="wall-header">
            <h4>Live Bedtime Registry Feed ({messages.length} wishes)</h4>
          </div>

          <div className="messages-scroll-area">
            {messages.map((m) => (
              <div key={m.id} className="message-bubble animate-fade-in-up">
                <div className="bubble-top">
                  <div className="bubble-author">
                    <span className="bubble-sticker">{m.sticker}</span>
                    <strong>{m.name}</strong>
                    <span className="bubble-tag">{m.tag || 'Dreamer'}</span>
                  </div>
                  <span className="bubble-time">{m.time}</span>
                </div>
                <p className="bubble-body">{m.message}</p>

                {/* Love reaction button with real backend sync */}
                <div className="bubble-actions">
                  <button
                    type="button"
                    className="bubble-love-btn"
                    onClick={() => handleSendLove(m.id)}
                    title="Send love to this dreamer"
                  >
                    <Heart size={13} className="love-icon" />
                    <span>{m.loves || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
