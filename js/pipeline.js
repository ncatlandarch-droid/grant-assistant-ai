/* ============================================
   Pipeline — Kanban Board Grant Tracker
   ============================================ */

function renderPipeline() {
  const el = document.createElement('div');

  // Signed-in PI (non-admin) sees only their own proposals
  if (st.currentUser && !st.isAdmin) {
    el.appendChild(renderMySubmissions());
    return el;
  }

  // Merge live Firestore submissions + historical mock data
  const liveItems = (st.submissions || []);
  const mockItems = OPPORTUNITIES_DATA.map(o => ({ ...o, isLive: false }));
  const allItems  = [...liveItems, ...mockItems];

  const activeItem = st.activeOpportunity
    ? allItems.find(o => o.id === st.activeOpportunity)
    : null;

  if (activeItem) {
    el.appendChild(renderOppDetail(activeItem));
    return el;
  }

  const liveCount = liveItems.length;
  el.innerHTML = `
    <div class="section-header">
      <h2>📋 Grant <span>Pipeline</span></h2>
      <button class="btn btn-secondary btn-sm" onclick="setView('noi-wizard')">+ New NOI</button>
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
        <span style="color:var(--text-muted);font-size:0.75rem">${pct}% through review process</span>
        ${sub.deadline ? `<span style="color:var(--text-muted);font-size:0.75rem">${getDaysRemaining(sub.deadline)}</span>` : ''}
      </div>
    `;
    list.appendChild(card);
  });

  el.appendChild(list);
  return el;
}

function renderOppDetail(opp) {
  const stage = PIPELINE_STAGES.find(s => s.id === opp.stage);
  const el = document.createElement('div');

  // Progress bar
  const pct = Math.round((opp.stage / 12) * 100);

  el.innerHTML = `
    <div style="margin-bottom:16px">
      <button class="btn btn-secondary btn-sm" onclick="st.activeOpportunity=null; render();">← Back to Pipeline</button>
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
  return el;
}

// ---- Admin action helpers ------------------------------------------------

async function advanceSubmission(id, newStage) {
  try {
    await updateSubmissionStage(id, newStage);

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

function confirmDeleteSubmission(id) {
  if (!confirm('Permanently delete this submission? This cannot be undone.')) return;
  deleteSubmission(id).catch(err => {
    console.error('Delete failed:', err);
    alert('Could not delete submission. Please try again.');
  });
}

function getDaysRemaining(deadline) {
  if (!deadline) return '';
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'Due today!';
  if (diff <= 7) return `${diff} days remaining ⚠️`;
  return `${diff} days remaining`;
}
