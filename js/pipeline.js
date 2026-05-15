/* ============================================
   Pipeline — Kanban Board Grant Tracker
   ============================================ */

function renderPipeline() {
  const el = document.createElement('div');

  // Signed-in PI (non-admin) — personal portal
  if (st.currentUser && !st.isAdmin) {
    if (st.activeOpportunity) {
      const sub = st.submissions.find(s => s.id === st.activeOpportunity);
      if (sub) { el.appendChild(renderMySubmissionDetail(sub)); return el; }
      st.activeOpportunity = null; // stale id — fall through to list
    }
    el.appendChild(renderMySubmissions());
    return el;
  }

  // Merge live Firestore submissions + historical mock data
  let liveItems = (st.submissions || []);
  const mockItems = OPPORTUNITIES_DATA.map(o => ({ ...o, isLive: false }));
  let allItems  = [...liveItems, ...mockItems];

  // Admin user filter — narrow to one user's proposals
  const userFilter = st.adminUserFilter;
  if (userFilter) {
    liveItems = liveItems.filter(s => s.piEmail?.toLowerCase() === userFilter.toLowerCase());
    allItems  = liveItems; // filtered view shows only live submissions for that user
  }

  const activeItem = st.activeOpportunity
    ? allItems.find(o => o.id === st.activeOpportunity)
    : null;

  if (activeItem) {
    el.appendChild(renderOppDetail(activeItem));
    return el;
  }

  // Admin can toggle between kanban and table view
  if (st.isAdmin && st.pipelineView === 'table') {
    el.appendChild(renderAdminTable());
    return el;
  }

  const liveCount = liveItems.length;
  el.innerHTML = `
    ${userFilter ? `
      <div class="pipeline-user-filter-bar">
        <span>📋 Showing proposals for <strong>${userFilter}</strong></span>
        <button class="btn btn-secondary btn-sm" onclick="st.adminUserFilter=null; render()">✕ Clear Filter</button>
      </div>
    ` : ''}
    <div class="section-header">
      <h2>📋 Grant <span>Pipeline</span></h2>
      <div style="display:flex;gap:8px;align-items:center">
        ${st.isAdmin ? `
          <div class="view-toggle">
            <button class="view-toggle-btn ${st.pipelineView === 'kanban' ? 'active' : ''}" onclick="st.pipelineView='kanban'; render()">📋 Board</button>
            <button class="view-toggle-btn ${st.pipelineView === 'table'  ? 'active' : ''}" onclick="st.pipelineView='table';  render()">📊 Table</button>
          </div>
        ` : ''}
        <button class="btn btn-secondary btn-sm" onclick="setView('noi-wizard')">+ New NOI</button>
      </div>
    </div>
    <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:16px">
      Track proposals through the 12-stage approval process. Click any card for details.
      ${liveCount > 0 ? `<span style="color:var(--caes-green-mid); font-weight:600"> · ${liveCount} live submission${liveCount !== 1 ? 's' : ''} from this tool</span>` : ''}
    </p>
  `;

  const board = document.createElement('div');
  board.className = 'pipeline-board';

  PIPELINE_STAGES.forEach(stage => {
    const items = allItems.filter(o => o.stage === stage.id);
    const col = document.createElement('div');
    col.className = 'pipeline-stage';
    col.innerHTML = `
      <div class="stage-header">
        <div class="stage-dot" style="background:${stage.color}"></div>
        <span class="stage-name">${stage.short}</span>
        <span class="stage-count">${items.length}</span>
      </div>
    `;

    items.forEach(o => {
      const card = document.createElement('div');
      card.className = 'pipeline-card';
      if (o.isLive) card.style.borderLeft = '3px solid var(--caes-green-mid)';
      card.onclick = () => { st.activeOpportunity = o.id; render(); };
      card.innerHTML = `
        <div class="pipeline-card-title">
          ${o.isLive ? '<span style="font-size:0.6rem;color:var(--caes-green-mid);font-weight:700;text-transform:uppercase;letter-spacing:0.08em">● LIVE &nbsp;</span>' : ''}
          ${o.title.substring(0, 52)}${o.title.length > 52 ? '…' : ''}
        </div>
        <div class="pipeline-card-meta">${o.piName} · ${o.sponsor}</div>
        <div class="pipeline-card-meta">$${(o.estimatedFunding/1000).toFixed(0)}K · ${o.type}</div>
        ${o.isLive ? `<div style="font-size:0.65rem;color:var(--text-muted);margin-top:3px">${o.status || 'Stage ' + o.stage}</div>` : ''}
        ${o.isLive && st.isAdmin ? `
          <div class="admin-card-controls" onclick="event.stopPropagation()">
            ${o.stage < 12 ? `<button class="admin-advance-btn" onclick="advanceSubmission('${o.id}', ${o.stage + 1})">Advance → Stage ${o.stage + 1}</button>` : '<span style="color:var(--caes-green-mid);font-size:0.7rem;font-weight:600">✓ Complete</span>'}
            <button class="admin-delete-btn" onclick="confirmDeleteSubmission('${o.id}')">Delete</button>
          </div>` : ''}
      `;
      col.appendChild(card);
    });

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:12px;text-align:center;color:var(--text-muted);font-size:0.75rem;';
      empty.textContent = 'No proposals';
      col.appendChild(empty);
    }

    board.appendChild(col);
  });

  el.appendChild(board);
  return el;
}

// ── Admin Table View ─────────────────────────────────────────────────────────

function renderAdminTable() {
  const subs   = st.submissions || [];
  const total  = subs.reduce((n, s) => n + (s.estimatedFunding || 0), 0);
  const active = subs.filter(s => s.stage < 12).length;

  const el = document.createElement('div');

  el.innerHTML = `
    <div class="section-header" style="margin-bottom:12px">
      <h2>📋 Grant <span>Pipeline</span></h2>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="view-toggle">
          <button class="view-toggle-btn" onclick="st.pipelineView='kanban'; render()">📋 Board</button>
          <button class="view-toggle-btn active">📊 Table</button>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="setView('noi-wizard')">+ New NOI</button>
      </div>
    </div>

    <div class="admin-stats-bar">
      <div class="admin-stat"><span class="admin-stat-num">${subs.length}</span><span class="admin-stat-label">Total</span></div>
      <div class="admin-stat"><span class="admin-stat-num">${active}</span><span class="admin-stat-label">Active</span></div>
      <div class="admin-stat"><span class="admin-stat-num">$${(total/1000).toFixed(0)}K</span><span class="admin-stat-label">Portfolio</span></div>
      <div class="admin-stat"><span class="admin-stat-num">${subs.filter(s=>s.stage===12).length}</span><span class="admin-stat-label">Complete</span></div>
    </div>

    <div class="admin-table-controls">
      <input type="text" class="admin-search" id="tableSearchInput"
             placeholder="Search title, PI, sponsor…"
             value="${st.tableFilter.search}"
             oninput="st.tableFilter.search=this.value; _refreshTableBody()">
      <select class="admin-stage-filter" onchange="st.tableFilter.stage=this.value; _refreshTableBody()">
        <option value="">All Stages</option>
        ${PIPELINE_STAGES.map(s => `<option value="${s.id}" ${st.tableFilter.stage == s.id ? 'selected' : ''}>${s.id}. ${s.name}</option>`).join('')}
      </select>
      <button class="btn btn-secondary btn-sm" onclick="exportSubmissionsCSV()">⬇ Export CSV</button>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            ${[
              ['title',            'Title'],
              ['piName',           'PI'],
              ['piDept',           'Dept'],
              ['sponsor',          'Sponsor'],
              ['estimatedFunding', 'Funding'],
              ['stage',            'Stage'],
              ['deadline',         'Deadline']
            ].map(([col, label]) => `
              <th class="sortable ${st.tableSort.col === col ? 'sort-active' : ''}"
                  onclick="sortTable('${col}')">
                ${label}${st.tableSort.col === col ? (st.tableSort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
            `).join('')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="adminTableBody"></tbody>
      </table>
    </div>
  `;

  _refreshTableBody();
  return el;
}

function _refreshTableBody() {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;

  let items = (st.submissions || []).slice();

  // Filter
  const search = (st.tableFilter.search || '').toLowerCase();
  const stage  = st.tableFilter.stage;
  if (search) items = items.filter(s =>
    [s.title, s.piName, s.piDept, s.sponsor].join(' ').toLowerCase().includes(search));
  if (stage)  items = items.filter(s => String(s.stage) === String(stage));

  // Sort — handle Firestore Timestamps for submittedAt
  const col = st.tableSort.col;
  const dir = st.tableSort.dir;
  items.sort((a, b) => {
    let va = a[col] ?? '', vb = b[col] ?? '';
    if (va?.toDate) va = va.toDate().getTime();
    if (vb?.toDate) vb = vb.toDate().getTime();
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return dir === 'asc' ?  -1 : 1;
    if (va > vb) return dir === 'asc' ?   1 : -1;
    return 0;
  });

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--text-muted)">No matching submissions</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(s => {
    const stageObj = PIPELINE_STAGES.find(p => p.id === s.stage);
    const days     = s.deadline ? getDaysRemaining(s.deadline) : '—';
    const urgency  = days.includes('overdue') ? 'color:#f87171' : days.includes('⚠️') ? 'color:#fbbf24' : '';
    return `
      <tr>
        <td class="table-title" title="${s.title}">${s.title.substring(0, 44)}${s.title.length > 44 ? '…' : ''}</td>
        <td style="white-space:nowrap">${s.piName}</td>
        <td style="font-size:0.78rem;color:var(--text-secondary)">${s.piDept.substring(0, 18)}${s.piDept.length > 18 ? '…' : ''}</td>
        <td style="font-size:0.82rem">${s.sponsor}</td>
        <td style="color:var(--aggie-gold);font-weight:700;white-space:nowrap">$${(s.estimatedFunding/1000).toFixed(0)}K</td>
        <td>
          <span class="stage-badge" style="background:${stageObj?.color || '#888'}22;color:${stageObj?.color || '#888'};border-color:${stageObj?.color || '#888'}44">
            ${s.stage}. ${stageObj?.short || ''}
          </span>
        </td>
        <td style="font-size:0.78rem;${urgency};white-space:nowrap">${days}</td>
        <td>
          <div style="display:flex;gap:5px;align-items:center">
            ${s.stage < 12
              ? `<button class="admin-advance-btn" style="padding:3px 7px;font-size:0.67rem" onclick="advanceSubmission('${s.id}',${s.stage+1})">→${s.stage+1}</button>`
              : `<span style="color:var(--caes-green-mid);font-size:0.72rem;font-weight:700">✓</span>`}
            <button class="admin-delete-btn" style="padding:3px 7px;font-size:0.67rem" onclick="confirmDeleteSubmission('${s.id}')">✕</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function sortTable(col) {
  if (st.tableSort.col === col) {
    st.tableSort.dir = st.tableSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    st.tableSort = { col, dir: 'asc' };
  }
  render(); // full re-render so header sort indicators update
}

// CSV export — pure browser, no server needed.
// Builds a text string, wraps it in a Blob (in-memory file), creates a
// temporary download link, clicks it, then removes it.
function exportSubmissionsCSV() {
  const items = st.submissions || [];
  if (items.length === 0) { alert('No submissions to export.'); return; }

  const headers = [
    'Title','PI Name','PI Email','Department','College',
    'Sponsor','Program','Solicitation','Grant Type',
    'Funding ($)','Duration','Deadline','Stage','Status',
    'Cost Share','Cost Share Amt','Subrecipients','Sub Institutions',
    'Human Subjects','Animal Use','Biohazard','Radioactive','Export Control','COI',
    'PI Effort (%)','Budget Notes','Submitted At'
  ];

  const escape = v => `"${String(v || '').replace(/"/g, '""')}"`;

  const rows = items.map(s => [
    escape(s.title),
    escape(s.piName),
    escape(s.piEmail),
    escape(s.piDept),
    escape(s.piCollege || 'CAES'),
    escape(s.sponsor),
    escape(s.program),
    escape(s.solicitation),
    escape(s.type),
    s.estimatedFunding || 0,
    escape(s.duration),
    s.deadline || '',
    s.stage || 1,
    escape(s.status),
    s.costShare === 'yes' ? 'Yes' : 'No',
    s.costShareAmt || 0,
    s.subrec === 'yes' ? 'Yes' : 'No',
    escape(s.subInst),
    s.compliance?.humanSubjects ? 'Yes' : 'No',
    s.compliance?.animals       ? 'Yes' : 'No',
    s.compliance?.biohazard     ? 'Yes' : 'No',
    s.compliance?.radioactive   ? 'Yes' : 'No',
    s.compliance?.exportCtrl    ? 'Yes' : 'No',
    s.compliance?.coi           ? 'Yes' : 'No',
    s.effort || '',
    escape(s.budgetNotes),
    s.submittedAt ? (s.submittedAt.toDate ? s.submittedAt.toDate() : new Date(s.submittedAt)).toLocaleDateString() : ''
  ].join(','));

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url, download: `submissions_${new Date().toISOString().split('T')[0]}.csv`
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // free memory immediately
}

function renderMySubmissions() {
  const email = st.currentUser?.email?.toLowerCase();
  const mine  = (st.submissions || []).filter(s => s.piEmail?.toLowerCase() === email);
  const name  = st.currentUser?.displayName?.split(' ')[0] || 'Researcher';

  const el = document.createElement('div');

  el.innerHTML = `
    <div class="section-header">
      <h2>📋 My <span>Proposals</span></h2>
      <button class="btn btn-secondary btn-sm" onclick="setView('noi-wizard')">+ New NOI</button>
    </div>
    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:20px">
      Welcome back, <strong style="color:var(--text-primary)">${name}</strong>.
      ${mine.length > 0
        ? `You have <strong style="color:var(--caes-green-mid)">${mine.length} active proposal${mine.length !== 1 ? 's' : ''}</strong> in the review process.`
        : `You have no active proposals yet.`}
    </p>
  `;

  if (mine.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'my-proposals-empty';
    empty.innerHTML = `
      <div style="font-size:2.5rem;margin-bottom:12px">📝</div>
      <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:8px">No proposals submitted yet</div>
      <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:20px">Submit a Notice of Intent to start tracking your proposal through the approval process.</div>
      <button class="btn btn-primary" onclick="setView('noi-wizard')">Submit Your First NOI</button>
    `;
    el.appendChild(empty);
    return el;
  }

  const list = document.createElement('div');
  list.className = 'my-proposals-list';

  mine.forEach(sub => {
    const pct   = Math.round((sub.stage / 12) * 100);
    const stage = PIPELINE_STAGES.find(s => s.id === sub.stage);
    const card  = document.createElement('div');
    card.className = 'my-proposal-card';
    card.style.cursor = 'pointer';
    card.onclick = () => { st.activeOpportunity = sub.id; render(); };

    const hasNotes = sub.notes?.length > 0;

    card.innerHTML = `
      <div class="my-proposal-header">
        <div>
          <div class="my-proposal-title">${sub.title}</div>
          <div class="my-proposal-meta">${sub.sponsor}${sub.program ? ' · ' + sub.program : ''}</div>
        </div>
        <div class="my-proposal-funding">$${(sub.estimatedFunding/1000).toFixed(0)}K</div>
      </div>

      <div class="my-proposal-stage-row">
        <span class="my-proposal-stage-label">Stage ${sub.stage} of 12</span>
        <span class="my-proposal-stage-name" style="color:${stage?.color || 'var(--caes-green-mid)'}">● ${sub.status || stage?.name || ''}</span>
      </div>

      <div class="my-proposal-progress-track">
        ${PIPELINE_STAGES.map(s => `
          <div class="my-proposal-pip ${s.id <= sub.stage ? 'active' : ''}"
               style="${s.id <= sub.stage ? 'background:' + stage?.color : ''}"
               title="Stage ${s.id}: ${s.name}"></div>
        `).join('')}
      </div>

      <div class="my-proposal-footer">
        <span style="color:var(--text-muted);font-size:0.75rem">${pct}% through review process${hasNotes ? ` · <span style="color:var(--aggie-gold)">💬 ${sub.notes.length} note${sub.notes.length !== 1 ? 's' : ''} from OSP</span>` : ''}</span>
        <span style="color:var(--text-muted);font-size:0.75rem">${sub.deadline ? getDaysRemaining(sub.deadline) : ''}</span>
      </div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:8px;text-align:right">View details →</div>
    `;
    list.appendChild(card);
  });

  el.appendChild(list);
  return el;
}

function renderMySubmissionDetail(sub) {
  const stage = PIPELINE_STAGES.find(s => s.id === sub.stage);
  const pct   = Math.round((sub.stage / 12) * 100);
  const c     = sub.compliance || {};

  const el = document.createElement('div');

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="st.activeOpportunity=null; render();">← My Proposals</button>
      <button class="btn btn-primary btn-sm" onclick="exportNOIPdf(st.submissions.find(s=>s.id==='${sub.id}'))">📄 Export PDF</button>
    </div>

    <div class="card" style="margin-bottom:16px">
      <h2 style="font-size:1.15rem;font-weight:800;color:var(--text-primary);margin-bottom:4px">${sub.title}</h2>
      <div style="color:var(--text-secondary);font-size:0.83rem;margin-bottom:14px">${sub.sponsor}${sub.program ? ' · ' + sub.program : ''}</div>

      <div class="my-proposal-stage-row" style="margin-bottom:8px">
        <span class="my-proposal-stage-label">Stage ${sub.stage} of 12</span>
        <span class="my-proposal-stage-name" style="color:${stage?.color || 'var(--caes-green-mid)'}">● ${sub.status || stage?.name || ''}</span>
      </div>
      <div class="my-proposal-progress-track" style="margin-bottom:6px">
        ${PIPELINE_STAGES.map(s => `
          <div class="my-proposal-pip ${s.id <= sub.stage ? 'active' : ''}"
               style="${s.id <= sub.stage ? 'background:' + stage?.color : ''}"
               title="Stage ${s.id}: ${s.name}"></div>
        `).join('')}
      </div>
      <div style="color:var(--text-muted);font-size:0.75rem;margin-bottom:10px">${pct}% through the review process</div>

      ${stage?.desc ? `<div style="background:rgba(255,255,255,0.04);border-left:3px solid ${stage.color};padding:10px 14px;border-radius:0 6px 6px 0;font-size:0.83rem;color:var(--text-secondary);line-height:1.55">${stage.desc}</div>` : ''}
    </div>

    <div class="dashboard-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:16px">
      <div class="card">
        <div class="card-subtitle">Funding</div>
        <div class="card-title" style="color:var(--aggie-gold)">$${Number(sub.estimatedFunding).toLocaleString()}</div>
        <div style="font-size:0.8rem;color:var(--text-secondary)">${sub.duration}</div>
      </div>
      <div class="card">
        <div class="card-subtitle">Deadline</div>
        <div class="card-title">${sub.deadline ? new Date(sub.deadline).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Not set'}</div>
        <div style="font-size:0.8rem;color:var(--text-secondary)">${getDaysRemaining(sub.deadline)}</div>
      </div>
      <div class="card">
        <div class="card-subtitle">Type</div>
        <div class="card-title">${sub.type}</div>
        <div style="font-size:0.8rem;color:var(--text-secondary)">IDC: ${sub.type === 'Capacity' ? '0' : '48'}%</div>
      </div>
      <div class="card">
        <div class="card-subtitle">PI</div>
        <div class="card-title" style="font-size:0.95rem">${sub.piName}</div>
        <div style="font-size:0.78rem;color:var(--text-secondary)">${sub.piDept}</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:10px">Compliance</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${[
          [c.humanSubjects, 'Human Subjects (IRB)'],
          [c.animals,       'Animal Use (IACUC)'],
          [c.biohazard,     'Biohazard (IBC)'],
          [c.radioactive,   'Radioactive Materials'],
          [c.exportCtrl,    'Export Control'],
          [c.coi,           'Conflict of Interest']
        ].map(([flag, label]) => flag
          ? `<span class="badge badge-danger">⚠️ ${label}</span>`
          : `<span class="badge badge-muted">✓ ${label}</span>`
        ).join('')}
      </div>
      ${sub.costShare === 'yes' ? `<div style="margin-top:8px"><span class="badge badge-warning">⚠️ Cost Share — $${Number(sub.costShareAmt||0).toLocaleString()}</span></div>` : ''}
      ${sub.subrec === 'yes' ? `<div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary)">Subrecipients: ${sub.subInst || 'TBD'}</div>` : ''}
    </div>

    ${sub.summary ? `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:8px">Project Summary</div>
      <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:0">${sub.summary}</p>
    </div>` : ''}
  `;

  // OSP Notes (read-only for PI)
  const notes = sub.notes || [];
  const notesCard = document.createElement('div');
  notesCard.className = 'card';
  notesCard.innerHTML = `
    <div class="card-title" style="margin-bottom:${notes.length ? '12px' : '0'}">
      💬 Notes from OSP
      ${notes.length === 0 ? '<span style="font-size:0.78rem;font-weight:400;color:var(--text-muted);margin-left:8px">No notes yet</span>' : ''}
    </div>
  `;
  notes.slice().reverse().forEach(n => {
    const noteEl = document.createElement('div');
    noteEl.className = 'osp-note';
    noteEl.innerHTML = `
      <div class="osp-note-meta">${n.author} · ${n.ts ? new Date(n.ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : ''}</div>
      <div class="osp-note-text">${n.text}</div>
    `;
    notesCard.appendChild(noteEl);
  });
  el.appendChild(notesCard);

  // Stage history timeline
  const histCard = renderStageHistory(sub);
  histCard.style.marginTop = '16px';
  el.appendChild(histCard);

  // IRB section — only shown when human subjects flagged
  if (sub.compliance?.humanSubjects) {
    el.appendChild(renderIRBSection(sub));
  }

  return el;
}

function renderOppDetail(opp) {
  const stage = PIPELINE_STAGES.find(s => s.id === opp.stage);
  const el = document.createElement('div');

  // Progress bar
  const pct = Math.round((opp.stage / 12) * 100);

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="st.activeOpportunity=null; render();">← Back to Pipeline</button>
      ${opp.isLive ? `<button class="btn btn-secondary btn-sm" onclick="exportNOIPdf(st.submissions.find(s=>s.id==='${opp.id}'))">📄 Export PDF</button>` : ''}
    </div>

    <div class="card" style="margin-bottom:16px">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px">
        <div>
          <h2 style="font-size:1.2rem; font-weight:800; color:var(--text-primary); margin-bottom:4px">${opp.title}</h2>
          <div style="color:var(--text-secondary); font-size:0.85rem">${opp.piName} · ${opp.piDept}</div>
        </div>
        <span class="badge ${getStageBadge(opp.stage)}" style="font-size:0.8rem; padding:6px 14px">${stage?.name || 'Unknown'}</span>
      </div>
      <div class="checklist-progress" style="margin-top:16px">
        <div class="checklist-progress-bar" style="width:${pct}%"></div>
      </div>
      <div style="color:var(--text-muted); font-size:0.75rem; margin-top:4px">Stage ${opp.stage} of 12 — ${pct}% complete</div>
    </div>

    <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
      <div class="card">
        <div class="card-subtitle">Sponsor</div>
        <div class="card-title">${opp.sponsor}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary)">${opp.program || ''}</div>
      </div>
      <div class="card">
        <div class="card-subtitle">Funding</div>
        <div class="card-title" style="color:var(--aggie-gold)">$${opp.estimatedFunding.toLocaleString()}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary)">${opp.duration}</div>
      </div>
      <div class="card">
        <div class="card-subtitle">Type / IDC</div>
        <div class="card-title">${opp.type}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary)">IDC: ${opp.idcRate}%</div>
      </div>
      <div class="card">
        <div class="card-subtitle">Deadline</div>
        <div class="card-title">${formatDate(opp.deadline)}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary)">${getDaysRemaining(opp.deadline)}</div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-title">Compliance Requirements</div>
      <div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap">
        <span class="badge ${opp.compliance.humanSubjects ? 'badge-danger' : 'badge-muted'}">
          ${opp.compliance.humanSubjects ? '⚠️' : '✓'} Human Subjects
        </span>
        <span class="badge ${opp.compliance.animals ? 'badge-danger' : 'badge-muted'}">
          ${opp.compliance.animals ? '⚠️' : '✓'} Animal Use
        </span>
        <span class="badge ${opp.compliance.biohazard ? 'badge-danger' : 'badge-muted'}">
          ${opp.compliance.biohazard ? '⚠️' : '✓'} Biohazard
        </span>
        <span class="badge ${opp.costShare ? 'badge-warning' : 'badge-muted'}">
          ${opp.costShare ? '⚠️' : '✓'} Cost Share
        </span>
        <span class="badge ${opp.subrecipients ? 'badge-info' : 'badge-muted'}">
          ${opp.subrecipients ? '📋' : '✓'} Subrecipients
        </span>
      </div>
      ${opp.subInstitutions ? `<div style="margin-top:8px; font-size:0.8rem; color:var(--text-secondary)">Partners: ${opp.subInstitutions.join(', ')}</div>` : ''}
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-title">Approval Chain</div>
      <div style="margin-top:12px">
        ${(opp.type === 'Capacity' ? APPROVAL_CHAIN.capacity : APPROVAL_CHAIN.standard).map((step, i) => `
          <div style="display:flex; align-items:center; gap:12px; padding:8px 0; ${i < APPROVAL_CHAIN.standard.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
            <div class="check-icon" style="${i < Math.floor(opp.stage / 2) ? 'background:var(--success);border-color:var(--success);color:white' : ''}">
              ${i < Math.floor(opp.stage / 2) ? '✓' : (i + 1)}
            </div>
            <div>
              <div style="font-size:0.85rem; font-weight:600; color:var(--text-primary)">${step.role}</div>
              <div style="font-size:0.75rem; color:var(--text-muted)">${step.action}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Admin notes section (live submissions only)
  if (opp.isLive) {
    const notes = opp.notes || [];
    const notesCard = document.createElement('div');
    notesCard.className = 'card';
    notesCard.style.marginTop = '16px';
    notesCard.innerHTML = `<div class="card-title" style="margin-bottom:${notes.length ? '12px' : '8px'}">💬 OSP Notes</div>`;

    notes.slice().reverse().forEach(n => {
      const noteEl = document.createElement('div');
      noteEl.className = 'osp-note';
      noteEl.innerHTML = `
        <div class="osp-note-meta">${n.author} · ${n.ts ? new Date(n.ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : ''}</div>
        <div class="osp-note-text">${n.text}</div>
      `;
      notesCard.appendChild(noteEl);
    });

    if (st.isAdmin) {
      const writeArea = document.createElement('div');
      writeArea.className = 'note-write-area';
      writeArea.innerHTML = `
        <textarea class="note-input" id="noteInput-${opp.id}" placeholder="Add a note visible to the PI…" rows="2"></textarea>
        <button class="btn btn-secondary btn-sm" onclick="submitNote('${opp.id}')">Add Note</button>
      `;
      notesCard.appendChild(writeArea);
    }

    el.appendChild(notesCard);
  }

  // Stage history timeline (live submissions only)
  if (opp.isLive) {
    const histCard = renderStageHistory(opp);
    histCard.style.marginTop = '16px';
    el.appendChild(histCard);
  }

  // IRB section — live submissions with human subjects flagged
  if (opp.isLive && opp.compliance?.humanSubjects) {
    el.appendChild(renderIRBSection(opp));
  }

  return el;
}

// ---- Admin action helpers ------------------------------------------------

async function advanceSubmission(id, newStage) {
  try {
    const actor = st.currentUser?.displayName || st.currentUser?.email || 'OSP';
    await updateSubmissionStage(id, newStage, actor);

    // Email the PI their stage update
    const sub = st.submissions.find(s => s.id === id);
    if (sub?.piEmail) {
      sendEmail('stage_advance', {
        piEmail:          sub.piEmail,
        title:            sub.title,
        stage:            newStage,
        sponsor:          sub.sponsor,
        estimatedFunding: sub.estimatedFunding
      }).catch(console.error);
    }
  } catch (err) {
    console.error('Advance failed:', err);
    alert('Could not advance submission. Please try again.');
  }
}

function submitNote(id) {
  const input = document.getElementById('noteInput-' + id);
  if (!input || !input.value.trim()) return;
  const text   = input.value.trim();
  const author = st.currentUser?.displayName || st.currentUser?.email || 'OSP';
  input.value  = '';
  input.disabled = true;
  addNote(id, text, author)
    .catch(err => { console.error('Note failed:', err); alert('Could not save note.'); })
    .finally(() => { if (input) input.disabled = false; });
  // onSnapshot listener auto-refreshes the UI
}

function confirmDeleteSubmission(id) {
  if (!confirm('Permanently delete this submission? This cannot be undone.')) return;
  deleteSubmission(id).catch(err => {
    console.error('Delete failed:', err);
    alert('Could not delete submission. Please try again.');
  });
}

function renderStageHistory(sub) {
  const history = (sub.stageHistory || []).slice().reverse(); // newest first
  const card = document.createElement('div');
  card.className = 'card stage-history-card';

  card.innerHTML = `<div class="card-title" style="margin-bottom:${history.length ? '14px' : '0'}">🕐 Stage History${history.length === 0 ? '<span style="font-size:0.78rem;font-weight:400;color:var(--text-muted);margin-left:8px">No advances recorded yet</span>' : ''}</div>`;

  if (history.length === 0) return card;

  const list = document.createElement('div');
  list.className = 'stage-history-list';

  history.forEach((entry, i) => {
    const stageObj = PIPELINE_STAGES.find(p => p.id === entry.stage);
    const date     = entry.ts ? new Date(entry.ts) : null;
    const dateStr  = date
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '';

    const row = document.createElement('div');
    row.className = 'stage-history-entry';
    row.innerHTML = `
      <div class="stage-history-dot" style="background:${stageObj?.color || 'var(--aggie-gold)'}"></div>
      ${i < history.length - 1 ? '<div class="stage-history-line"></div>' : ''}
      <div class="stage-history-body">
        <div class="stage-history-label">
          <span class="stage-history-num">Stage ${entry.stage}</span>
          <span class="stage-history-name">${entry.status || stageObj?.name || ''}</span>
        </div>
        <div class="stage-history-meta">${dateStr}${entry.by ? ' · ' + entry.by : ''}</div>
      </div>
    `;
    list.appendChild(row);
  });

  card.appendChild(list);
  return card;
}

function getDaysRemaining(deadline) {
  if (!deadline) return '';
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'Due today!';
  if (diff <= 7) return `${diff} days remaining ⚠️`;
  return `${diff} days remaining`;
}
