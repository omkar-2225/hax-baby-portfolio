import React, { useState, useEffect } from 'react';
import { sound } from '../audio/soundEffects';
import {
  getVisitorProfile,
  recordSessionVisit,
  updateVisitorName,
  getPipGreeting,
  resetVisitorMemory,
  simulateNextVisit,
} from '../utils/visitorMemory';
import { Moon, Sparkles, User, RefreshCw, PlusCircle, Check } from 'lucide-react';

export default function VisitorMemoryBadge() {
  const [profile, setProfile] = useState(() => recordSessionVisit());
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setProfile(getVisitorProfile());
  }, []);

  const greeting = getPipGreeting(profile);

  const handleSaveName = (e) => {
    e.preventDefault();
    sound.playPop();
    const updated = updateVisitorName(tempName);
    setProfile(updated);
    setIsEditing(false);
  };

  const handleReset = () => {
    sound.playPop();
    const fresh = resetVisitorMemory();
    setProfile(fresh);
    setTempName('Dreamer');
  };

  const handleSimulateNextVisit = () => {
    sound.playChime(1.2);
    const bumped = simulateNextVisit();
    setProfile(bumped);
  };

  return (
    <div className="visitor-memory-badge-wrap">
      {/* Mini Top Banner Pill */}
      <button
        type="button"
        className="visitor-memory-trigger"
        onClick={() => {
          sound.playPop();
          setIsExpanded(!isExpanded);
        }}
        title="Pip remembers your visits! Click to view your Bedtime Visitor Record"
        aria-expanded={isExpanded}
        aria-label="Toggle visitor memory details"
      >
        <span className="memory-star-icon">✦</span>
        <span className="memory-text-line">
          <strong>{greeting.badge}</strong>: {profile.name} (Visit #{profile.visitCount})
        </span>
        <span className="memory-caret">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded Memory Panel */}
      {isExpanded && (
        <div className="visitor-memory-popover animate-scale-up" role="dialog" aria-label="Visitor Profile">
          <div className="popover-header">
            <div className="popover-title-row">
              <Sparkles size={16} className="accent-icon" />
              <h4>Pip's Memory of You</h4>
            </div>
            <span className="memory-tag-badge">{greeting.badge}</span>
          </div>

          {/* Pip's In-Character Speech for this Visitor */}
          <div className="pip-memory-quote">
            <div className="quote-pip-avatar">💀</div>
            <p className="quote-speech">"{greeting.speech}"</p>
          </div>

          {/* Visitor Stats Grid */}
          <div className="memory-stats-grid">
            <div className="memory-stat-box">
              <span className="stat-label">Total Visits</span>
              <strong className="stat-val highlight-berry">#{profile.visitCount}</strong>
            </div>
            <div className="memory-stat-box">
              <span className="stat-label">Favorite Melody</span>
              <strong className="stat-val">{profile.favoriteLullaby || 'Chamomile Box'}</strong>
            </div>
            <div className="memory-stat-box">
              <span className="stat-label">Bedtime Moniker</span>
              {isEditing ? (
                <form onSubmit={handleSaveName} className="name-edit-form">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={20}
                    className="name-edit-input"
                    autoFocus
                  />
                  <button type="submit" className="name-save-btn" title="Save name">
                    <Check size={13} />
                  </button>
                </form>
              ) : (
                <div className="name-display-row">
                  <strong className="stat-val">{profile.name}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setIsEditing(true);
                    }}
                    className="name-change-btn"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Row for Judges / Testing */}
          <div className="memory-actions-row">
            <button
              type="button"
              className="memory-action-pill"
              onClick={handleSimulateNextVisit}
              title="Test returning visit dialog without clearing browser cookies"
            >
              <PlusCircle size={13} />
              <span>Simulate Next Visit (+1)</span>
            </button>

            <button
              type="button"
              className="memory-action-pill memory-reset-pill"
              onClick={handleReset}
              title="Reset memory back to fresh 1st visit"
            >
              <RefreshCw size={13} />
              <span>Reset Memory (Visit #1)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
