/* ============================================================
   Institution Configuration — SOP Template
   ─────────────────────────────────────────────────────────────
   HOW TO DEPLOY AT A NEW INSTITUTION:
   1. Copy this file to your fork of the project
   2. Replace every value in INSTITUTION_CONFIG below
   3. Drop your logo into images/logo.png
   4. Drop your AI assistant photo into images/assistant-avatar.png
   5. Update knowledge-base.js with your grant office content
   6. Deploy to Netlify / GitHub Pages — done.
   ============================================================ */

const INSTITUTION_CONFIG = {

  // ── Identity ─────────────────────────────────────────────
  institution: {
    name:         'NC Agricultural & Technical State University',
    shortName:    'NC A&T',
    college:      'College of Agriculture & Environmental Sciences',
    abbreviation: 'CAES',
    website:      'https://www.ncat.edu'
  },

  // ── Branding ─────────────────────────────────────────────
  brand: {
    colors: {
      primary:    '#004684',  // Aggie Blue  — PMS 288, official hex
      accent:     '#FDB927',  // Aggie Gold  — PMS 123, official hex
      secondary:  '#c2c2c2',  // 30% Black   — PMS 7536, official secondary
      caesGreen:  '#2A6B3B'   // CAES green  — agriculture contextual accent
    },
    // Official NC A&T logo from university CDN (white version for dark backgrounds)
    logo:       'https://www.ncat.edu/_global/images/logo-main-white.png',
    logoBlue:   'https://www.ncat.edu/_global/images/logo-main-blue.png',
    favicon:    'images/grant-avatar.png'
  },

  // ── AI Assistant Persona ──────────────────────────────────
  assistant: {
    name:    'Granted!',
    role:    'AI Grant Assistant',
    image:   'images/grant-avatar.png',
    voice:   'Charon',   // Gemini TTS voice — warm professional male
    greeting: "Hello! I'm Granted!, your AI Grant Assistant for NC A&T CAES. I can help you find funding opportunities, navigate the NOI process, build budgets, and ensure compliance. What would you like to work on today?",
    modes: [
      { id: 'coach',      label: 'Grant Coach',     desc: 'General guidance and process navigation' },
      { id: 'budget',     label: 'Budget Advisor',  desc: 'Budget development and IDC calculations' },
      { id: 'compliance', label: 'Compliance Check',desc: 'IRB, IACUC, and regulatory requirements' },
      { id: 'writing',    label: 'Writing Assistant',desc: 'Narrative development and review' }
    ],
    // Pre-recorded coaching keys → matching WAV files in assets/audio/
    // Add en-<key>.wav files to enable instant zero-latency playback
    coachingMessages: {
      welcome:     "Hello! I'm Granted!, your AI Grant Assistant for NC A&T. How can I help you today?",
      keyAdded:    "Gemini API key saved. AI-powered grant coaching is now active.",
      modeCoach:   "Grant Coach mode. I'm here for general guidance and process navigation.",
      modeBudget:  "Budget Advisor mode. Let's work on budgets and IDC calculations.",
      modeCompli:  "Compliance Check mode. Let's review IRB, IACUC, and regulatory requirements.",
      modeWrite:   "Writing Assistant mode. I'll help with narrative development and review."
    }
  },

  // ── Navigation Tabs ───────────────────────────────────────
  navTabs: [
    { id: 'dashboard',      label: '📊 Dashboard' },
    { id: 'opportunities',  label: '🔍 Opportunities' },
    { id: 'research-match', label: '🔬 Research Match' },
    { id: 'pipeline',       label: '📋 Pipeline' },
    { id: 'noi-wizard',     label: '📝 NOI Wizard' },
    { id: 'resources',      label: '📚 Resources' }
  ],

  // ── Grant Office Contact ──────────────────────────────────
  grantOffice: {
    name:         'Office of Sponsored Programs',
    abbreviation: 'OSP',
    phone:        '(336) 334-7995',
    email:        'osp@ncat.edu'
  }
};

window.INSTITUTION_CONFIG = INSTITUTION_CONFIG;
