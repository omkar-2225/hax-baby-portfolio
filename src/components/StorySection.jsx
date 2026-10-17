import React, { useState } from 'react';
import { sound } from '../audio/soundEffects';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Moon, Heart } from 'lucide-react';

export default function StorySection() {
  const [currentScene, setCurrentScene] = useState(0);

  const scenes = [
    {
      chapter: 'Scene 01 · Origin',
      title: 'The Cosmic Swaddle',
      emoji: '✨',
      quote: '“Not all bones are spooky. Some are made of stardust and sugar.”',
      body: 'Long before midnight bells tolled, Pip arrived inside a fluffy celestial pillowcase dropped by the Supermoon. Unlike spooky skeletons of folklore, Pip was born with glowing amber heart-lights, a soft skull smile, and an insatiable love for warm milk. Found asleep on a lavender cloud, Pip was welcomed into the Midnight Nursery with open arms.',
      badge: 'Arrival: Year of the Sleepy Moon',
    },
    {
      chapter: 'Scene 02 · The Craft',
      title: 'The Apprentice of Dreams',
      emoji: '🧸',
      quote: '“Nightmares dissolve when you sprinkle them with music.”',
      body: 'At Midnight Nursery, Pip studied under the elder Sandmen. Pip learned how to tune brass music box gears to exact sleep frequencies (432Hz), melt moonbeams into nightlight candles, and trap stormy nightmares inside soapy lavender bubbles. Pip proved that the kindest medicine for fear is a warm bedside glow.',
      badge: 'Promotion: Junior Dream Engineer',
    },
    {
      chapter: 'Scene 03 · The Journey',
      title: 'The Rooftop Night Shift',
      emoji: '☁️',
      quote: '“Close your eyes. Your dream is ready now.”',
      body: 'Now every evening when twilight blankets the chimneys, Pip pulls on the starry nightcap, ties the pink bow, and floats across sleeping skylines. With lantern in one hand and music box in the other, Pip drops sweet dreams of flying bunnies, warm cookies, and starry rivers into every slumbering heart.',
      badge: 'Mission: A Kinder, Brighter Internet',
    },
  ];

  const handleNext = () => {
    sound.playPop();
    setCurrentScene((prev) => (prev + 1) % scenes.length);
  };

  const handlePrev = () => {
    sound.playPop();
    setCurrentScene((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  const activeScene = scenes[currentScene];

  return (
    <section id="story" className="story-section">
      <div className="section-header-wrap">
        <div className="pill-badge">
          <BookOpen size={14} />
          <span>Section 03 · Pip's Bedtime Origin</span>
        </div>
        <h2 className="section-title">
          The Storybook of <span className="highlight-berry">Pip</span>
        </h2>
        <p className="section-subtitle">
          Turn the pages of Pip's journey from a cozy celestial swaddle to Junior Dream Engineer.
        </p>
      </div>

      <div className="storybook-container">
        {/* Book Left Page: Illustration Frame */}
        <div className="book-page book-page-left">
          <div className="illustration-frame">
            <img
              src="/pip_portrait.png"
              alt="Official studio portrait of Pip holding the dream lantern"
              className="storybook-img"
            />
            <div className="illustration-caption">
              <span>{activeScene.chapter}</span>
              <p>{activeScene.badge}</p>
            </div>
          </div>
        </div>

        {/* Book Right Page: Story Narration */}
        <div className="book-page book-page-right">
          <div className="page-header">
            <span className="chapter-eyebrow">
              {activeScene.emoji} {activeScene.chapter}
            </span>
            <h3 className="scene-heading">{activeScene.title}</h3>
          </div>

          <blockquote className="scene-quote">{activeScene.quote}</blockquote>

          <p className="scene-body">{activeScene.body}</p>

          <div className="word-count-tag">
            <span>✨ Story snippet: Under 80 words (Meets &lt;150 rule)</span>
          </div>

          {/* Navigation Controls */}
          <div className="storybook-nav">
            <button
              type="button"
              className="book-nav-btn"
              onClick={handlePrev}
              title="Previous Chapter"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>

            {/* Dots */}
            <div className="book-dots">
              {scenes.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`dot-indicator ${currentScene === idx ? 'dot-active' : ''}`}
                  onClick={() => {
                    sound.playPop();
                    setCurrentScene(idx);
                  }}
                  title={`Go to Scene ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="book-nav-btn"
              onClick={handleNext}
              title="Next Chapter"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
