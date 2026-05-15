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
  submissions:      [],
  currentUser:      null,
  isAdmin:          false,
  pipelineView:     'kanban',
  tableSort:        { col: 'submittedAt', dir: 'desc' },
  tableFilter:      { search: '', stage: '' },
  workflowQuery:    '',
  workflowMatches:  [],
  workflowResult:   null,
  workflowLoading:  false,
  firestoreProfile: null,
  editingProfile:   false
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

// --- Proposal Builder ---
function launchProposalBuilder() {
  // Sync the idea input into the workflow launcher and fire
  launchWorkflow();
}

// --- Personal Progress Dashboard (shown when PI is signed in) ---
function renderPersonalDashboard() {
  const up    = getUserProfile(st.currentUser);
  const email = st.currentUser.email?.toLowerCase();
  const mine  = (st.submissions || []).filter(s => s.piEmail?.toLowerCase() === email);
  const active = mine.filter(s => s.stage < 12).sort((a, b) => {
    const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    return da - db;
  });
  const totalFunding = mine.reduce((n, s) => n + (s.estimatedFunding || 0), 0);
  const nextDue      = active.find(s => s.deadline);
  const nextDueStr   = nextDue ? getDaysRemaining(nextDue.deadline) : '—';
  const isNextUrgent = nextDueStr.includes('⚠️') || nextDueStr.includes('overdue');

  const el = document.createElement('div');
  el.className = 'upd-wrap';

  el.innerHTML = `
    <div class="upd-header">
      <div class="upd-welcome">
        <img src="${up.avatar}" class="upd-avatar" onerror="this.src='images/grant-avatar.png'" alt="${up.displayName}">
        <div>
          <div class="upd-name">Welcome back, ${up.displayName}</div>
          <div class="upd-role">${up.role}</div>
        </div>
      </div>
      <div class="upd-stats">
        <div class="upd-stat">
          <div class="upd-stat-val">${active.length}</div>
          <div class="upd-stat-label">Active</div>
        </div>
        <div class="upd-stat">
          <div class="upd-stat-val">${mine.filter(s => s.stage === 12).length}</div>
          <div class="upd-stat-label">Submitted</div>
        </div>
        <div class="upd-stat">
          <div class="upd-stat-val" style="color:var(--aggie-gold)">$${(totalFunding/1000).toFixed(0)}K</div>
          <div class="upd-stat-label">Total Requested</div>
        </div>
        <div class="upd-stat">
          <div class="upd-stat-val" style="${isNextUrgent ? 'color:#f87171' : ''}">${nextDueStr}</div>
          <div class="upd-stat-label">Next Deadline</div>
        </div>
      </div>
    </div>
  `;

  if (mine.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'upd-empty';
    empty.innerHTML = `
      <div>📝</div>
      <div>No proposals yet</div>
      <button class="btn btn-primary" style="margin-top:10px" onclick="setView('noi-wizard')">Submit Your First NOI →</button>
    `;
    el.appendChild(empty);
    return el;
  }

  const list = document.createElement('div');
  list.className = 'upd-list';

  const display = mine.slice(0, 5);
  display.forEach(sub => {
    const stage     = PIPELINE_STAGES.find(s => s.id === sub.stage);
    const pct       = Math.round((sub.stage / 12) * 100);
    const daysStr   = sub.deadline ? getDaysRemaining(sub.deadline) : null;
    const isUrgent  = daysStr && (daysStr.includes('⚠️') || daysStr.includes('overdue'));
    const noteCount = sub.notes?.length || 0;
    const card      = document.createElement('div');
    card.className  = 'upd-card' + (isUrgent ? ' upd-card-urgent' : '');
    card.onclick    = () => { st.activeOpportunity = sub.id; setView('pipeline'); };
    card.innerHTML  = `
      <div class="upd-card-top">
        <div class="upd-card-title">${sub.title.substring(0, 58)}${sub.title.length > 58 ? '…' : ''}</div>
        <div class="upd-stage-badge" style="background:${stage?.color || '#888'}22;color:${stage?.color || '#888'};border:1px solid ${stage?.color || '#888'}44">
          ${sub.stage} · ${stage?.short || sub.status}
        </div>
      </div>
      <div class="upd-card-meta">
        <span>${sub.sponsor}${sub.program ? ' · ' + sub.program : ''}</span>
        <span style="color:var(--aggie-gold);font-weight:700">$${(sub.estimatedFunding/1000).toFixed(0)}K</span>
        ${daysStr ? `<span style="${isUrgent ? 'color:#f87171' : 'color:var(--text-muted)'}">${daysStr}</span>` : ''}
        ${noteCount > 0 ? `<span style="color:var(--aggie-gold)">💬 ${noteCount} OSP note${noteCount !== 1 ? 's' : ''}</span>` : ''}
      </div>
      <div class="upd-progress-track">
        <div class="upd-progress-fill" style="width:${pct}%;background:${stage?.color || 'var(--caes-green-mid)'}"></div>
      </div>
      <div class="upd-card-footer">${pct}% through review · View details →</div>
    `;
    list.appendChild(card);
  });

  el.appendChild(list);

  if (mine.length > 5) {
    const more = document.createElement('button');
    more.className = 'upd-more-btn';
    more.textContent = `+ ${mine.length - 5} more proposals`;
    more.onclick = () => setView('pipeline');
    el.appendChild(more);
  }

  const actions = document.createElement('div');
  actions.className = 'upd-actions';
  actions.innerHTML = `
    <button class="btn btn-primary btn-sm" onclick="setView('noi-wizard')">+ New NOI</button>
    <button class="btn btn-secondary btn-sm" onclick="setView('pipeline')">View All My Proposals</button>
    <button class="btn btn-secondary btn-sm" onclick="setView('opportunities')">Browse Funding</button>
  `;
  el.appendChild(actions);

  return el;
}

// --- Dashboard ---
function renderDashboard() {
  const el = document.createElement('div');

  // Signed-in PI: personal progress section at top
  if (st.currentUser && !st.isAdmin) {
    el.appendChild(renderPersonalDashboard());
  }

  const stats = computeOppStats();
  const active = OPPORTUNITIES_DATA.filter(o => o.stage < 12);
  const inst = window.INSTITUTION_CONFIG?.institution;
  el.innerHTML = `

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
    case 'dashboard':      workspace.appendChild(renderDashboard()); break;
    case 'workflow':       workspace.appendChild(renderWorkflow()); break;
    case 'opportunities':  workspace.appendChild(renderOpportunities()); break;
    case 'research-match': workspace.appendChild(renderDocumentAnalysis()); break;
    case 'pipeline':       workspace.appendChild(renderPipeline()); break;
    case 'noi-wizard':     workspace.appendChild(renderNOIWizard()); break;
    case 'resources':      workspace.appendChild(renderResources()); break;
    default:               workspace.appendChild(renderDashboard());
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
