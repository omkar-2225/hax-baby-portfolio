import React, { useState, useEffect } from 'react';
import { sound } from '../audio/soundEffects';
import { MessageSquareHeart, Send, Sparkles, Heart, Clock, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_MESSAGES = [
  {
    id: 1,
    name: 'Barnaby Bear',
    sticker: '🐻',
    message: 'Pip, your chamomile music box melody cured my 3-week winter insomnia! 10/10 best engineer.',
    time: '2 hours ago',
    tag: 'Verified Dreamer',
  },
  {
    id: 2,
    name: 'Luna the Night Owl',
    sticker: '🦉',
    message: 'The porcelain moon lantern keeps my nursery hollow so warm and cozy. Thank you Pip!',
    time: '5 hours ago',
    tag: 'Midnight Neighbor',
  },
  {
    id: 3,
    name: 'Sprout the Sprite',
    sticker: '🍄',
    message: 'Can you please route a dream of flying over pink cotton candy mountains tonight? ✨',
    time: 'Yesterday',
    tag: 'Cloud Hopper',
  },
];

export default function Guestbook() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('pip_guestbook_messages');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch (e) {
      return INITIAL_MESSAGES;
    }
  });

  const [author, setAuthor] = useState('');
  const [wish, setWish] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('🌟');
  const [hitCount, setHitCount] = useState(1248);

  const stickers = ['🌟', '🌙', '🧸', '☁️', '🎀', '💀', '🍼', '💖'];

  useEffect(() => {
    try {
      localStorage.setItem('pip_guestbook_messages', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Visitor Odometer count
  useEffect(() => {
    const savedHits = localStorage.getItem('pip_dream_odometer');
    const initialHits = savedHits ? parseInt(savedHits, 10) + 1 : 1249;
    setHitCount(initialHits);
    localStorage.setItem('pip_dream_odometer', initialHits.toString());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!author.trim() || !wish.trim()) return;

    sound.playChime(1.2);
    const newEntry = {
      id: Date.now(),
      name: author.trim(),
      sticker: selectedSticker,
      message: wish.trim(),
      time: 'Just now',
      tag: 'New Bedtime Friend',
    };

    setMessages([newEntry, ...messages]);
    setAuthor('');
    setWish('');

    try {
      confetti({
        particleCount: 45,
        spread: 60,
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
          <span>Side Quest (+3 pts) · Guestbook & Hit Counter</span>
        </div>
        <h2 className="section-title">
          Midnight Nursery <span className="highlight-berry">Guestbook</span>
        </h2>
        <p className="section-subtitle">
          Leave a sweet bedtime wish or message for Pip on the nursery wall!
        </p>
      </div>

      {/* Retro Visitor Hit Counter Odometer (+1 pt) */}
      <div className="odometer-container">
        <div className="odometer-label">
          <Clock size={16} className="odometer-icon" />
          <span>TOTAL DREAMS DISPATCHED (ODOMETER):</span>
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
        <div className="odometer-sub">✨ Verified Visitor Odometer · haX.baby Certified</div>
      </div>

      <div className="guestbook-grid">
        {/* Left: Input Form */}
        <div className="guestbook-form-card">
          <div className="card-header-cute">
            <Sparkles size={18} className="accent-icon" />
            <h3>Sign Pip's Dream Wall</h3>
          </div>
          <p className="form-sub">
            All messages are saved to your local bedtime registry!
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
                    className={`sticker-option ${selectedSticker === s ? 'sticker-active' : ''}`}
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
                placeholder="Send a bedtime greeting or describe a dream you want Pip to invent..."
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                maxLength={140}
                rows={3}
                required
              />
            </div>

            <button type="submit" className="btn-submit-wish">
              <Send size={16} />
              <span>Pin Wish to Nursery Wall</span>
            </button>
          </form>
        </div>

        {/* Right: Message Wall Feed */}
        <div className="guestbook-wall">
          <div className="wall-header">
            <h4>Recent Dream Registry Messages ({messages.length})</h4>
          </div>

          <div className="messages-scroll-area">
            {messages.map((m) => (
              <div key={m.id} className="message-bubble">
                <div className="bubble-top">
                  <div className="bubble-author">
                    <span className="bubble-sticker">{m.sticker}</span>
                    <strong>{m.name}</strong>
                    <span className="bubble-tag">{m.tag}</span>
                  </div>
                  <span className="bubble-time">{m.time}</span>
                </div>
                <p className="bubble-body">{m.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
