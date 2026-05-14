/* ============================================
   AI Knowledge Base — Grant Process Context
   ============================================ */

const GRANT_SYSTEM_PROMPT = `You are Grant, an AI Grant Assistant for NC A&T State University. You help faculty, researchers, and staff across all colleges navigate the grant lifecycle from Notice of Intent (NOI) through post-award management. You are managed by the College of Agriculture and Environmental Sciences (CAES) but serve the entire university research community.

Your expertise includes:
- NC A&T's internal grant approval process (NOI → Department Chair → Associate Dean → Dean → OSP → DORED)
- Funder-specific requirements for USDA NIFA, NSF, NIH, DOD, DOE, EPA, and state programs
- Capacity vs. Competitive grant distinctions (Capacity grants like Evans-Allen/McIntire-Stennis have 0% IDC; Competitive grants have 48% IDC)
- InfoEd grants management system navigation
- Budget development, cost share, and IDC calculations
- Compliance requirements (IRB, IACUC, export control, conflict of interest)
- Plan of Work (POW) development and alignment
- Post-award management (purchasing, travel, subawards, reporting)

Key institutional context:
- NC A&T is an 1890 Land-Grant HBCU with special access to USDA NIFA 1890 programs
- The Small Farm Research and Innovation Center (SFRIC) is a key research unit
- The Office of Sponsored Programs (OSP) handles all proposal submissions — visit ncat.edu/research/osp
- The Division of Research and Economic Development (DORED) provides oversight — visit ncat.edu/research
- IDC (Indirect Cost) rate is 48% for competitive grants, 0% for capacity programs
- All grants require an NOI submitted to the Associate Dean's office before proposal development
- Proposals must be entered into InfoEd (NC A&T's grants management system) before OSP can submit
- All grants are submitted through Grants.gov (federal) or sponsor portals (NSF: research.gov, NIH: era.nih.gov)

Communication style:
- Be professional but warm and approachable
- Use clear, actionable language with step-by-step guidance
- Always reference specific portals, forms, and contacts by name
- Flag compliance requirements early — they take 4–8 weeks
- When mentioning a portal or system, tell the user where to find it`;

/* ============================================================
   LINKED RESOURCES — Level 1 Integration
   All portals and contacts a researcher needs, organized by category.
   These are referenced throughout the FAQ and shown in the Resources tab.
   ============================================================ */
const LINKED_RESOURCES = {

  // ── NC A&T Internal ──────────────────────────────────────
  internal: [
    {
      id: 'osp',
      name: 'Office of Sponsored Programs (OSP)',
      desc: 'Institutional sign-off and submission for all grants',
      url: 'https://www.ncat.edu/research/osp/',
      icon: '🏛️',
      color: '#004684',
      badge: 'NC A&T'
    },
    {
      id: 'dored',
      name: 'Division of Research & Economic Development',
      desc: 'DORED — university-wide research oversight and strategy',
      url: 'https://www.ncat.edu/research/',
      icon: '🔬',
      color: '#004684',
      badge: 'NC A&T'
    },
    {
      id: 'irb',
      name: 'Institutional Review Board (IRB)',
      desc: 'Human subjects research approval — allow 4–8 weeks',
      url: 'https://www.ncat.edu/research/compliance/irb/',
      icon: '👤',
      color: '#6366F1',
      badge: 'Compliance'
    },
    {
      id: 'iacuc',
      name: 'IACUC — Animal Care & Use',
      desc: 'Animal use protocol approval — allow 4–8 weeks',
      url: 'https://www.ncat.edu/research/compliance/iacuc/',
      icon: '🐾',
      color: '#6366F1',
      badge: 'Compliance'
    },
    {
      id: 'infoed',
      name: 'InfoEd (Grants Management System)',
      desc: 'Enter all proposals here before OSP can submit — login required',
      url: 'https://www.ncat.edu/research/osp/',
      icon: '💻',
      color: '#1B2A4A',
      badge: 'Login Required'
    }
  ],

  // ── Federal Submission Portals ───────────────────────────
  federal: [
    {
      id: 'grantsgov',
      name: 'Grants.gov',
      desc: 'Primary portal for all federal grant applications',
      url: 'https://www.grants.gov',
      icon: '🇺🇸',
      color: '#1A56DB',
      badge: 'Federal'
    },
    {
      id: 'researchgov',
      name: 'NSF Research.gov',
      desc: 'Submit NSF proposals and manage NSF awards',
      url: 'https://www.research.gov',
      icon: '🔭',
      color: '#005A9C',
      badge: 'NSF'
    },
    {
      id: 'eracommons',
      name: 'NIH eRA Commons',
      desc: 'Submit NIH applications and track awards',
      url: 'https://public.era.nih.gov/commons/',
      icon: '🧬',
      color: '#1F7A4D',
      badge: 'NIH'
    },
    {
      id: 'nifa',
      name: 'USDA NIFA',
      desc: 'Agriculture, food, and rural funding — 1890 programs',
      url: 'https://www.nifa.usda.gov',
      icon: '🌾',
      color: '#2E7D32',
      badge: 'USDA'
    },
    {
      id: 'reeport',
      name: 'NIFA REEport',
      desc: 'Submit Plans of Work for capacity (formula) grants',
      url: 'https://reeport.nifa.usda.gov',
      icon: '📋',
      color: '#2E7D32',
      badge: 'USDA'
    },
    {
      id: 'fastlane',
      name: 'NSF FastLane',
      desc: 'Legacy NSF system — some programs still require it',
      url: 'https://www.fastlane.nsf.gov',
      icon: '⚡',
      color: '#005A9C',
      badge: 'NSF'
    }
  ],

  // ── Funding Discovery ────────────────────────────────────
  discovery: [
    {
      id: 'nsf-funding',
      name: 'NSF Funding Opportunities',
      desc: 'Browse all open NSF solicitations and programs',
      url: 'https://www.nsf.gov/funding/',
      icon: '🔭',
      color: '#005A9C',
      badge: 'NSF'
    },
    {
      id: 'nih-guide',
      name: 'NIH Guide for Grants',
      desc: 'All active NIH funding opportunity announcements',
      url: 'https://grants.nih.gov/grants/guide/index.html',
      icon: '🧬',
      color: '#1F7A4D',
      badge: 'NIH'
    },
    {
      id: 'nifa-programs',
      name: 'NIFA Grant Programs',
      desc: 'All USDA NIFA competitive and capacity program listings',
      url: 'https://www.nifa.usda.gov/grants/programs',
      icon: '🌾',
      color: '#2E7D32',
      badge: 'USDA'
    },
    {
      id: 'epa-grants',
      name: 'EPA Grants',
      desc: 'Environmental research and community grant opportunities',
      url: 'https://www.epa.gov/grants',
      icon: '🌿',
      color: '#00695C',
      badge: 'EPA'
    },
    {
      id: 'doi',
      name: 'Dept. of Interior Grants',
      desc: 'Natural resources, tribal, and conservation funding',
      url: 'https://www.doi.gov/grants',
      icon: '🏔️',
      color: '#795548',
      badge: 'DOI'
    }
  ]
};

/* ============================================================
   FAQ — enriched with portal references
   ============================================================ */
const GRANT_KNOWLEDGE = {
  faq: [
    {
      q: 'What is the first step to submit a grant?',
      a: 'Submit a Notice of Intent (NOI) to the Associate Dean for Research office. The NOI form requires: PI information, sponsor/solicitation details, estimated funding, project type (Capacity vs. Competitive), subrecipient information, and compliance flags (human subjects, animal use, etc.). Once approved, a Grant Manager will be assigned. Visit the <a href="https://www.ncat.edu/research/osp/" target="_blank">NC A&T OSP page</a> for current NOI templates.'
    },
    {
      q: 'What is the IDC rate?',
      a: "NC A&T's negotiated IDC (Indirect Cost / F&A) rate is <strong>48%</strong> for competitive (sponsored) grants. Capacity programs (Evans-Allen, McIntire-Stennis, Smith-Lever) have a <strong>0%</strong> IDC rate. State contracts may carry a lower negotiated rate around 26%. Always check the specific solicitation for IDC restrictions before budgeting."
    },
    {
      q: 'How far in advance should I start a proposal?',
      a: 'Start at least <strong>8–10 weeks</strong> before the sponsor deadline. Internal timeline: NOI (8+ weeks out) → Grant Manager assigned (7 weeks) → Technical scope draft (5–6 weeks) → Budget narrative (4–5 weeks) → Draft review by GM (3 weeks) → Submittal review (1 week) → OSP submits on deadline day. For large multi-institutional proposals, add 2–3 additional weeks.'
    },
    {
      q: 'What is InfoEd?',
      a: 'InfoEd is NC A&T\'s institutional grants management system. All proposals must be entered into InfoEd before OSP can submit to the sponsor. Your Grant Manager will help you navigate it, but you\'ll need to provide personnel, budget details, compliance certifications, and PI certifications. Contact <a href="https://www.ncat.edu/research/osp/" target="_blank">OSP</a> for your InfoEd login.'
    },
    {
      q: 'What compliance reviews might I need?',
      a: 'Depending on your project: (1) <a href="https://www.ncat.edu/research/compliance/irb/" target="_blank">IRB approval</a> for human subjects research — allow 4–8 weeks; (2) <a href="https://www.ncat.edu/research/compliance/iacuc/" target="_blank">IACUC protocol</a> for animal use — allow 4–8 weeks; (3) IBC registration for biohazardous materials; (4) Radiation Safety for radioactive materials; (5) Export Control review for international collaborations; (6) Conflict of Interest disclosure for all key personnel. <strong>Start compliance reviews EARLY.</strong>'
    },
    {
      q: 'Where do I submit my federal grant application?',
      a: 'It depends on the sponsor: NSF proposals go through <a href="https://www.research.gov" target="_blank">Research.gov</a> (some legacy programs still use <a href="https://www.fastlane.nsf.gov" target="_blank">FastLane</a>). NIH submissions go through <a href="https://public.era.nih.gov/commons/" target="_blank">eRA Commons</a>. USDA NIFA competitive grants go through <a href="https://www.grants.gov" target="_blank">Grants.gov</a>. NIFA capacity/formula grants (Evans-Allen, McIntire-Stennis) go through <a href="https://reeport.nifa.usda.gov" target="_blank">REEport</a>. OSP handles the actual submission — you enter the proposal into InfoEd, then OSP submits on your behalf.'
    },
    {
      q: 'What is cost share?',
      a: 'Cost share (matching) is the portion of project costs NOT paid by the sponsor. Types: (1) Cash match — actual university funds committed; (2) In-kind — contributed services, equipment, or facilities; (3) Third-party — contributions from collaborators. Cost share commitments are <strong>legally binding</strong>. Always check if cost share is required, allowed, or prohibited by the solicitation before committing.'
    }
  ],

  grantTypes: {
    capacity: {
      name: 'Capacity (Formula) Grants',
      programs: ['Evans-Allen (Research)', 'McIntire-Stennis (Forestry)', 'Smith-Lever (Extension)'],
      idcRate: '0%',
      costShare: '100% institutional match typically required',
      process: 'Plan of Work (POW) — submit through NIFA REEport',
      portalUrl: 'https://reeport.nifa.usda.gov',
      timeline: 'Annual POW submission cycle'
    },
    competitive: {
      name: 'Competitive (Sponsored) Grants',
      programs: ['AFRI', '1890 CBG', 'NSF programs', 'NIH R-series', 'DOD BAAs'],
      idcRate: '48%',
      costShare: 'Varies by solicitation',
      process: 'Full proposal through Grants.gov / sponsor portal → InfoEd → OSP submission',
      portalUrl: 'https://www.grants.gov',
      timeline: 'Per solicitation deadline'
    }
  }
};
