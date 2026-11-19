/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Compliance & Regulatory Trigger Engine (Pure / Testable) */

const GRANTED_PAGE_LIMITS = {
  'Project Summary': 1,
  'Executive Summary': 1,
  'Problem Statement': 5,
  'Technical Objectives': 3,
  'Work Plan': 5,
  'Phase I Work Plan': 5,
  'Intellectual Merit': 3,
  'Broader Impacts': 3,
  'Commercialization Plan': 5,
  'Project Description': 15,
  'Project Narrative': 15,
  'Budget Justification': 5,
  'Key Personnel': 2,
  'Data Management Plan': 2
};

const GRANTED_NCIDEA_CHAR_LIMITS = {
  'Executive Summary': 3500,
  'Problem': 5000,
  'Solution': 5000,
  'Market Opportunity': 5000,
  'Business Model': 5000,
  'Team': 7000,
  'Use of Funds': 5000
};

const GRANTED_NCIDEA_DISQUALIFIERS = [
  { pattern: /\bfranchis(e|ing|or|ee)\b/i, label: 'Franchise language detected (NC IDEA disqualifier)' },
  { pattern: /\b(not-for-profit|nonprofit|501\(c\))/i, label: 'Nonprofit language detected (NC IDEA disqualifier)' },
  { pattern: /\b(consulting\s+practice|consulting\s+firm|agency\s+model)\b/i, label: 'Consulting/agency model language (NC IDEA disqualifier)' },
  { pattern: /\b(distributor|distribution\s+company)\b/i, label: 'Distributor language detected (NC IDEA disqualifier)' }
];

// USDA NIFA review risk phrases (based on institutional NIFA pre-submission guidance)
const GRANTED_NIFA_FLAGS = [
  { pattern: /\b(guaranteed\s+success|100%\s+effective|zero\s+risk)\b/i, label: 'Overstated certainty ("guaranteed/zero risk") — soften with measurable evaluation metrics' },
  { pattern: /\b(buy\s+land|purchase\s+real\s+estate|new\s+building\s+construction)\b/i, label: 'Unallowable NIFA cost trigger (land purchase / major construction)' },
  { pattern: /\b(lobbying|political\s+advocacy)\b/i, label: 'Unallowable federal activity trigger (lobbying/advocacy)' }
];

const GRANTED_COMPLIANCE_TRIGGERS = [
  {
    id: 'humanSubjects',
    label: 'IRB / Human Subjects',
    pattern: /\b(survey|interview|focus\s+group|human\s+subject|participant|questionnaire|patient|student\s+data|clinical\s+trial|consent\s+form)\b/i,
    guidance: 'Likely requires NC A&T IRB review (Exempt, Expedited, or Full Board) before data collection.'
  },
  {
    id: 'animals',
    label: 'IACUC / Vertebrate Animals',
    pattern: /\b(livestock|cattle|poultry|swine|goat|sheep|mouse|mice|rat|fish|vertebrate|animal\s+trial|iacuc)\b/i,
    guidance: 'Likely requires IACUC animal welfare protocol approval prior to award.'
  },
  {
    id: 'biohazard',
    label: 'IBC / Biosafety',
    pattern: /\b(pathogen|recombinant|dna|crispr|microb|bacteria|virus|biosafety|bsl-?2|toxin|cell\s+line)\b/i,
    guidance: 'Flag for Institutional Biosafety Committee (IBC) review.'
  },
  {
    id: 'exportCtrl',
    label: 'Export Control',
    pattern: /\b(itar|ear|encryption|unmanned\s+aerial|drone|uav|foreign\s+national|international\s+collaborat|satellite|dual-?use)\b/i,
    guidance: 'Check Export Control / Foreign Influence disclosure requirements with DORED.'
  },
  {
    id: 'costShare',
    label: 'Cost Share / Match',
    pattern: /\b(cost[\s-]share|matching\s+funds|in[\s-]kind|institutional\s+match|1:1\s+match)\b/i,
    guidance: 'Cost share requires Associate Dean + OSP pre-approval before submission.'
  }
];

function detectComplianceFlags(text) {
  if (!text || typeof text !== 'string') return [];
  return GRANTED_COMPLIANCE_TRIGGERS
    .filter(t => t.pattern.test(text))
    .map(t => ({ id: t.id, label: t.label, guidance: t.guidance }));
}

function checkProposalCompliance(sectionName, content, track = 'usda-nifa') {
  if (!content || typeof content !== 'string' || !content.trim()) return [];
  const checks = [];

  // 1. Word count
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  checks.push({
    label: `Word count: ${words.toLocaleString()} words`,
    status: words >= 50 ? 'pass' : 'warn',
    pass: words >= 50
  });

  // 2. URLs in federal narratives (NSF/NIH/USDA often restrict active URLs)
  const urls = content.match(/https?:\/\/[^\s]+/gi) || [];
  checks.push({
    label: urls.length ? `${urls.length} URL(s) detected — verify sponsor allows hyperlinks` : 'No raw URLs detected',
    status: urls.length ? 'warn' : 'pass',
    pass: urls.length === 0
  });

  // 3. Unfilled placeholders
  const placeholders = (content.match(/\[[^\]]+\]/g) || []).filter(b =>
    /\[(insert|fill|tbd|todo|your|name|date|amount|xx)/i.test(b)
  );
  checks.push({
    label: placeholders.length ? `${placeholders.length} unfilled placeholder(s) found` : 'No unfilled placeholders',
    status: placeholders.length ? 'fail' : 'pass',
    pass: placeholders.length === 0
  });

  // 4. [VERIFY] anti-hallucination tags remaining
  const verifyTags = content.match(/\[VERIFY[^\]]*\]/gi) || [];
  if (verifyTags.length) {
    checks.push({
      label: `${verifyTags.length} [VERIFY] tag(s) need factual confirmation before submission`,
      status: 'warn',
      pass: false
    });
  }

  // 5. Page-limit check (standard federal sections)
  const limit = GRANTED_PAGE_LIMITS[sectionName];
  if (limit) {
    const estPages = Math.max(1, Math.ceil(content.length / 3000));
    checks.push({
      label: `Page budget: ~${estPages} of ${limit} page(s) max`,
      status: estPages <= limit ? 'pass' : 'fail',
      pass: estPages <= limit
    });
  }

  // 6. Track-specific rules
  if (track === 'nc-idea') {
    const charLimit = GRANTED_NCIDEA_CHAR_LIMITS[sectionName];
    if (charLimit) {
      const pct = Math.round((content.length / charLimit) * 100);
      checks.push({
        label: `NC IDEA limit: ${content.length.toLocaleString()} / ${charLimit.toLocaleString()} chars (${pct}%)`,
        status: content.length <= charLimit ? 'pass' : 'fail',
        pass: content.length <= charLimit
      });
    }
    for (const d of GRANTED_NCIDEA_DISQUALIFIERS) {
      if (d.pattern.test(content)) {
        checks.push({ label: d.label, status: 'fail', pass: false });
      }
    }
    if (sectionName === 'Executive Summary' || sectionName === 'Team') {
      const hasNC = /\b(north carolina|greensboro|raleigh|durham|charlotte|nc)\b/i.test(content);
      checks.push({
        label: hasNC ? 'NC headquarters/presence mentioned' : 'Missing North Carolina headquarters mention (NC IDEA requirement)',
        status: hasNC ? 'pass' : 'warn',
        pass: hasNC
      });
    }
  }

  if (track === 'usda-nifa' || track === 'usda-scri') {
    for (const f of GRANTED_NIFA_FLAGS) {
      if (f.pattern.test(content)) {
        checks.push({ label: f.label, status: 'fail', pass: false });
      }
    }
  }

  return checks;
}

if (typeof window !== 'undefined') {
  window.GRANTED_COMPLIANCE = {
    checkProposalCompliance,
    detectComplianceFlags,
    PAGE_LIMITS: GRANTED_PAGE_LIMITS,
    NCIDEA_CHAR_LIMITS: GRANTED_NCIDEA_CHAR_LIMITS
  };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkProposalCompliance, detectComplianceFlags };
}
