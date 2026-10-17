import React, { useEffect } from 'react';
import { sound } from '../audio/soundEffects';
import { Sparkles, Moon, X, Gift, Star, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EasterEggModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      sound.playChime(1.4);
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#ffd166', '#ff99c8', '#a34063', '#a9def9', '#ffffba'],
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="easter-egg-backdrop" onClick={onClose}>
      <div
        className="easter-egg-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="modal-badge">
          <Gift size={16} />
          <span>Core Requirement 06 · Hidden Easter Egg</span>
        </div>

        <h3 className="modal-title">
          🎉 Secret Pajama Party Discovered!
        </h3>

        <div className="modal-avatar-party">
          <img
            src="/pip_avatar_cloud.png"
            alt="Pip having a secret pajama party"
            className="party-pip-img"
          />
          <div className="party-sunglasses">🕶️</div>
        </div>

        <p className="modal-copy">
          You clicked Pip's secret nightcap starlight bow! Pip woke up from a power nap
          and gifted you the <strong>Midnight Nursery Master Secret Recipe</strong>:
        </p>

        <div className="secret-recipe-card">
          <h4>🍵 Pip's 100% Anti-Nightmare Elixir</h4>
          <ul>
            <li>🥛 1 warm mug of fresh cloud milk</li>
            <li>✨ 3 tablespoons of powdered stardust</li>
            <li>🎀 2 baby giggles (strictly no gloomy thoughts)</li>
            <li>☁️ Stir clockwise with a cinnamon music box key</li>
          </ul>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              sound.playChime(1.5);
              onClose();
            }}
          >
            <Sparkles size={16} />
            <span>Accept Pip's Bedtime Blessing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
