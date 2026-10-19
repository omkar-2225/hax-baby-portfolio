/**
 * Visitor Memory Engine for Pip the Skull Baby (Tier 3 Legendary)
 * Stores returning-visit memory, interaction count, personalized greetings,
 * and visitor moniker in LocalStorage.
 */

const STORAGE_KEY = 'pip_visitor_memory_v1';
const SESSION_FLAG = 'pip_session_registered';

export function getVisitorProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return ensureProfileIntegrity(parsed);
    }
  } catch (e) {
    console.warn('Could not read visitor memory:', e);
  }

  // Initial fresh profile
  const fresh = {
    name: 'Dreamer',
    visitCount: 1,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    previousVisitDate: null,
    favoriteLullaby: 'Chamomile Music Box',
    dreamsCaught: 0,
    interactionsCount: 0,
    hasFoundEasterEgg: false,
    customNotes: [],
  };

  saveProfile(fresh);
  return fresh;
}

function ensureProfileIntegrity(profile) {
  return {
    name: profile.name || 'Dreamer',
    visitCount: Math.max(1, profile.visitCount || 1),
    firstSeen: profile.firstSeen || new Date().toISOString(),
    lastSeen: profile.lastSeen || new Date().toISOString(),
    previousVisitDate: profile.previousVisitDate || null,
    favoriteLullaby: profile.favoriteLullaby || 'Chamomile Music Box',
    dreamsCaught: profile.dreamsCaught || 0,
    interactionsCount: profile.interactionsCount || 0,
    hasFoundEasterEgg: Boolean(profile.hasFoundEasterEgg),
    customNotes: profile.customNotes || [],
  };
}

function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Could not save visitor memory:', e);
  }
}

/**
 * Call on app load to log session visits
 */
export function recordSessionVisit() {
  const profile = getVisitorProfile();
  const sessionKey = sessionStorage.getItem(SESSION_FLAG);

  if (!sessionKey) {
    // New browser session! Increment visit count
    sessionStorage.setItem(SESSION_FLAG, 'true');
    profile.previousVisitDate = profile.lastSeen;
    profile.lastSeen = new Date().toISOString();
    profile.visitCount += 1;
    saveProfile(profile);
  }

  return profile;
}

export function updateVisitorName(newName) {
  const profile = getVisitorProfile();
  const trimmed = (newName || '').trim().slice(0, 30);
  profile.name = trimmed || 'Dreamer';
  saveProfile(profile);
  return profile;
}

export function recordLullabyChoice(songName) {
  const profile = getVisitorProfile();
  profile.favoriteLullaby = songName;
  saveProfile(profile);
  return profile;
}

export function recordPipInteraction(type = 'poke') {
  const profile = getVisitorProfile();
  profile.interactionsCount = (profile.interactionsCount || 0) + 1;
  saveProfile(profile);
  return profile;
}

export function recordEasterEggFound() {
  const profile = getVisitorProfile();
  profile.hasFoundEasterEgg = true;
  saveProfile(profile);
  return profile;
}

export function resetVisitorMemory() {
  try {
    sessionStorage.removeItem(SESSION_FLAG);
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  return getVisitorProfile();
}

export function simulateNextVisit() {
  const profile = getVisitorProfile();
  profile.previousVisitDate = profile.lastSeen;
  profile.lastSeen = new Date().toISOString();
  profile.visitCount += 1;
  saveProfile(profile);
  return profile;
}

/**
 * Generate in-character custom greeting from Pip based on visit count,
 * time of day, and saved profile.
 */
export function getPipGreeting(profile) {
  const hour = new Date().getHours();
  const name = profile.name && profile.name !== 'Dreamer' ? profile.name : 'friend';
  const count = profile.visitCount;

  // Night Owl special (11 PM - 5 AM)
  const isNightOwl = hour >= 23 || hour < 5;

  if (count <= 1) {
    if (isNightOwl) {
      return {
        badge: '✨ Midnight First Visit',
        tagline: 'Pip hears your quiet footsteps in the nursery...',
        speech: `Shh... hello ${name}! Are you up late too? I'm Pip, the nursery's junior dream engineer. Welcome to your very first bedtime visit!`,
        mood: 'curious',
      };
    }
    return {
      badge: '✨ First Visit to Midnight Nursery',
      tagline: 'A new dreamer has arrived at the star gates!',
      speech: `Hello ${name}! Welcome to the Midnight Nursery. I'm Pip, and I craft the warm dreams you fall asleep inside!`,
      mood: 'welcoming',
    };
  }

  if (count === 2) {
    return {
      badge: `🌙 Welcome Back (Visit #2)`,
      tagline: `Pip recognized your heartbeat rhythm!`,
      speech: `Look who came back! Hello again, ${name}! I kept your favorite star glowing on the ceiling while you were away.`,
      mood: 'happy',
    };
  }

  if (count >= 3 && count < 6) {
    return {
      badge: `🌟 Regular Dreamer (Visit #${count})`,
      tagline: `Pip saved a warm cup of chamomile star-tea for you!`,
      speech: `Welcome back, ${name}! Visit number ${count}! At this rate, the Nursery elders will have to promote you to Senior Slumber Specialist!`,
      mood: 'excited',
    };
  }

  // 6+ Visits: Legendary VIP
  return {
    badge: `👑 Legendary Nursery VIP (Visit #${count})`,
    tagline: `Pip's favorite returning soul!`,
    speech: `My favorite human ${name} has returned! Visit #${count}! The dream lanterns are shining in your honor tonight. Take a deep breath and stay cozy!`,
    mood: 'legendary',
  };
}
