/* ============================================
   User Profiles — Per-user avatar, name, role,
   and preferred voice. Add any known user here.
   Falls back to Google photo + display name
   for users not listed.
   ============================================ */

const USER_PROFILES = {
  'crnicholson1@ncat.edu': {
    displayName: 'Cathy',
    fullName:    'Cathy Nicholson',
    avatar:      'images/Cathy Avatar Image.png',
    role:        'Grant Administrator · CAES',
    preferredVoice: 'Aoede'
  },
  'ncatlandarch@gmail.com': {
    displayName: 'Chris',
    fullName:    'Chris Hopper',
    avatar:      null,   // uses Google profile photo
    role:        'Director · SFRIC',
    preferredVoice: 'Charon'
  }
};

/* Available Gemini TTS voices.
   Users select from these in the avatar panel.
   Voice is saved to localStorage so it persists. */
const GEMINI_VOICES = [
  { id: 'Charon',  label: 'Charon',  desc: 'Deep · Authoritative' },
  { id: 'Aoede',   label: 'Aoede',   desc: 'Warm · Conversational' },
  { id: 'Fenrir',  label: 'Fenrir',  desc: 'Clear · Professional'  },
  { id: 'Kore',    label: 'Kore',    desc: 'Smooth · Calm'         },
  { id: 'Puck',    label: 'Puck',    desc: 'Energetic · Friendly'  },
  { id: 'Zephyr',  label: 'Zephyr',  desc: 'Neutral · Clean'       }
];

/* Returns the profile for the currently signed-in user.
   Falls back gracefully for unknown users. */
function getUserProfile(user) {
  if (!user) return null;
  const email   = user.email?.toLowerCase();
  const known   = USER_PROFILES[email] || {};
  return {
    displayName:    known.displayName    || user.displayName?.split(' ')[0] || 'Researcher',
    fullName:       known.fullName       || user.displayName               || '',
    avatar:         known.avatar         || user.photoURL                  || 'images/grant-avatar.png',
    role:           known.role           || 'NC A&T Researcher',
    preferredVoice: known.preferredVoice || null
  };
}

/* Active voice — reads localStorage, falls back to profile default or Charon */
function getActiveVoice(userEmail) {
  const stored = localStorage.getItem('grant-tts-voice');
  if (stored) return stored;
  const email   = (userEmail || '').toLowerCase();
  const profile = USER_PROFILES[email];
  return profile?.preferredVoice || 'Charon';
}

function setActiveVoice(voiceName) {
  localStorage.setItem('grant-tts-voice', voiceName);
}
