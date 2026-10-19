import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../audio/soundEffects';
import { getVisitorProfile, getPipGreeting } from '../utils/visitorMemory';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Moon,
  Volume2,
  VolumeX,
  RefreshCw,
  Heart,
  Wand2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Canonical Pip Rule-Based & AI-Style Dialogue Knowledge Base
const SUGGESTED_QUESTIONS = [
  'Why do you have a skull face?',
  'I cannot sleep tonight...',
  'How do you build dreams?',
  'Tell me a bedtime secret',
  'Weave me a custom dream ✨',
  'Who is Barnaby Bear?',
];

function generatePipResponse(userText, visitor) {
  const lower = userText.toLowerCase().trim();
  const name = visitor.name && visitor.name !== 'Dreamer' ? visitor.name : 'my sleepy friend';

  // 1. Bedtime / Insomnia / Sleep help
  if (
    lower.includes('cant sleep') ||
    lower.includes("can't sleep") ||
    lower.includes('cannot sleep') ||
    lower.includes('insomnia') ||
    lower.includes('awake') ||
    lower.includes('tired')
  ) {
    return {
      text: `Oh ${name}, don't worry! Put your head on a soft pillow and try the 4-7-8 breath: inhale soft lavender for 4 seconds, hold for 7, then exhale all your daytime worries for 8. Would you like me to cue the Chamomile Music Box for you? 🌙`,
      mood: 'soothing',
      action: 'lullaby',
    };
  }

  // 2. Skull face / Identity
  if (
    lower.includes('skull') ||
    lower.includes('skeleton') ||
    lower.includes('bone') ||
    lower.includes('scary') ||
    lower.includes('spooky')
  ) {
    return {
      text: `Hehe, people sometimes think skull babies are spooky, but I am warm as fresh baked honey-bread! My skull is just smooth porcelain, and my eyes are glowing amber pinpricks so I can see through cloudy nightmares. Plus, my starry nightcap keeps my skull cozy! 🎀`,
      mood: 'giggle',
    };
  }

  // 3. Who are you / intro
  if (
    lower.includes('who are you') ||
    lower.includes('what are you') ||
    lower.includes('your name') ||
    lower.includes('introduce')
  ) {
    return {
      text: `I am Pip! Junior Dream Engineer, 4th class, stationed at the Midnight Nursery. I route sleep patterns, weave lullaby frequencies, and invent nightlights for baby hedgehogs, tired developers, and weary souls worldwide! ✨`,
      mood: 'proud',
    };
  }

  // 4. How dreams are made / engineering
  if (
    lower.includes('how do you build') ||
    lower.includes('how dreams') ||
    lower.includes('recipe') ||
    lower.includes('engine')
  ) {
    return {
      text: `Our recipe is strictly confidential (shh!), but between us: 1 cup of cloud vapor, 2 teaspoons of pulverized stardust, 1 drop of warm chamomile extract, and 432 Hz music box resonance! We bake it in the Moon Lantern for 8 minutes and send it out on the Dream Delivery flightpath.`,
      mood: 'whimsical',
    };
  }

  // 5. Secret / Easter Egg
  if (
    lower.includes('secret') ||
    lower.includes('easter egg') ||
    lower.includes('cheat') ||
    lower.includes('hidden')
  ) {
    return {
      text: `Psst, ${name}! Have you tapped the pink ribbon bow on my nightcap yet? Or tried switching the Chaos Mode toggle in the navbar? And if you score 100+ in the Dream Catcher game, the celestial nursery awards you a secret stardust halo! 🌟`,
      mood: 'mysterious',
    };
  }

  // 6. Custom Dream Weaver generator
  if (
    lower.includes('weave') ||
    lower.includes('custom dream') ||
    lower.includes('invent a dream') ||
    lower.includes('make a dream') ||
    lower.includes('dream about')
  ) {
    const topic = lower.replace(/(weave|custom dream|invent a dream|make a dream|dream about)/g, '').trim() || 'floating through warm pink nebula clouds';
    return {
      text: `🌟 *Pip tunes the stardust dials for ${name}...* \n\nTonight, you find yourself adrift in a sky of ${topic}. Gentle pastel lanterns drift alongside you, playing a quiet lullaby in F-sharp. Every heavy thought turns into a floating soap bubble and gently pops into warm lavender scent. Sleep deeply!`,
      mood: 'dreamy',
    };
  }

  // 7. Barnaby Bear lore
  if (lower.includes('barnaby') || lower.includes('bear')) {
    return {
      text: `Barnaby is our nursery's chief slumber tester! He's a giant teddy bear who suffered from 3-week winter insomnia until we hooked up the chamomile music box to his cot. Now he sleeps 14 hours a day and leaves 5-star reviews on my guestbook! 🐻`,
      mood: 'fond',
    };
  }

  // 8. haX.baby / Hackathon / judges
  if (
    lower.includes('hax') ||
    lower.includes('hackathon') ||
    lower.includes('judge') ||
    lower.includes('boss') ||
    lower.includes('tier 3') ||
    lower.includes('legendary')
  ) {
    return {
      text: `Welcome haX.baby hackathon builders and judges! Pip has been running on warm milk and stardust for 48 hours to bring you this Legendary Tier 3 experience: full 3D Three.js character interaction, real live backend guestbook, persistent visitor memory, and interactive chat! 🏆✨`,
      mood: 'excited',
    };
  }

  // 9. Compliment / Cute / Love
  if (
    lower.includes('cute') ||
    lower.includes('adorable') ||
    lower.includes('love') ||
    lower.includes('sweet') ||
    lower.includes('good job')
  ) {
    return {
      text: `*blushes soft baby pink* Oh gosh, thank you ${name}! My cheekbones are glowing extra amber now! Here is a handful of pocket stardust just for you! (*hands you ✦ ★ ✧*)`,
      mood: 'giggle',
    };
  }

  // 10. Nightmares / Fear
  if (
    lower.includes('nightmare') ||
    lower.includes('scared') ||
    lower.includes('monster') ||
    lower.includes('bad dream')
  ) {
    return {
      text: `If a bad dream comes creeping around, remember: nightmares are just silly shadows that forgot their nightlights. My porcelain moon lantern will stand guard at the foot of your bed, and no prickly shadows can enter! 🏮`,
      mood: 'protective',
    };
  }

  // 11. Joke / Funny
  if (lower.includes('joke') || lower.includes('funny') || lower.includes('laugh')) {
    const jokes = [
      "Why did the little skull baby go to sleep early? Because he was dead tired! Hehehe! 💀",
      "What kind of music do sleepy clouds listen to? Heavy mist-ic! ☁️",
      "What did the moon say to the little star? 'Stop shining so bright, you're making me starry-eyed!' ✨",
    ];
    return {
      text: jokes[Math.floor(Math.random() * jokes.length)],
      mood: 'giggle',
    };
  }

  // Default intelligent response with visitor awareness
  const defaults = [
    `That is such a lovely thought, ${name}. In the nursery, we often see dreams like that floating near the starlight ceiling. Tell me, would you like me to weave that into tonight's slumber delivery?`,
    `Pip is nodding with interest! At visit #${visitor.visitCount}, you ask the best questions. Did you know every wish left on our nursery guestbook actually powers our 3D dream lanterns?`,
    `*Pip adjusts starry nightcap* You have the heart of a true Dream Engineer, ${name}. Keep exploring the nursery, and remember to check out the 3D flipbook pages too! 📖`,
  ];

  return {
    text: defaults[Math.floor(Math.random() * defaults.length)],
    mood: 'cozy',
  };
}

export default function PipChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('pip_chat_history_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const visitor = getVisitorProfile();
    const greeting = getPipGreeting(visitor);

    return [
      {
        id: 'msg-init-1',
        sender: 'pip',
        text: greeting.speech,
        time: 'Just now',
        mood: greeting.mood,
      },
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMuted, setChatMuted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Persist chat history
  useEffect(() => {
    try {
      localStorage.setItem('pip_chat_history_v1', JSON.stringify(messages.slice(-30)));
    } catch (e) {}
  }, [messages]);

  const handleOpen = () => {
    sound.playPop();
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    sound.playPop();
    setIsOpen(false);
  };

  const handleSend = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    if (!chatMuted) sound.playPop();

    const visitor = getVisitorProfile();
    const userMsg = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Realistic Pip response delay with typing simulation
    setTimeout(() => {
      const reply = generatePipResponse(text, visitor);
      const pipMsg = {
        id: 'msg-pip-' + Date.now(),
        sender: 'pip',
        text: reply.text,
        time: 'Just now',
        mood: reply.mood,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, pipMsg]);

      if (!chatMuted) {
        if (reply.mood === 'giggle') {
          sound.playBabyGiggle();
        } else {
          sound.playChime(1.1);
        }
      }

      // Star sparkle confetti if dreamy or excited
      if (reply.mood === 'dreamy' || reply.mood === 'excited') {
        try {
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#ffd166', '#ff99c8', '#a34063'],
          });
        } catch (e) {}
      }
    }, 700 + Math.random() * 500);
  };

  const handleClearHistory = () => {
    sound.playPop();
    const visitor = getVisitorProfile();
    const greeting = getPipGreeting(visitor);
    const resetMsgs = [
      {
        id: 'msg-init-' + Date.now(),
        sender: 'pip',
        text: `${greeting.speech} (Memory refreshed!)`,
        time: 'Just now',
        mood: 'curious',
      },
    ];
    setMessages(resetMsgs);
  };

  return (
    <div className="pip-chat-wrapper">
      {/* Floating Messenger Launch Button */}
      {!isOpen && (
        <button
          type="button"
          className="pip-chat-floating-btn animate-bounce-gentle"
          onClick={handleOpen}
          aria-label="Chat with Pip the Skull Baby"
          title="Chat with Pip! Ask anything about dreams, bedtime, or secrets."
        >
          <div className="chat-btn-avatar">
            <img
              src="/pip_avatar_cloud.png"
              alt="Pip character"
              className="chat-avatar-mini"
            />
            <span className="chat-online-indicator" />
          </div>

          <div className="chat-btn-text">
            <strong>Chat with Pip</strong>
            <span>Ask a dream secret ✨</span>
          </div>

          {unreadCount > 0 && (
            <span className="chat-unread-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Floating Bedside Chat Window */}
      {isOpen && (
        <aside className="pip-chat-window animate-scale-up" aria-label="Pip Bedside Intercom">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-profile">
              <div className="chat-avatar-wrap">
                <img
                  src="/pip_avatar_cloud.png"
                  alt="Pip the Skull Baby"
                  className="chat-avatar-img"
                />
                <span className="status-dot-pulse" />
              </div>
              <div className="chat-title-wrap">
                <div className="chat-name-row">
                  <h4>Pip the Skull Baby</h4>
                  <span className="chat-role-pill">Dream Engineer</span>
                </div>
                <p className="chat-status-sub">
                  Online · In character · LocalStorage visitor memory active
                </p>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-action-btn"
                onClick={() => setChatMuted(!chatMuted)}
                title={chatMuted ? 'Unmute chat sounds' : 'Mute chat sounds'}
                aria-label="Toggle chat sounds"
              >
                {chatMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <button
                type="button"
                className="chat-action-btn"
                onClick={handleClearHistory}
                title="Restart dialogue"
                aria-label="Restart conversation"
              >
                <RefreshCw size={14} />
              </button>

              <button
                type="button"
                className="chat-action-btn chat-close-btn"
                onClick={handleClose}
                title="Close chat window"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="chat-prompts-bar">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="chat-prompt-pill"
                onClick={() => handleSend(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="chat-messages-container">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble-row ${
                  m.sender === 'pip' ? 'bubble-pip' : 'bubble-user'
                }`}
              >
                {m.sender === 'pip' && (
                  <div className="bubble-pip-avatar" aria-hidden="true">
                    💀
                  </div>
                )}
                <div className="bubble-content-wrap">
                  <div className="bubble-text">
                    {m.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < m.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="bubble-time-stamp">{m.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-bubble-row bubble-pip">
                <div className="bubble-pip-avatar">💀</div>
                <div className="bubble-typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-text">Pip is weaving words...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chat-input-bar"
          >
            <input
              type="text"
              placeholder="Ask Pip anything (e.g. 'How do you make dreams?')..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              maxLength={200}
              className="chat-text-input"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputVal.trim() || isTyping}
              title="Send bedtime message"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </aside>
      )}
    </div>
  );
}
