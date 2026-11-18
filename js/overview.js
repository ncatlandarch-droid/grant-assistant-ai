/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================
   Overview — "What Is Granted!" Explainer View
   Layperson-friendly onboarding + feature tour
   ============================================ */

function renderOverview() {
  const el = document.createElement('div');
  el.className = 'overview-view';

  const inst = window.INSTITUTION_CONFIG?.institution;
  const collegeName = inst?.college || 'College of Agriculture & Environmental Sciences';
  const shortName   = inst?.shortName || 'NC A&T';

  // Dynamic guide
  const guide = (typeof getActiveGuide === 'function') ? getActiveGuide() : { id:'grant', name:'Grant', image:'images/grant-avatar.png' };
  const pronoun = guide.id === 'cathy' ? 'she' : 'he';
  const pronoun2 = guide.id === 'cathy' ? 'her' : 'him';
  const possessive = guide.id === 'cathy' ? 'her' : 'his';

  // Active college
  const activeCollege = (typeof getActiveCollege === 'function') ? getActiveCollege() : { id:'caes', abbreviation:'CAES', name:'College of Agriculture & Environmental Sciences' };

  el.innerHTML = `

    <!-- ── HERO SECTION ── -->
    <div class="overview-hero">
      <div class="overview-hero-badge">Welcome to GRANT</div>
      <h1 class="overview-hero-title">Your AI-Powered <span>Grant Assistant</span></h1>
      <p class="overview-hero-sub">
        GRANT helps ${shortName} researchers find funding, prepare proposals, and navigate the university's approval process — with an AI coach who knows the rules, the deadlines, and the paperwork.
      </p>
      <div class="overview-hero-actions">
        <button class="btn btn-primary btn-lg" onclick="setView('dashboard')">🚀 Go to Dashboard</button>
        <button class="btn btn-secondary btn-lg" onclick="document.getElementById('overviewWho').scrollIntoView({behavior:'smooth'})">Learn More ↓</button>
      </div>
    </div>

    <!-- ── TRAINING BANNER ── -->
    <div class="overview-training-banner" onclick="setView('learning-center')" id="overviewTrainingBanner">
      ${_getTrainingBannerContent()}
    </div>

    <!-- ── COLLEGE SELECTOR ── -->
    <div class="overview-section" id="collegeSelector">
      <div class="overview-section-tag">Your College</div>
      <h2 class="overview-section-title">Select Your <span>College</span></h2>
      <p class="overview-section-sub">GRANT tailors funding matches, research suggestions, and resource guidance to your specific academic unit.</p>
      <div class="college-selector-grid">
        ${getAllColleges().map(c => `
          <button class="college-card ${c.id === activeCollege.id ? 'active' : ''}"
                  onclick="setActiveCollege('${c.id}')" title="${c.dean}"
                  style="--college-color: ${c.color}">
            <img src="${c.icon}" alt="" class="college-card-icon" onerror="this.style.display='none'">
            <span class="college-card-abbrev">${c.abbreviation}</span>
            <span class="college-card-name">${c.name}</span>
            <span class="college-card-depts">${c.departments.length} dept${c.departments.length !== 1 ? 's' : ''}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- ── WHAT CAN YOU DO ── -->
    <div class="overview-section">
      <div class="overview-section-tag">What You Can Do</div>
      <h2 class="overview-section-title">Five <span>Core Features</span></h2>
      <p class="overview-section-sub">Everything a researcher needs from idea to submission — in one place.</p>

      <div class="overview-features-grid">

        <div class="overview-feature-card" onclick="setView('opportunities')">
          <div class="overview-feature-icon" style="background:rgba(253,185,39,0.12);color:var(--aggie-gold)">🔍</div>
          <h3>Find Funding</h3>
          <p>Search 230+ grant opportunities pre-loaded for ${shortName}. Filter by sponsor (USDA, NSF, NIH), type (Capacity vs. Competitive), amount, or deadline. Or just tell ${guide.name} your research area and ${pronoun}'ll match you.</p>
          <span class="overview-feature-cta">Browse Opportunities →</span>
        </div>

        <div class="overview-feature-card" onclick="setView('noi-wizard')">
          <div class="overview-feature-icon" style="background:rgba(0,70,132,0.15);color:var(--aggie-blue-light)">📝</div>
          <h3>Start Your NOI</h3>
          <p>The Notice of Intent is the first official step. Our 6-step wizard walks you through every field the Office of Sponsored Programs requires — with AI-generated tips at each stage so you never submit incomplete paperwork.</p>
          <span class="overview-feature-cta">Open NOI Wizard →</span>
        </div>

        <div class="overview-feature-card" onclick="setView('pipeline')">
          <div class="overview-feature-icon" style="background:rgba(42,107,59,0.15);color:var(--caes-green-mid)">📋</div>
          <h3>Track Your Pipeline</h3>
          <p>Every proposal moves through ${shortName}'s 12-stage approval process. The Kanban board shows exactly where each proposal sits — from NOI submission to final sponsor submission — so nothing gets lost or delayed.</p>
          <span class="overview-feature-cta">View Pipeline →</span>
        </div>

        <div class="overview-feature-card" onclick="setView('proposal-builder')">
          <div class="overview-feature-icon" style="background:rgba(99,102,241,0.12);color:#818cf8">💡</div>
          <h3>Drop a Research Idea</h3>
          <p>Have a research concept but don't know where to start? Describe your idea and GRANT will match you with relevant funding programs, draft an abstract, build a timeline, estimate a budget, and flag compliance needs.</p>
          <span class="overview-feature-cta">Launch Idea Analyzer →</span>
        </div>

        <div class="overview-feature-card" style="border-color:rgba(253,185,39,0.15)">
          <div class="overview-feature-icon" style="background:rgba(253,185,39,0.12);color:var(--aggie-gold)">🤝</div>
          <h3>Cross-College Synergies</h3>
          <p>When every college uses GRANT, the system can detect overlapping research topics and suggest cross-college collaborations — turning isolated proposals into stronger, multi-PI submissions that funders prefer.</p>
          <span class="overview-feature-cta" style="color:var(--text-muted)">Coming Soon</span>
        </div>

      </div>
    </div>


    <!-- ── WHO IS THIS FOR ── -->
    <div class="overview-section" id="overviewWho">
      <div class="overview-section-tag">Who Uses GRANT</div>
      <h2 class="overview-section-title">Built for <span>Everyone</span> in the Grant Process</h2>

      <div class="overview-audience-grid">

        <div class="overview-audience-card">
          <div class="audience-icon">🔬</div>
          <h4>Faculty & Principal Investigators</h4>
          <p>Find funding, start NOIs, develop budgets, get writing guidance, and track your proposal through every approval stage — all in one place.</p>
          <div class="audience-example">"What USDA grants fit my soil health research?"</div>
        </div>

        <div class="overview-audience-card">
          <div class="audience-icon">🏛️</div>
          <h4>Department Chairs</h4>
          <p>See all active proposals in your department at a glance. Know which PIs have submissions in progress and where each one sits in the pipeline.</p>
          <div class="audience-example">"Show me all proposals awaiting my signature."</div>
        </div>

        <div class="overview-audience-card">
          <div class="audience-icon">📊</div>
          <h4>OSP Staff & Grant Managers</h4>
          <p>Track compliance reviews, monitor bottlenecks in the 12-stage pipeline, and reduce repetitive questions from PIs who now have an AI coach.</p>
          <div class="audience-example">"Which proposals need IRB review this week?"</div>
        </div>

        <div class="overview-audience-card">
          <div class="audience-icon">🎓</div>
          <h4>New Researchers & Grad Students</h4>
          <p>Never written a grant before? ${guide.name} walks you through every step in plain English. Watch training videos, take short quizzes, and earn a "Grant Ready" badge.</p>
          <div class="audience-example">"I've never applied for a grant. Where do I start?"</div>
        </div>

        <div class="overview-audience-card">
          <div class="audience-icon">👔</div>
          <h4>Deans & Associate Deans for Research</h4>
          <p>Dashboard view of total funding in the pipeline, submission rates, and college-wide research activity. Data-driven oversight without chasing emails.</p>
          <div class="audience-example">"How much total funding is in CAES's pipeline?"</div>
        </div>

        <div class="overview-audience-card">
          <div class="audience-icon">🏫</div>
          <h4>VP for Research / Provost</h4>
          <p>University-wide view across all colleges. Spot cross-college synergies, monitor R1 progress metrics, and see the full institutional research portfolio.</p>
          <div class="audience-example">"Show cross-college collaboration opportunities."</div>
        </div>

      </div>
    </div>

    <!-- ── HOW IT WORKS ── -->
    <div class="overview-section">
      <div class="overview-section-tag">How It Works</div>
      <h2 class="overview-section-title">From Idea to <span>Submission</span> in 5 Steps</h2>

      <div class="overview-journey">
        <div class="journey-step">
          <div class="journey-num">1</div>
          <div class="journey-content">
            <h4>Share Your Research Idea</h4>
            <p>Tell ${guide.name} about your research topic. ${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)}'ll match you with relevant funding programs and suggest a strategy.</p>
          </div>
        </div>
        <div class="journey-connector"></div>
        <div class="journey-step">
          <div class="journey-num">2</div>
          <div class="journey-content">
            <h4>Submit Your NOI</h4>
            <p>Use the guided wizard to complete your Notice of Intent. Submit to your Associate Dean at least 8–10 weeks before the deadline.</p>
          </div>
        </div>
        <div class="journey-connector"></div>
        <div class="journey-step">
          <div class="journey-num">3</div>
          <div class="journey-content">
            <h4>Develop Your Proposal</h4>
            <p>Once approved, OSP assigns a Grant Manager. Use ${guide.name}'s AI to help with budgets, narratives, compliance checks, and timelines.</p>
          </div>
        </div>
        <div class="journey-connector"></div>
        <div class="journey-step">
          <div class="journey-num">4</div>
          <div class="journey-content">
            <h4>Track Through the Pipeline</h4>
            <p>Watch your proposal move through ${shortName}'s 12 approval stages in real time. Get notified when action is needed.</p>
          </div>
        </div>
        <div class="journey-connector"></div>
        <div class="journey-step">
          <div class="journey-num">5</div>
          <div class="journey-content">
            <h4>OSP Submits to Sponsor</h4>
            <p>After all internal approvals, OSP submits your final proposal through the sponsor's portal (Grants.gov, Research.gov, etc.).</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── AI COACH INTRO ── -->
    <div class="overview-section">
      <div class="overview-grant-card">
        <div class="overview-grant-left">
          <img src="${guide.image}" alt="${guide.name} — AI Coach" class="overview-grant-photo">
          <div class="overview-grant-voice-note">🔊 Click ${guide.name}'s photo to hear ${pronoun2} speak</div>
        </div>
        <div class="overview-grant-right">
          <div class="overview-section-tag">Meet Your AI Coach</div>
          <h2 class="overview-section-title" style="margin-top:4px">Hi, I'm <span>${guide.name}</span></h2>
          <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:16px">
            I'm an AI assistant trained on ${shortName}'s grant policies, OSP procedures, funder requirements, and the 12-stage approval pipeline. I speak naturally using AI voice technology — no setup required.
          </p>
          <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:20px">
            Ask me anything: budget calculations, IDC rates, compliance timelines, narrative tips, or just "Where do I start?" I'm here 24/7 so you don't have to wait for office hours.
          </p>
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            <button class="btn btn-primary" onclick="handleChat('Hi ${guide.name}, I\\'m new to the grant process. Can you give me a quick overview of how it works at NC A&T?'); setView('dashboard')">💬 Chat with ${guide.name}</button>
            <button class="btn btn-secondary" onclick="setView('dashboard')">📊 Go to Dashboard</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── UNIVERSITY VISION ── -->
    <div class="overview-section">
      <div class="overview-vision-banner">
        <div class="overview-section-tag" style="color:var(--aggie-gold)">The Vision</div>
        <h2 class="overview-section-title">One Platform. <span>Every College.</span></h2>
        <p style="color:var(--text-secondary); line-height:1.7; max-width:700px; margin:0 auto 24px">
          GRANT is designed to be deployed across all colleges at ${shortName}. Each college gets its own branded portal with the same powerful tools. When every college is connected, the system can detect cross-college research synergies and surface collaboration opportunities that would otherwise be invisible.
        </p>
        <div class="overview-colleges-row">
          <div class="overview-college-chip active"><img src="images/college-icons/icon-agriculture-color.svg" alt="" class="chip-icon"> CAES</div>
          <div class="overview-college-chip"><img src="images/college-icons/icon-engineering-color.svg" alt="" class="chip-icon"> Engineering</div>
          <div class="overview-college-chip"><img src="images/college-icons/icon-health-color.svg" alt="" class="chip-icon"> Health Sciences</div>
          <div class="overview-college-chip"><img src="images/college-icons/icon-science-color.svg" alt="" class="chip-icon"> Sci & Tech</div>
          <div class="overview-college-chip"><img src="images/college-icons/icon-education-color.svg" alt="" class="chip-icon"> Education</div>
          <div class="overview-college-chip"><img src="images/college-icons/icon-business-color.svg" alt="" class="chip-icon"> Business</div>
          <div class="overview-college-chip"><img src="images/college-icons/icon-arts-color.svg" alt="" class="chip-icon"> Liberal Arts</div>
          <div class="overview-college-chip"><img src="images/college-icons/icon-nano-color.svg" alt="" class="chip-icon"> JSNN</div>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:16px">🟢 CAES is live now — additional colleges coming soon</p>
      </div>
    </div>

  `;

  return el;
}

/* ── Training Banner Helper ── */
function _getTrainingBannerContent() {
  const moduleIds = ['grant-process', 'funding-opportunities', 'budget-idc', 'compliance', 'osp-roles', 'collaboration'];
  const totalModules = moduleIds.length;
  let completed = 0;

  // Read from the same store as learning-center.js
  try {
    const progress = JSON.parse(localStorage.getItem('granted_learning_progress') || '{}');
    moduleIds.forEach(id => { if (progress[id]?.passed) completed++; });
  } catch(e) {}

  const pct = Math.round((completed / totalModules) * 100);

  if (completed >= totalModules) {
    return `
      <div class="training-banner-icon">✅</div>
      <div class="training-banner-text">
        <div class="training-banner-title" style="color:var(--aggie-gold)">Grant-Ready Certified!</div>
        <div class="training-banner-sub">You've completed all 6 training modules. Well done, researcher!</div>
      </div>
      <div class="training-banner-badge certified">🏆 Certified</div>
    `;
  }

  const moduleNames = ['Grant Process', 'Funding Sources', 'Budget & IDC', 'Compliance', 'OSP Roles', 'Collaboration'];
  const nextModule = moduleNames[completed] || moduleNames[0];

  return `
    <div class="training-banner-icon">🎓</div>
    <div class="training-banner-text">
      <div class="training-banner-title">Grant-Ready Training</div>
      <div class="training-banner-sub">${completed} of ${totalModules} modules complete · Next: <strong>${nextModule}</strong></div>
      <div class="training-banner-bar">
        <div class="training-banner-fill" style="width:${pct}%"></div>
      </div>
    </div>
    <div class="training-banner-cta">${completed === 0 ? 'Start Learning →' : 'Continue →'}</div>
  `;
}
