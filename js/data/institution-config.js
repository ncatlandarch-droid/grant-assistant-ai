/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
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

const _activeCollege = (typeof getActiveCollege === 'function') ? getActiveCollege() : { name: 'College of Agriculture & Environmental Sciences', abbreviation: 'CAES' };

const INSTITUTION_CONFIG = {

  // ── Identity ─────────────────────────────────────────────
  institution: {
    name:         'NC Agricultural & Technical State University',
    shortName:    'NC A&T',
    college:      _activeCollege.name,
    abbreviation: _activeCollege.abbreviation,
    website:      'https://www.ncat.edu',
    colleges: [
      { abbrev: 'CAES',  name: 'College of Agriculture & Environmental Sciences' },
      { abbrev: 'CoE',   name: 'College of Engineering' },
      { abbrev: 'CoST',  name: 'College of Science & Technology' },
      { abbrev: 'CAHSS', name: 'College of Arts, Humanities & Social Sciences' },
      { abbrev: 'CHHS',  name: 'John R. & Kathy R. Hairston College of Health & Human Sciences' },
      { abbrev: 'CEd',   name: 'College of Education' },
      { abbrev: 'CoBE',  name: 'Willie A. Deese College of Business & Economics' },
      { abbrev: 'JSNN',  name: 'Joint School of Nanoscience & Nanoengineering' }
    ]
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
    name:    'Grant',
    role:    'AI Grant Assistant',
    image:   'images/grant-avatar.png',
    voice:   'Aoede',
    greeting: "Hello! I'm your AI Grant Assistant for NC A&T CAES. I can help you find funding opportunities, navigate the NOI process, build budgets, and ensure compliance. What would you like to work on today?",
    modes: [],
    // Pre-recorded coaching keys → matching WAV files in assets/audio/
    // Add en-<key>.wav files to enable instant zero-latency playback
    coachingMessages: {
      welcome:     "Hello! I'm your AI Grant Assistant for NC A&T. How can I help you today?",
      keyAdded:    "Gemini API key saved. AI-powered grant coaching is now active.",
      modeCoach:   "Grant Coach mode. I'm here for general guidance and process navigation.",
      modeBudget:  "Budget Advisor mode. Let's work on budgets and IDC calculations.",
      modeCompli:  "Compliance Check mode. Let's review IRB, IACUC, and regulatory requirements.",
      modeWrite:   "Writing Assistant mode. I'll help with narrative development and review."
    }
  },

  // ── Navigation Tabs ───────────────────────────────────────
  navTabs: [
    { id: 'overview',       label: 'Overview' },
    { id: 'dashboard',      label: 'Dashboard' },
    { id: 'pipeline',       label: 'Pipeline' },
    { id: 'noi-wizard',     label: 'NOI Wizard' }
  ],
  navMore: [
    { id: 'opportunities',    label: '🔍 Opportunities' },
    { id: 'research-match',   label: '🔬 Research Match' },
    { id: 'proposal-builder', label: '💡 Idea Builder' },
    { id: 'resources',        label: '📚 Resources' },
    { id: 'learning-center',  label: '🎓 Learning Center' },
    { id: 'mock-review',      label: '📝 Mock Review' },
    { id: 'readiness-studio', label: 'Readiness Studio' },
    { id: 'budget-builder',   label: 'Budget & IDC' },
    { id: 'team-bios',        label: 'Team & ORCID Bios' }
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
