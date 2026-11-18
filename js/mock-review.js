/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant — Proprietary and Confidential */
/* ============================================
   Mock Review Panel — AI-Simulated Federal Review
   ============================================ */

// --- Agency Review Criteria ---
const REVIEW_AGENCIES = {
  NSF: {
    name: 'National Science Foundation',
    short: 'NSF',
    icon: '🔬',
    color: '#2563eb',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'im', name:'Intellectual Merit', weight:50, desc:'Potential to advance knowledge within and across fields' },
      { id:'bi', name:'Broader Impacts', weight:50, desc:'Potential to benefit society and contribute to desired outcomes' }
    ],
    sections: [
      { id:'summary', name:'Project Summary', required:true },
      { id:'description', name:'Project Description', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'dmp', name:'Data Management Plan', required:true },
      { id:'biosketch', name:'Biographical Sketch', required:false },
      { id:'facilities', name:'Facilities & Equipment', required:false },
      { id:'references', name:'References Cited', required:false }
    ]
  },
  NIH: {
    name: 'National Institutes of Health',
    short: 'NIH',
    icon: '🏥',
    color: '#0369a1',
    scale: ['1 (Exceptional)','2 (Outstanding)','3 (Excellent)','4 (Very Good)','5 (Good)','6 (Satisfactory)','7 (Fair)','8 (Marginal)','9 (Poor)'],
    criteria: [
      { id:'sig', name:'Significance', weight:20, desc:'Does the project address an important problem?' },
      { id:'inv', name:'Investigator(s)', weight:20, desc:'Are the PD/PIs and collaborators well suited?' },
      { id:'inn', name:'Innovation', weight:20, desc:'Does the project employ novel concepts or approaches?' },
      { id:'app', name:'Approach', weight:20, desc:'Are the strategy, methodology, and analyses well-reasoned?' },
      { id:'env', name:'Environment', weight:20, desc:'Will the scientific environment contribute to success?' }
    ],
    sections: [
      { id:'aims', name:'Specific Aims', required:true },
      { id:'strategy', name:'Research Strategy', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'biosketch', name:'Biographical Sketch', required:false },
      { id:'facilities', name:'Facilities & Equipment', required:false },
      { id:'protection', name:'Protection of Human Subjects', required:false }
    ]
  },
  USDA: {
    name: 'USDA National Institute of Food & Agriculture',
    short: 'USDA NIFA',
    icon: '🌾',
    color: '#15803d',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'merit', name:'Scientific Merit', weight:35, desc:'Soundness of approach, methodology, and expected outcomes' },
      { id:'qual', name:'Qualifications', weight:25, desc:'Competency of project team and institutional support' },
      { id:'mgmt', name:'Project Management', weight:20, desc:'Timeline, milestones, and management plan' },
      { id:'budget', name:'Budget Appropriateness', weight:20, desc:'Reasonable costs aligned with objectives' }
    ],
    sections: [
      { id:'summary', name:'Project Summary', required:true },
      { id:'narrative', name:'Project Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'mgmt', name:'Management Plan', required:false },
      { id:'biosketch', name:'Biographical Sketch', required:false },
      { id:'letters', name:'Letters of Support', required:false }
    ]
  },
  DOE: {
    name: 'Department of Energy',
    short: 'DOE',
    icon: '⚡',
    color: '#9333ea',
    scale: ['Outstanding','Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'tech', name:'Technical Merit', weight:40, desc:'Scientific and technical quality of the proposed research' },
      { id:'feas', name:'Feasibility', weight:30, desc:'Likelihood of achieving objectives within scope' },
      { id:'cost', name:'Cost Effectiveness', weight:30, desc:'Reasonableness and necessity of estimated costs' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Technical Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'milestones', name:'Milestones & Deliverables', required:false },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  DOD: {
    name: 'Department of Defense',
    short: 'DOD',
    icon: '🛡️',
    color: '#1e3a5f',
    scale: ['Outstanding','Excellent','Acceptable','Marginal','Unacceptable'],
    criteria: [
      { id:'tech', name:'Technical Merit', weight:40, desc:'Scientific/engineering rigor and innovation' },
      { id:'mission', name:'Relevance to DOD Mission', weight:30, desc:'Alignment with military/defense research priorities' },
      { id:'team', name:'PI Qualifications & Resources', weight:15, desc:'Team expertise and facilities' },
      { id:'cost', name:'Cost Realism', weight:15, desc:'Reasonable and realistic budget estimates' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Technical Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'biosketch', name:'Biographical Sketch', required:false },
      { id:'facilities', name:'Facilities & Equipment', required:false }
    ]
  },
  ED: {
    name: 'Department of Education',
    short: 'ED',
    icon: '📚',
    color: '#1a5276',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'sig', name:'Significance', weight:25, desc:'Importance of the problem and potential contribution' },
      { id:'design', name:'Quality of Project Design', weight:30, desc:'Conceptual framework, goals, and activities' },
      { id:'eval', name:'Quality of Evaluation', weight:20, desc:'Methods to measure outcomes and impact' },
      { id:'resources', name:'Adequacy of Resources', weight:15, desc:'Personnel, facilities, and institutional support' },
      { id:'mgmt', name:'Quality of Management Plan', weight:10, desc:'Timeline, milestones, and oversight' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Project Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'eval', name:'Evaluation Plan', required:false },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  NASA: {
    name: 'National Aeronautics & Space Administration',
    short: 'NASA',
    icon: '🚀',
    color: '#0b3d91',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'sci', name:'Scientific/Technical Merit', weight:35, desc:'Quality of proposed investigation or study' },
      { id:'rel', name:'Relevance to NASA', weight:25, desc:'Alignment with NASA strategic goals and programs' },
      { id:'feas', name:'Feasibility', weight:20, desc:'Soundness of approach, risk management' },
      { id:'team', name:'Team Qualifications', weight:10, desc:'Expertise and track record of investigators' },
      { id:'cost', name:'Cost Reasonableness', weight:10, desc:'Budget justification and efficiency' }
    ],
    sections: [
      { id:'summary', name:'Project Summary', required:true },
      { id:'description', name:'Science/Technical Description', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'mgmt', name:'Management Approach', required:false },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  EPA: {
    name: 'Environmental Protection Agency',
    short: 'EPA',
    icon: '🌿',
    color: '#0f7b3e',
    scale: ['Excellent','Very Good','Good','Satisfactory','Poor'],
    criteria: [
      { id:'merit', name:'Scientific Merit', weight:35, desc:'Soundness of research approach and methodology' },
      { id:'rel', name:'Relevance to EPA Mission', weight:25, desc:'Environmental and human health protection goals' },
      { id:'feas', name:'Feasibility', weight:20, desc:'Realistic scope, timeline, and deliverables' },
      { id:'team', name:'Qualifications', weight:10, desc:'Investigator expertise and institutional support' },
      { id:'budget', name:'Budget', weight:10, desc:'Cost efficiency and justification' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Research Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'qapp', name:'Quality Assurance Plan', required:false },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  HHS: {
    name: 'Health & Human Services (non-NIH)',
    short: 'HHS',
    icon: '🏥',
    color: '#1d4e89',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'need', name:'Need', weight:25, desc:'Significance of the health/human services problem' },
      { id:'response', name:'Response', weight:30, desc:'Quality of proposed approach and activities' },
      { id:'eval', name:'Evaluative Measures', weight:20, desc:'Methods to assess effectiveness' },
      { id:'impact', name:'Impact', weight:15, desc:'Potential for systemic improvement' },
      { id:'capacity', name:'Organizational Capacity', weight:10, desc:'Applicant ability to execute' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Project Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'eval', name:'Evaluation Plan', required:false },
      { id:'biosketch', name:'Key Personnel', required:false }
    ]
  },
  NOAA: {
    name: 'National Oceanic & Atmospheric Administration',
    short: 'NOAA',
    icon: '🌊',
    color: '#003087',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'rel', name:'Importance & Relevance', weight:30, desc:'Alignment with NOAA strategic plan and priorities' },
      { id:'merit', name:'Technical/Scientific Merit', weight:30, desc:'Quality of methodology and expected outcomes' },
      { id:'team', name:'Qualifications', weight:20, desc:'Expertise, facilities, and partnerships' },
      { id:'cost', name:'Project Costs', weight:10, desc:'Budget appropriateness and cost-sharing' },
      { id:'outreach', name:'Outreach & Education', weight:10, desc:'Broader dissemination and educational impact' }
    ],
    sections: [
      { id:'summary', name:'Project Summary', required:true },
      { id:'narrative', name:'Project Description', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  NIST: {
    name: 'National Institute of Standards & Technology',
    short: 'NIST',
    icon: '⚙️',
    color: '#003366',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'tech', name:'Technical Merit', weight:40, desc:'Quality and innovation of proposed approach' },
      { id:'impact', name:'Potential Impact', weight:25, desc:'Advancement of measurement science and standards' },
      { id:'feas', name:'Feasibility', weight:20, desc:'Realistic plan with clear milestones' },
      { id:'team', name:'Qualifications', weight:15, desc:'PI expertise and resources' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Technical Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  DOT: {
    name: 'Department of Transportation',
    short: 'DOT',
    icon: '🛣️',
    color: '#003768',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'tech', name:'Technical Merit', weight:35, desc:'Quality and rigor of research approach' },
      { id:'rel', name:'Relevance to DOT Goals', weight:25, desc:'Safety, equity, infrastructure, climate' },
      { id:'team', name:'Qualifications & Management', weight:20, desc:'Team expertise and project oversight' },
      { id:'cost', name:'Cost/Price', weight:20, desc:'Budget reasonableness and cost-effectiveness' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Technical Proposal', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'mgmt', name:'Management Plan', required:false },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  DOJ: {
    name: 'Department of Justice',
    short: 'DOJ',
    icon: '⚖️',
    color: '#2d2d6b',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'impact', name:'Impact', weight:30, desc:'Potential to improve criminal/juvenile justice' },
      { id:'design', name:'Project Design', weight:30, desc:'Rigor of methodology and analytical plan' },
      { id:'feas', name:'Feasibility', weight:20, desc:'Realistic scope, timeline, deliverables' },
      { id:'team', name:'Capabilities', weight:10, desc:'PI and organizational competence' },
      { id:'budget', name:'Budget', weight:10, desc:'Reasonable and justified costs' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Program Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'biosketch', name:'Key Personnel', required:false }
    ]
  },
  HUD: {
    name: 'Department of Housing & Urban Development',
    short: 'HUD',
    icon: '🏠',
    color: '#003a70',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'need', name:'Need/Extent of Problem', weight:25, desc:'Documented community need and target population' },
      { id:'approach', name:'Soundness of Approach', weight:35, desc:'Proposed strategies and implementation plan' },
      { id:'capacity', name:'Capacity', weight:20, desc:'Organizational experience and staffing' },
      { id:'leverage', name:'Leveraging Resources', weight:10, desc:'Matching funds and partnerships' },
      { id:'achieve', name:'Achieving Results', weight:10, desc:'Performance measurement and outcomes' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Project Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'capacity', name:'Capacity Statement', required:false }
    ]
  },
  DHS: {
    name: 'Department of Homeland Security',
    short: 'DHS',
    icon: '🦅',
    color: '#003366',
    scale: ['Outstanding','Excellent','Acceptable','Marginal','Unacceptable'],
    criteria: [
      { id:'tech', name:'Technical Merit', weight:35, desc:'Scientific rigor and innovation' },
      { id:'rel', name:'Relevance to DHS Mission', weight:25, desc:'Homeland security application and impact' },
      { id:'team', name:'Team Qualifications', weight:20, desc:'Expertise in cybersecurity, resilience, or related fields' },
      { id:'cost', name:'Cost Realism', weight:20, desc:'Budget appropriateness and efficiency' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Technical Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  NEH: {
    name: 'National Endowment for the Humanities',
    short: 'NEH',
    icon: '📜',
    color: '#7b2d26',
    scale: ['Excellent','Very Good','Good','Some Merit','Does Not Merit'],
    criteria: [
      { id:'sig', name:'Intellectual Significance', weight:35, desc:'Importance of the humanities question or topic' },
      { id:'method', name:'Methodology', weight:25, desc:'Appropriateness and rigor of approach' },
      { id:'team', name:'Qualifications', weight:20, desc:'PI and team expertise in humanities fields' },
      { id:'impact', name:'Impact & Dissemination', weight:10, desc:'Reach and significance of outcomes' },
      { id:'budget', name:'Budget', weight:10, desc:'Reasonableness and efficiency' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Narrative Description', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'biosketch', name:'Biographical Sketch', required:false },
      { id:'work', name:'Work Plan / Timeline', required:false }
    ]
  },
  NEA: {
    name: 'National Endowment for the Arts',
    short: 'NEA',
    icon: '🎨',
    color: '#8b4513',
    scale: ['Excellent','Very Good','Good','Some Merit','Does Not Merit'],
    criteria: [
      { id:'merit', name:'Artistic Excellence & Merit', weight:50, desc:'Quality and significance of proposed artistic work' },
      { id:'capacity', name:'Organizational Capacity', weight:30, desc:'Ability to execute and sustain the project' },
      { id:'budget', name:'Budget Appropriateness', weight:20, desc:'Costs aligned with activities and outcomes' }
    ],
    sections: [
      { id:'abstract', name:'Project Summary', required:true },
      { id:'narrative', name:'Project Description', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'samples', name:'Work Samples', required:false }
    ]
  },
  SBIR: {
    name: 'Small Business Innovation Research (SBIR/STTR)',
    short: 'SBIR/STTR',
    icon: '💡',
    color: '#b45309',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'tech', name:'Technical Merit & Innovation', weight:30, desc:'Soundness of scientific/engineering approach' },
      { id:'comm', name:'Commercial Potential', weight:30, desc:'Market opportunity and commercialization plan' },
      { id:'team', name:'Team Qualifications', weight:20, desc:'PI and team technical expertise' },
      { id:'plan', name:'Phase Plan & Milestones', weight:10, desc:'Realistic R&D plan for Phase I/II' },
      { id:'budget', name:'Budget', weight:10, desc:'Cost reasonableness for proposed work' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Research Plan', required:true },
      { id:'comm', name:'Commercialization Plan', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'biosketch', name:'Biographical Sketch', required:false }
    ]
  },
  IMLS: {
    name: 'Institute of Museum & Library Services',
    short: 'IMLS',
    icon: '🏛️',
    color: '#4a4a8a',
    scale: ['Excellent','Very Good','Good','Fair','Poor'],
    criteria: [
      { id:'just', name:'Project Justification', weight:30, desc:'Need, significance, and national impact' },
      { id:'design', name:'Project Design', weight:30, desc:'Activities, methodology, and innovation' },
      { id:'resources', name:'Project Resources', weight:20, desc:'Personnel, partners, and institutional support' },
      { id:'impact', name:'Broad Impact', weight:20, desc:'Dissemination, sustainability, and replicability' }
    ],
    sections: [
      { id:'abstract', name:'Abstract', required:true },
      { id:'narrative', name:'Project Narrative', required:true },
      { id:'budget', name:'Budget & Justification', required:true },
      { id:'schedule', name:'Schedule of Activities', required:false }
    ]
  }
};

// --- Featured Opportunities (like QEM HEROES) ---
const FEATURED_REVIEW_OPPS = [
  {
    title: 'QEM Research-HEROES Mock Review',
    org: 'Quality Education for Minorities Network',
    desc: 'Free mock review by QEM HEROES Fellows — seasoned researchers and former NSF program officers. Panels mimic the real NSF review process with primary reviewer + 2 additional reviewers.',
    agency: 'NSF',
    icon: '🌟',
    color: '#f59e0b',
    dates: [
      { label: 'Applications Open', date: 'May 15, 2026' },
      { label: 'Q&A Session (Zoom)', date: 'May 22, 2026 · 12pm ET' },
      { label: 'Apply Deadline', date: 'May 29, 2026 · 5pm ET' },
      { label: 'Portal Training', date: 'June 5, 2026' },
      { label: 'Submit Proposal', date: 'June 17, 2026 · 5pm ET' },
      { label: 'Panel Reviews', date: 'June 30 – July 1, 2026' }
    ],
    contact: { name: 'Dr. Christine Wood', email: 'cwood@qem.org' },
    applyUrl: '#',
    zoomUrl: '#'
  }
];

// --- Mock Review State ---
const mrState = {
  agency: null,
  sections: {},
  reviews: null,
  history: [],
  reviewing: false
};

// --- Render ---
function renderMockReview() {
  const el = document.createElement('div');
  el.className = 'mock-review-page';

  // Featured Opportunities
  el.appendChild(renderFeaturedReviewOpps());

  // Section Header
  const hdr = document.createElement('div');
  hdr.className = 'section-header';
  hdr.innerHTML = '<h2>AI Mock <span>Review Panel</span></h2>';
  el.appendChild(hdr);

  const intro = document.createElement('p');
  intro.className = 'mr-intro';
  intro.textContent = 'Simulate a federal agency review panel. Select your target agency, paste your proposal sections, and get scored feedback from 3 AI reviewers — just like a real panel.';
  el.appendChild(intro);

  // Step 1: Agency Selector
  el.appendChild(renderAgencySelector());

  // Step 2: Section Upload (if agency selected)
  if (mrState.agency) {
    el.appendChild(renderSectionUpload());
  }

  // Live Grants.gov Feed (if agency selected)
  if (mrState.agency) {
    el.appendChild(renderGrantsGovFeed());
  }

  // Step 3: Results (if review complete)
  if (mrState.reviews) {
    el.appendChild(renderReviewResults());
  }

  // History
  if (mrState.history.length > 0) {
    el.appendChild(renderReviewHistory());
  }

  // Live Sessions Placeholder
  el.appendChild(renderLiveSessionsPlaceholder());

  return el;
}

// --- Featured Opportunities ---
function renderFeaturedReviewOpps() {
  const wrap = document.createElement('div');
  FEATURED_REVIEW_OPPS.forEach(opp => {
    const card = document.createElement('div');
    card.className = 'mr-featured-card';
    card.innerHTML = `
      <div class="mr-featured-header">
        <div class="mr-featured-icon">${opp.icon}</div>
        <div class="mr-featured-info">
          <div class="mr-featured-badge">Featured: Live Expert Review</div>
          <div class="mr-featured-title">${opp.title}</div>
          <div class="mr-featured-org">${opp.org} · ${opp.agency}</div>
        </div>
      </div>
      <div class="mr-featured-desc">${opp.desc}</div>
      <div class="mr-featured-dates">
        ${opp.dates.map(d => `
          <div class="mr-date-row">
            <span class="mr-date-label">${d.label}</span>
            <span class="mr-date-value">${d.date}</span>
          </div>
        `).join('')}
      </div>
      <div class="mr-featured-actions">
        <a href="${opp.applyUrl}" target="_blank" class="btn btn-primary btn-sm">Apply Now →</a>
        <a href="${opp.zoomUrl}" target="_blank" class="btn btn-secondary btn-sm">Join Q&A Session</a>
        <span class="mr-featured-contact">Contact: ${opp.contact.name} · <a href="mailto:${opp.contact.email}">${opp.contact.email}</a></span>
      </div>
    `;
    wrap.appendChild(card);
  });
  return wrap;
}

// --- Agency Selector ---
function renderAgencySelector() {
  const wrap = document.createElement('div');
  wrap.className = 'mr-step-card';
  wrap.innerHTML = `<div class="mr-step-label"><span class="mr-step-num">1</span> Select Target Agency</div>`;
  const grid = document.createElement('div');
  grid.className = 'mr-agency-grid';

  Object.entries(REVIEW_AGENCIES).forEach(([key, ag]) => {
    const btn = document.createElement('button');
    btn.className = 'mr-agency-btn' + (mrState.agency === key ? ' active' : '');
    btn.style.setProperty('--ag-color', ag.color);
    btn.innerHTML = `
      <div class="mr-agency-icon">${ag.icon}</div>
      <div class="mr-agency-name">${ag.short}</div>
      <div class="mr-agency-full">${ag.name}</div>
    `;
    btn.onclick = () => {
      mrState.agency = key;
      mrState.sections = {};
      mrState.reviews = null;
      render();
    };
    grid.appendChild(btn);
  });

  wrap.appendChild(grid);
  return wrap;
}

// --- Section Upload ---
function renderSectionUpload() {
  const ag = REVIEW_AGENCIES[mrState.agency];
  const wrap = document.createElement('div');
  wrap.className = 'mr-step-card';
  wrap.innerHTML = `
    <div class="mr-step-label"><span class="mr-step-num">2</span> Paste Proposal Sections</div>
    <div class="mr-step-sub">Paste each section's text below. Required sections are marked with <span style="color:#f87171">*</span></div>
  `;

  const grid = document.createElement('div');
  grid.className = 'mr-sections-list';

  ag.sections.forEach(sec => {
    const hasContent = !!mrState.sections[sec.id];
    const item = document.createElement('div');
    item.className = 'mr-section-item' + (hasContent ? ' filled' : '');

    item.innerHTML = `
      <div class="mr-section-header">
        <div class="mr-section-status">${hasContent ? '✅' : '📄'}</div>
        <div class="mr-section-name">${sec.name}${sec.required ? ' <span style="color:#f87171">*</span>' : ''}</div>
        <div class="mr-section-count">${hasContent ? (mrState.sections[sec.id].length.toLocaleString() + ' chars') : ''}</div>
      </div>
      <textarea class="mr-section-input" id="mr-sec-${sec.id}" 
        placeholder="Paste your ${sec.name} text here..."
        rows="4">${mrState.sections[sec.id] || ''}</textarea>
    `;

    const ta = item.querySelector('textarea');
    ta.oninput = () => {
      mrState.sections[sec.id] = ta.value;
      const status = item.querySelector('.mr-section-status');
      const count = item.querySelector('.mr-section-count');
      if (ta.value.trim()) {
        item.classList.add('filled');
        status.textContent = '✅';
        count.textContent = ta.value.length.toLocaleString() + ' chars';
      } else {
        item.classList.remove('filled');
        status.textContent = '📄';
        count.textContent = '';
      }
    };

    grid.appendChild(item);
  });

  wrap.appendChild(grid);

  // Review button
  const reqSections = ag.sections.filter(s => s.required);
  const allReqFilled = reqSections.every(s => mrState.sections[s.id]?.trim());

  const actions = document.createElement('div');
  actions.className = 'mr-actions';
  actions.innerHTML = `
    <button class="btn btn-primary ${!allReqFilled || mrState.reviewing ? 'disabled' : ''}" 
            onclick="runMockReview()" ${!allReqFilled || mrState.reviewing ? 'disabled' : ''}>
      ${mrState.reviewing ? '⏳ Reviewing... (this may take a minute)' : '🔬 Start Panel Review'}
    </button>
    ${!allReqFilled ? '<div class="mr-req-note">Fill all required sections (*) to enable review</div>' : ''}
  `;
  wrap.appendChild(actions);

  return wrap;
}

// --- Run AI Review ---
async function runMockReview() {
  mrState.reviewing = true;
  render();

  const ag = REVIEW_AGENCIES[mrState.agency];
  const sectionText = Object.entries(mrState.sections)
    .filter(([_, v]) => v?.trim())
    .map(([k, v]) => {
      const sec = ag.sections.find(s => s.id === k);
      return `## ${sec?.name || k}\n${v}`;
    }).join('\n\n---\n\n');

  const prompt = `You are simulating a federal grant review panel for the ${ag.name} (${ag.short}).

You are THREE independent reviewers evaluating a proposal. Each reviewer has a different focus:
- **Reviewer 1 (Technical Depth)**: Evaluates scientific rigor, methodology, and theoretical foundation
- **Reviewer 2 (Impact & Significance)**: Evaluates broader impacts, societal benefit, and transformative potential
- **Reviewer 3 (Feasibility & Resources)**: Evaluates budget reasonableness, timeline, team qualifications, and practicality

## ${ag.short} Review Criteria:
${ag.criteria.map(c => `- **${c.name}** (${c.weight}%): ${c.desc}`).join('\n')}

## Rating Scale: ${ag.scale.join(' | ')}

## Proposal Sections:
${sectionText}

---

Respond ONLY with valid JSON in this exact format (no markdown, no backticks):
{
  "overallRating": "${ag.scale[1]}",
  "overallSummary": "2-3 sentence panel consensus summary",
  "reviewers": [
    {
      "id": 1,
      "role": "Technical Depth",
      "criteriaScores": {${ag.criteria.map(c => `"${c.id}": {"rating": "${ag.scale[2]}", "strengths": "...", "weaknesses": "..."}`).join(', ')}},
      "overallRating": "${ag.scale[2]}",
      "narrative": "3-4 sentence overall assessment"
    },
    {
      "id": 2,
      "role": "Impact & Significance",
      "criteriaScores": {${ag.criteria.map(c => `"${c.id}": {"rating": "...", "strengths": "...", "weaknesses": "..."}`).join(', ')}},
      "overallRating": "...",
      "narrative": "..."
    },
    {
      "id": 3,
      "role": "Feasibility & Resources",
      "criteriaScores": {${ag.criteria.map(c => `"${c.id}": {"rating": "...", "strengths": "...", "weaknesses": "..."}`).join(', ')}},
      "overallRating": "...",
      "narrative": "..."
    }
  ],
  "complianceFlags": ["list of missing or incomplete elements"],
  "topImprovements": ["improvement 1", "improvement 2", "improvement 3"],
  "panelDiscussion": "2-3 sentences capturing what the panel would discuss — key debate points"
}`;

  try {
    // Goes through the Netlify proxy so the API key stays server-side.
    const res = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
      } })
    });

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Strip markdown code fences if present
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    const review = JSON.parse(text);
    review._agency = mrState.agency;
    review._timestamp = new Date().toISOString();
    review._version = mrState.history.length + 1;

    mrState.reviews = review;
    mrState.history.push(review);

    // 🎉 Gamification — confetti on successful review
    const isImproved = mrState.history.length > 1 && _mrScoreRank(review.overallRating, ag.scale) < _mrScoreRank(mrState.history[mrState.history.length - 2].overallRating, ag.scale);
    setTimeout(() => {
      if (isImproved) {
        CONFETTI.party();   // Big celebration — score improved on resubmission!
      } else {
        CONFETTI.celebrate(); // Review complete — nice work!
      }
    }, 300);
  } catch (err) {
    console.error('Mock review error:', err);
    alert('Review failed — please check your API key and try again.');
  }

  mrState.reviewing = false;
  render();
}

// --- Review Results ---
function renderReviewResults() {
  const r = mrState.reviews;
  const ag = REVIEW_AGENCIES[r._agency];
  const wrap = document.createElement('div');
  wrap.className = 'mr-step-card mr-results';

  const ratingColor = getRatingColor(r.overallRating, ag.scale);

  wrap.innerHTML = `
    <div class="mr-step-label"><span class="mr-step-num">3</span> Panel Review Results</div>
    
    <div class="mr-overall">
      <div class="mr-overall-badge" style="background:${ratingColor}22;color:${ratingColor};border:2px solid ${ratingColor}">${r.overallRating}</div>
      <div class="mr-overall-summary">${r.overallSummary}</div>
      <div class="mr-overall-meta">Version ${r._version} · ${ag.short} Review · ${new Date(r._timestamp).toLocaleDateString()}</div>
    </div>

    <div class="mr-panel-discussion">
      <div class="mr-panel-label">💬 Panel Discussion</div>
      <div class="mr-panel-text">${r.panelDiscussion}</div>
    </div>

    ${r.reviewers.map(rev => `
      <div class="mr-reviewer-card">
        <div class="mr-reviewer-header">
          <div class="mr-reviewer-badge" style="background:${ag.color}22;color:${ag.color}">Reviewer ${rev.id}</div>
          <div class="mr-reviewer-role">${rev.role}</div>
          <div class="mr-reviewer-rating" style="color:${getRatingColor(rev.overallRating, ag.scale)}">${rev.overallRating}</div>
        </div>
        <div class="mr-reviewer-narrative">${rev.narrative}</div>
        <div class="mr-criteria-grid">
          ${ag.criteria.map(c => {
            const score = rev.criteriaScores?.[c.id] || {};
            return `
              <div class="mr-criterion">
                <div class="mr-criterion-header">
                  <span class="mr-criterion-name">${c.name}</span>
                  <span class="mr-criterion-rating" style="color:${getRatingColor(score.rating, ag.scale)}">${score.rating || '—'}</span>
                </div>
                <div class="mr-criterion-feedback">
                  <div class="mr-fb-row mr-fb-strength"><span class="mr-fb-icon">✅</span>${score.strengths || '—'}</div>
                  <div class="mr-fb-row mr-fb-weakness"><span class="mr-fb-icon">⚠️</span>${score.weaknesses || '—'}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('')}

    <div class="mr-improvements">
      <div class="mr-improvements-title">🎯 Top 3 Improvements to Boost Your Score</div>
      ${(r.topImprovements || []).map((imp, i) => `
        <div class="mr-improvement-item">
          <span class="mr-imp-num">${i + 1}</span>
          <span>${imp}</span>
        </div>
      `).join('')}
    </div>

    ${(r.complianceFlags || []).length > 0 ? `
      <div class="mr-compliance">
        <div class="mr-compliance-title">🚩 Compliance Flags</div>
        ${r.complianceFlags.map(f => `<div class="mr-compliance-item">• ${f}</div>`).join('')}
      </div>
    ` : ''}

    <div class="mr-result-actions">
      <button class="btn btn-secondary btn-sm" onclick="exportReviewPDF()">📄 Export Report PDF</button>
      <button class="btn btn-primary btn-sm" onclick="mrState.reviews=null; render()">🔄 Revise & Resubmit</button>
    </div>
  `;

  return wrap;
}

// --- Rating Color Helper ---
function getRatingColor(rating, scale) {
  if (!rating) return '#888';
  const r = rating.toLowerCase();
  if (r.includes('excellent') || r.includes('outstanding') || r.includes('exceptional') || r.startsWith('1') || r.startsWith('2')) return '#22c55e';
  if (r.includes('very good') || r.startsWith('3') || r.startsWith('4')) return '#3b82f6';
  if (r.includes('good') || r.startsWith('5')) return '#f59e0b';
  if (r.includes('fair') || r.startsWith('6') || r.startsWith('7')) return '#f97316';
  return '#ef4444';
}

/** Score rank (lower = better) for improvement comparison */
function _mrScoreRank(rating, scale) {
  if (!rating) return 99;
  const r = rating.toLowerCase();
  if (r.includes('exceptional') || r.startsWith('1')) return 1;
  if (r.includes('outstanding') || r.startsWith('2')) return 2;
  if (r.includes('excellent') || r.startsWith('3')) return 3;
  if (r.includes('very good') || r.startsWith('4')) return 4;
  if (r.includes('good') || r.startsWith('5')) return 5;
  if (r.includes('satisfactory') || r.startsWith('6')) return 6;
  if (r.includes('fair') || r.startsWith('7')) return 7;
  if (r.includes('marginal') || r.startsWith('8')) return 8;
  if (r.includes('poor') || r.startsWith('9')) return 9;
  return 99;
}

// --- Review History ---
function renderReviewHistory() {
  const wrap = document.createElement('div');
  wrap.className = 'mr-step-card';
  wrap.innerHTML = `
    <div class="mr-step-label"><span class="mr-step-num">📊</span> Review History</div>
    <div class="mr-history-grid">
      ${mrState.history.map((h, i) => {
        const ag = REVIEW_AGENCIES[h._agency];
        const color = getRatingColor(h.overallRating, ag?.scale || []);
        return `
          <div class="mr-history-item" onclick="mrState.reviews=mrState.history[${i}]; render()">
            <div class="mr-hist-version">V${h._version}</div>
            <div class="mr-hist-agency">${ag?.short || '?'}</div>
            <div class="mr-hist-rating" style="color:${color}">${h.overallRating}</div>
            <div class="mr-hist-date">${new Date(h._timestamp).toLocaleDateString()}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  return wrap;
}

// --- Live Sessions Placeholder ---
function renderLiveSessionsPlaceholder() {
  const wrap = document.createElement('div');
  wrap.className = 'mr-step-card mr-live-placeholder';
  wrap.innerHTML = `
    <div class="mr-step-label"><span class="mr-step-num">🎥</span> Live Review Sessions</div>
    <div class="mr-live-content">
      <div class="mr-live-icon">🔜</div>
      <div class="mr-live-title">Coming Soon — Peer-to-Peer Live Reviews</div>
      <div class="mr-live-desc">Schedule live video review sessions with colleagues and mentors. Get real-time feedback from experienced researchers who've served on federal review panels.</div>
    </div>
  `;
  return wrap;
}

// --- PDF Export ---
function exportReviewPDF() {
  if (!mrState.reviews || typeof jspdf === 'undefined') {
    alert('PDF export requires the review to be complete.');
    return;
  }
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  const r = mrState.reviews;
  const ag = REVIEW_AGENCIES[r._agency];
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(0, 70, 132);
  doc.text(`Mock Review Report — ${ag.short}`, 14, y); y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Version ${r._version} · ${new Date(r._timestamp).toLocaleString()}`, 14, y); y += 10;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Overall Rating: ${r.overallRating}`, 14, y); y += 8;

  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(r.overallSummary, 180);
  doc.text(summaryLines, 14, y); y += summaryLines.length * 5 + 8;

  r.reviewers.forEach(rev => {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setTextColor(0, 70, 132);
    doc.text(`Reviewer ${rev.id} — ${rev.role} (${rev.overallRating})`, 14, y); y += 7;
    doc.setFontSize(9);
    doc.setTextColor(60);
    const narr = doc.splitTextToSize(rev.narrative, 180);
    doc.text(narr, 14, y); y += narr.length * 4 + 6;

    ag.criteria.forEach(c => {
      if (y > 260) { doc.addPage(); y = 20; }
      const s = rev.criteriaScores?.[c.id] || {};
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`${c.name}: ${s.rating || '—'}`, 18, y); y += 5;
      doc.setFontSize(8);
      doc.setTextColor(34, 197, 94);
      const str = doc.splitTextToSize(`✓ ${s.strengths || '—'}`, 170);
      doc.text(str, 22, y); y += str.length * 3.5 + 2;
      doc.setTextColor(249, 115, 22);
      const wk = doc.splitTextToSize(`⚠ ${s.weaknesses || '—'}`, 170);
      doc.text(wk, 22, y); y += wk.length * 3.5 + 4;
    });
    y += 4;
  });

  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setTextColor(0, 70, 132);
  doc.text('Top 3 Improvements', 14, y); y += 7;
  (r.topImprovements || []).forEach((imp, i) => {
    doc.setFontSize(9);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(`${i + 1}. ${imp}`, 175);
    doc.text(lines, 18, y); y += lines.length * 4 + 3;
  });

  doc.save(`Mock_Review_${ag.short}_V${r._version}.pdf`);
}

// ===================================================
//  Grants.gov Live Feed — Public API Integration
// ===================================================

/** Map our agency keys to Grants.gov agency codes */
const GRANTS_GOV_AGENCY_MAP = {
  NSF: 'NSF', NIH: 'HHS-NIH', USDA: 'USDA', DOE: 'DOE',
  DOD: 'DOD', ED: 'ED', NASA: 'NASA', EPA: 'EPA',
  HHS: 'HHS', NOAA: 'DOC-NOAA', NIST: 'DOC-NIST',
  DOT: 'DOT', DOJ: 'DOJ', HUD: 'HUD', DHS: 'DHS',
  NEH: 'NEH', NEA: 'NEA', SBIR: '', IMLS: 'IMLS'
};

/** Grants.gov feed cache */
const _grantsCache = {};

function renderGrantsGovFeed() {
  const ag = REVIEW_AGENCIES[mrState.agency];
  const wrap = document.createElement('div');
  wrap.className = 'mr-step-card mr-grants-feed';
  wrap.innerHTML = `
    <div class="mr-step-label"><span class="mr-step-num">📡</span> Live Grants.gov Opportunities — ${ag.short}</div>
    <div class="mr-grants-sub">Open and forecasted federal funding opportunities from <strong>Grants.gov</strong> (updated live)</div>
    <div id="grants-feed-list" class="mr-grants-list">
      <div class="mr-grants-loading">🔄 Loading live opportunities from Grants.gov...</div>
    </div>
  `;

  // Fetch after DOM render
  setTimeout(() => fetchGrantsGov(mrState.agency), 100);

  return wrap;
}

async function fetchGrantsGov(agencyKey) {
  const container = document.getElementById('grants-feed-list');
  if (!container) return;

  // Check cache (5 min TTL)
  const cacheKey = agencyKey;
  if (_grantsCache[cacheKey] && Date.now() - _grantsCache[cacheKey].ts < 300000) {
    renderGrantsList(container, _grantsCache[cacheKey].data, agencyKey);
    return;
  }

  const govCode = GRANTS_GOV_AGENCY_MAP[agencyKey] || '';
  const isSBIR = agencyKey === 'SBIR';

  try {
    const res = await fetch('/api/grants-gov', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'search',
        params: {
          keyword: isSBIR ? 'SBIR STTR' : '',
          agency: isSBIR ? '' : govCode,
          statuses: 'posted|forecasted',
          rows: 15,
          offset: 0,
          sortBy: 'openDate|desc'
        }
      })
    });

    const json = await res.json();
    const opps = json?.data?.oppHits || [];

    _grantsCache[cacheKey] = { data: opps, ts: Date.now() };
    renderGrantsList(container, opps, agencyKey);
  } catch (err) {
    console.error('Grants.gov fetch error:', err);
    container.innerHTML = `
      <div class="mr-grants-error">
        ⚠️ Unable to reach Grants.gov — this may be a temporary outage.
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="fetchGrantsGov('${agencyKey}')">Retry</button>
      </div>
    `;
  }
}

function renderGrantsList(container, opps, agencyKey) {
  if (!opps.length) {
    container.innerHTML = '<div class="mr-grants-empty">No open opportunities found for this agency right now.</div>';
    return;
  }

  const ag = REVIEW_AGENCIES[agencyKey];
  container.innerHTML = `
    <div class="mr-grants-count">${opps.length} open opportunit${opps.length === 1 ? 'y' : 'ies'}</div>
    ${opps.map(opp => `
      <div class="mr-grant-card">
        <div class="mr-grant-title">
          <a href="https://www.grants.gov/search-results-detail/${opp.id}" target="_blank" rel="noopener">${opp.title || 'Untitled'}</a>
        </div>
        <div class="mr-grant-meta">
          <span class="mr-grant-number">${opp.number || ''}</span>
          <span class="mr-grant-status ${opp.oppStatus === 'posted' ? 'posted' : 'forecasted'}">${opp.oppStatus || '?'}</span>
          ${opp.openDate ? `<span class="mr-grant-date">📅 Open: ${opp.openDate}</span>` : ''}
          ${opp.closeDate ? `<span class="mr-grant-date">⏰ Close: ${opp.closeDate}</span>` : ''}
        </div>
        ${opp.agencyName ? `<div class="mr-grant-agency">${opp.agencyName}</div>` : ''}
      </div>
    `).join('')}
    <div class="mr-grants-footer">
      <a href="https://www.grants.gov/search-grants?agencyCode=${GRANTS_GOV_AGENCY_MAP[agencyKey] || ''}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
        View All on Grants.gov →
      </a>
    </div>
  `;
}
