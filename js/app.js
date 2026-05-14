/* ============================================
   App — Core State & Render Dispatcher
   ============================================ */

// Global state
const st = {
  view: 'dashboard',
  avatarMode: 'coach',
  messages: [],
  activeOpportunity: null,
  oppSearch: '',
  oppFilters: {},
  wizardStep: 0,
  noiData: {},
  _greeting: null,
  submissions:   [],   // live Firestore submissions
  currentUser:   null,
  isAdmin:       false,
  pipelineView:  'kanban',             // 'kanban' | 'table'
  tableSort:     { col: 'submittedAt', dir: 'desc' },
  tableFilter:   { search: '', stage: '' }
};

// --- DOM Helper ---
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el[k] = v;
    else el.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  });
  return el;
}

// --- View Routing ---
function setView(view) {
  st.view = view;
  if (view !== 'pipeline') st.activeOpportunity = null;
  render();
}

// --- Overview strip (collapsible, no permanent storage) ---
function toggleOverview() {
  const body = document.getElementById('overviewBody');
  const btn  = document.getElementById('overviewToggle');
  if (!body) return;
  const collapsed = body.style.display === 'none';
  body.style.display = collapsed ? '' : 'none';
  btn.textContent   = collapsed ? '▲ Hide' : '▼ Show';
}

// --- Proposal Builder ---
function launchProposalBuilder() {
  const idea = document.getElementById('ideaInput')?.value?.trim();
  if (!idea) return;

  // Keyword search using actual data fields (title, program, piDept, sponsor)
  const keywords = idea.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const matches = OPPORTUNITIES_DATA.filter(o => {
    const haystack = [o.title, o.program, o.piDept, o.sponsor, o.type]
      .filter(Boolean).join(' ').toLowerCase();
    return keywords.some(kw => haystack.includes(kw));
  }).slice(0, 6);

  // Pre-fill NOI wizard title so it's ready when they click through
  st.noiData = { ...st.noiData, title: idea };

  // Pre-set opportunity search term
  if (keywords.length > 0) st.oppSearch = keywords[0];

  const oppContext = matches.length
    ? matches.map(o => `• ${o.title} — ${o.sponsor}, $${Number(o.estimatedFunding || 0).toLocaleString()}, ${o.type}`).join('\n')
    : '• No exact matches in database — recommend broadly relevant external programs';

  const fullPrompt = `A researcher at NC A&T CAES has this research idea:\n\n"${idea}"\n\nRelevant opportunities already in our database:\n${oppContext}\n\nPlease respond with four clearly labeled sections:\n\n**1. Funding Match** — List 3–5 specific grant programs that fit this idea. Reference the database entries above if they align, and suggest others you know.\n\n**2. NOI Abstract** — Write a 150-word project abstract ready to paste into the NC A&T Notice of Intent form.\n\n**3. Compliance Needs** — Flag any IRB, IACUC, environmental, or export control reviews this project would require.\n\n**4. Submission Timeline** — Provide a 5-step countdown (e.g. "10 weeks out: submit NOI…") based on a typical NC A&T grant cycle.\n\nBe specific and actionable.`;

  document.getElementById('ideaInput').value = '';
  handleProposalChat(idea, matches, fullPrompt);
}

// --- Dashboard ---
function renderDashboard() {
  const el = document.createElement('div');
  const stats = computeOppStats();
  const active = OPPORTUNITIES_DATA.filter(o => o.stage < 12);
  const inst = window.INSTITUTION_CONFIG?.institution;
  el.innerHTML = `

    <!-- ── OVERVIEW STRIP (always shown, collapsible) ── -->
    <div class="overview-strip" id="overviewStrip">
      <div class="overview-header">
        <div class="overview-what-label">What is Grant AI?</div>
        <button class="overview-toggle" id="overviewToggle" onclick="toggleOverview()">▲ Hide</button>
      </div>
      <div id="overviewBody" class="overview-body">
        <div class="overview-layout">
          <div class="overview-what">
            <p>An AI-powered portal for ${inst?.shortName || 'NC A&T'} researchers — find funding, build proposals, and track grants through the university's 12-stage approval process. No grant experience required.</p>
          </div>
          <div class="overview-steps">
            <div class="ov-step"><span class="ov-icon">🔍</span><span class="ov-label">Find Funding</span></div>
            <span class="ov-arrow">→</span>
            <div class="ov-step"><span class="ov-icon">📝</span><span class="ov-label">Start Your NOI</span></div>
            <span class="ov-arrow">→</span>
            <div class="ov-step"><span class="ov-icon">📋</span><span class="ov-label">Track Pipeline</span></div>
            <span class="ov-arrow">→</span>
            <div class="ov-step"><span class="ov-icon">🤖</span><span class="ov-label">Ask Grant</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── PROPOSAL BUILDER ── -->
    <div class="proposal-builder">
      <div class="pb-icon">💡</div>
      <div class="pb-content">
        <div class="pb-title">Describe your research idea</div>
        <div class="pb-sub">Grant will match funding opportunities, draft your NOI abstract, flag compliance needs, and build your submission timeline — instantly.</div>
        <div class="pb-input-wrap">
          <textarea id="ideaInput" class="pb-input" rows="2"
            placeholder="e.g. I want to study the impact of cover crops on soil carbon sequestration in small farms across the Southeast..."></textarea>
          <button class="pb-btn" onclick="launchProposalBuilder()">Get Matched →</button>
        </div>
      </div>
    </div>

    <!-- Welcome Banner -->
    <div class="welcome-banner">
      <div class="welcome-banner-inner">
        <div class="welcome-text">
          <div class="welcome-tag">${inst?.shortName || 'NC A&T'} · ${inst?.college || 'CAES'}</div>
          <h1 class="welcome-title">AI Grant <span>Assistant</span></h1>
          <p class="welcome-sub">Your intelligent partner for the full grant lifecycle — from funding discovery to post-award management.</p>
          <div class="welcome-actions">
            <button class="btn btn-primary" onclick="setView('noi-wizard')">Start New NOI</button>
            <button class="btn btn-secondary" onclick="setView('opportunities')">Browse Funding</button>
            <button class="btn btn-secondary" onclick="setView('resources')">How It Works</button>
          </div>
        </div>
        <div class="welcome-stats">
          <div class="welcome-stat" onclick="setView('opportunities')" style="cursor:pointer">
            <div class="welcome-stat-val">${stats.total}</div>
            <div class="welcome-stat-label">Opportunities</div>
          </div>
          <div class="welcome-stat" onclick="setView('pipeline')" style="cursor:pointer">
            <div class="welcome-stat-val">${active.length}</div>
            <div class="welcome-stat-label">Active Pipeline</div>
          </div>
          <div class="welcome-stat">
            <div class="welcome-stat-val">$${(stats.totalFunding / 1000000).toFixed(1)}M</div>
            <div class="welcome-stat-label">Total Requested</div>
          </div>
          <div class="welcome-stat">
            <div class="welcome-stat-val">${stats.byStage[12] || 0}</div>
            <div class="welcome-stat-label">Submitted</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-header" style="margin-top:24px">
      <h2>Quick <span>Actions</span></h2>
    </div>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:24px">
      <div class="action-card" onclick="setView('noi-wizard')">
        <div class="action-icon" style="background:rgba(0,70,132,0.25)">📝</div>
        <div class="action-label">Start NOI</div>
        <div class="action-sub">Submit a Notice of Intent</div>
      </div>
      <div class="action-card" onclick="setView('opportunities')">
        <div class="action-icon" style="background:rgba(253,185,39,0.15)">🔍</div>
        <div class="action-label">Browse Funding</div>
        <div class="action-sub">${stats.total} opportunities available</div>
      </div>
      <div class="action-card" onclick="setView('pipeline')">
        <div class="action-icon" style="background:rgba(34,197,94,0.15)">📋</div>
        <div class="action-label">View Pipeline</div>
        <div class="action-sub">${active.length} proposals in progress</div>
      </div>
      <div class="action-card" onclick="setView('resources')">
        <div class="action-icon" style="background:rgba(99,102,241,0.2)">🔗</div>
        <div class="action-label">Resources & Portals</div>
        <div class="action-sub">OSP, Grants.gov, NIH, NSF</div>
      </div>
    </div>

    <div class="section-header">
      <h2>By <span>Sponsor</span></h2>
    </div>
    <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin-bottom:24px">
      ${Object.entries(stats.bySponsor).sort((a, b) => b[1] - a[1]).map(([sponsor, count]) => `
        <div class="card" style="text-align:center; cursor:pointer; padding:16px"
             onclick="st.oppFilters={sponsor:'${sponsor}'}; setView('opportunities')">
          <div style="font-size:1.6rem; font-weight:900; background:linear-gradient(135deg,var(--aggie-gold),var(--aggie-gold-light));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">${count}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px">${sponsor}</div>
        </div>
      `).join('')}
    </div>

    <div class="section-header">
      <h2>Pipeline <span>Status</span></h2>
    </div>
    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:24px">
      ${PIPELINE_STAGES.map(s => {
        const count = stats.byStage[s.id] || 0;
        return `<div style="flex:1; min-width:64px; text-align:center; padding:10px 6px; border-radius:var(--radius-sm); background:var(--bg-glass); border:1px solid var(--border); transition:all 0.2s" onmouseover="this.style.borderColor='${s.color}'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="font-size:1.1rem; font-weight:800; color:${s.color}">${count}</div>
          <div style="font-size:0.62rem; color:var(--text-muted); margin-top:2px">${s.short}</div>
        </div>`;
      }).join('')}
    </div>
  `;

  return el;
}

// --- Resources ---
function renderResources() {
  const el = document.createElement('div');

  function portalCards(list) {
    return list.map(p => `
      <a href="${p.url}" target="_blank" rel="noopener" class="portal-card">
        <div class="portal-icon" style="background:${p.color}22; color:${p.color}">${p.icon}</div>
        <div class="portal-info">
          <div class="portal-name">${p.name}</div>
          <div class="portal-desc">${p.desc}</div>
        </div>
        <span class="portal-badge" style="background:${p.color}22; color:${p.color}">${p.badge}</span>
        <span class="portal-arrow">↗</span>
      </a>
    `).join('');
  }

  el.innerHTML = `
    <div class="section-header">
      <h2>Resources &amp; <span>Portals</span></h2>
    </div>

    <!-- ── HOW TO USE THIS TOOL ── -->
    <div class="how-to-card">
      <div class="how-to-header">
        <span class="how-to-icon">🎓</span>
        <div>
          <div class="how-to-title">How to Use Grant AI</div>
          <div class="how-to-sub">Start with the dialogue box on the left — everything flows from there</div>
        </div>
      </div>
      <div class="how-to-steps">

        <div class="how-to-step" style="background:rgba(253,185,39,0.05);border:1px solid rgba(253,185,39,0.2);border-radius:10px;padding:16px 16px 16px 0;margin-bottom:4px">
          <div class="step-num" style="background:var(--aggie-gold);color:#1a0e00">1</div>
          <div class="step-body">
            <div class="step-title" style="color:var(--aggie-gold)">Start Here — The Dialogue Box</div>
            <div class="step-desc">The chat input at the bottom left <strong>is your entry point to everything.</strong> Type your research idea, a question about grants, a funder name, a compliance question — anything. As soon as you type and press Enter, Grant responds and the experience begins.<br><br>
            <em>Try: "I want to study digital twins for landscape architecture conservation planning" — Grant will find matching opportunities, draft your NOI abstract, flag compliance needs, and build your submission timeline.</em></div>
          </div>
        </div>

        <div class="how-to-step">
          <div class="step-num">2</div>
          <div class="step-body">
            <div class="step-title">Find Funding by Keyword</div>
            <div class="step-desc">Go to <strong>Opportunities</strong> and type any keyword into the search bar — PI name, department, topic, sponsor, or program. The search looks across every field at once, so "landscape architecture USDA" returns all relevant records. You can also just ask Grant: <em>"What USDA grants are available for food systems research?"</em> — he'll search and explain at the same time.</div>
          </div>
        </div>

        <div class="how-to-step">
          <div class="step-num">3</div>
          <div class="step-body">
            <div class="step-title">Submit a Notice of Intent (NOI)</div>
            <div class="step-desc">Click <strong>NOI Wizard</strong> and follow the 6-step form. The NOI must be submitted to your Associate Dean for Research <strong>at least 8–10 weeks</strong> before the sponsor deadline. Once approved, OSP assigns you a Grant Manager. Use <strong>Research Match</strong> to upload your abstract and auto-fill the NOI from your own document.</div>
          </div>
        </div>

        <div class="how-to-step">
          <div class="step-num">4</div>
          <div class="step-body">
            <div class="step-title">Track Your Proposal Through the Pipeline</div>
            <div class="step-desc">The <strong>Pipeline</strong> board shows every proposal across NC A&T's 12-stage approval process — from NOI submission through sponsor award. Sign in with Google to see only your proposals. OSP admins advance stages and leave notes you can read in real time.</div>
          </div>
        </div>

        <div class="how-to-step">
          <div class="step-num">5</div>
          <div class="step-body">
            <div class="step-title">Switch Grant's Mode for Focused Help</div>
            <div class="step-desc">Use the mode chips above the chat to focus Grant on a specific task: <strong>Coach</strong> for general guidance, <strong>Budget</strong> for IDC rates and cost calculations, <strong>Compliance</strong> for IRB/IACUC/export control questions, <strong>Writing</strong> for narrative tips and abstract drafts. Grant also speaks every response aloud — click 🔊 to toggle voice.</div>
          </div>
        </div>

        <div class="how-to-step">
          <div class="step-num">6</div>
          <div class="step-body">
            <div class="step-title">Submit Through Federal Portals</div>
            <div class="step-desc">Use the portal links below to open Grants.gov, NSF Research.gov, NIH eRA Commons, and USDA NIFA directly. All federal proposals ultimately go through these portals — OSP submits on your behalf after your proposal clears all 12 internal stages in InfoEd.</div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── NC A&T INTERNAL ── -->
    <div class="section-header" style="margin-top:24px">
      <h2>NC A&T <span>Internal</span></h2>
    </div>
    <div class="portal-grid">${portalCards(LINKED_RESOURCES.internal)}</div>

    <!-- ── FEDERAL PORTALS ── -->
    <div class="section-header" style="margin-top:24px">
      <h2>Federal Submission <span>Portals</span></h2>
    </div>
    <div class="portal-grid">${portalCards(LINKED_RESOURCES.federal)}</div>

    <!-- ── FUNDING DISCOVERY ── -->
    <div class="section-header" style="margin-top:24px">
      <h2>Funding <span>Discovery</span></h2>
    </div>
    <div class="portal-grid">${portalCards(LINKED_RESOURCES.discovery)}</div>

    <!-- ── GRANT PROCESS REFERENCE ── -->
    <div class="section-header" style="margin-top:24px">
      <h2>12-Stage <span>Process</span></h2>
    </div>
    <div class="card">
      <div class="card-subtitle" style="margin-bottom:14px">NC A&T internal approval pipeline — every grant follows these stages</div>
      ${PIPELINE_STAGES.map((s, i) => `
        <div style="display:flex; align-items:center; gap:12px; padding:8px 0; ${i < PIPELINE_STAGES.length - 1 ? 'border-bottom:1px solid var(--border-subtle)' : ''}">
          <div style="width:28px;height:28px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;color:white;font-size:0.72rem;font-weight:800;flex-shrink:0">${s.id}</div>
          <div style="flex:1">
            <div style="font-size:0.84rem; font-weight:600; color:var(--text-primary)">${s.name}</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:1px">${s.desc}</div>
          </div>
          ${i === 0 ? '<span style="font-size:0.7rem;color:var(--aggie-gold);font-weight:600">START HERE</span>' : ''}
          ${i === PIPELINE_STAGES.length - 1 ? '<span style="font-size:0.7rem;color:var(--success);font-weight:600">COMPLETE</span>' : ''}
        </div>
      `).join('')}
    </div>

  `;
  return el;
}

// --- Main Render ---
function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  // Header
  app.appendChild(renderHeader());

  // Body (3 columns)
  const body = document.createElement('div');
  body.className = 'app-body';

  // Col 1: Avatar + Chat
  body.appendChild(renderAvatarPanel());

  // Col 2: Workspace
  const workspace = document.createElement('main');
  workspace.className = 'col-workspace';
  switch (st.view) {
    case 'dashboard': workspace.appendChild(renderDashboard()); break;
    case 'opportunities':  workspace.appendChild(renderOpportunities()); break;
    case 'research-match': workspace.appendChild(renderDocumentAnalysis()); break;
    case 'pipeline':       workspace.appendChild(renderPipeline()); break;
    case 'noi-wizard': workspace.appendChild(renderNOIWizard()); break;
    case 'resources': workspace.appendChild(renderResources()); break;
    default: workspace.appendChild(renderDashboard());
  }
  body.appendChild(workspace);

  // Col 3: Checklist
  body.appendChild(renderChecklistPanel());

  app.appendChild(body);

  // Restore speaking ring if TTS is active when DOM is rebuilt
  requestAnimationFrame(() => {
    if (GRANT_TTS.speaking) GRANT_TTS.updateAvatarState(true);
  });
}

// --- Init ---
function initApp() {
  const greeting = window.INSTITUTION_CONFIG?.assistant?.greeting
    || "Welcome! I'm Grant, your AI Grant Assistant.";
  addMessage('ai', greeting);
  st._greeting = greeting;

  // Start real-time Firestore listener — pipeline auto-updates on any change
  listenToSubmissions(submissions => {
    st.submissions = submissions;
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', initApp);
