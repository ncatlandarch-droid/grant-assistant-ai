/* ============================================
   User Profiles — Per-user avatar, name, role,
   and preferred voice. Add any known user here.
   Falls back to Google photo + display name
   for users not listed.
   ============================================ */

const USER_PROFILES = {
  'crnicholson1@ncat.edu': {
    displayName:    'Cathy',
    fullName:       'Cathy Nicholson',
    avatar:         'images/Cathy Avatar Image.png',
    formalTitle:    'Grant Administrator',
    department:     'CAES · Office of Sponsored Programs',
    role:           'Grant Administrator · CAES',
    preferredVoice: 'Aoede'
  },
  'ncatlandarch@gmail.com': {
    displayName:    'Chris',
    fullName:       'Chris Hopper',
    avatar:         null,   // uses Google profile photo
    formalTitle:    'Research Operations Manager',
    department:     'SFRIC',
    role:           'Research Operations Manager · SFRIC',
    preferredVoice: 'Charon'
  }
  // To add Charlie: uncomment and fill in his NC A&T email
  // 'charlie@ncat.edu': {
  //   displayName:    'Charlie',
  //   fullName:       'Charlie [LastName]',
  //   formalTitle:    'Research Director',
  //   department:     'CAES',
  //   role:           'Research Director · CAES',
  //   preferredVoice: 'Charon'
  // }
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
   Avatar priority: localStorage upload > Firestore avatarUrl > hardcoded > Google photo > default */
function getUserProfile(user) {
  if (!user) return null;
  const email  = user.email?.toLowerCase();
  const known  = USER_PROFILES[email] || {};
  const fs     = (typeof st !== 'undefined' && st.firestoreProfile) || {};

  // Uploaded photos are stored in localStorage to avoid Firestore size limits
  const localAvatar = localStorage.getItem('grant-avatar-' + user.uid);

  const formalTitle = fs.formalTitle || known.formalTitle || '';
  const department  = fs.department  || known.department  || '';
  const role = (formalTitle || department)
    ? [formalTitle, department].filter(Boolean).join(' · ')
    : (known.role || 'NC A&T Researcher');

  return {
    displayName:    fs.displayName    || known.displayName    || user.displayName?.split(' ')[0] || 'Researcher',
    fullName:       fs.fullName       || known.fullName       || user.displayName               || '',
    avatar:         localAvatar       || fs.avatarUrl         || known.avatar || user.photoURL  || 'images/grant-avatar.png',
    formalTitle,
    department,
    role,
    preferredVoice: fs.preferredVoice || known.preferredVoice || null
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
