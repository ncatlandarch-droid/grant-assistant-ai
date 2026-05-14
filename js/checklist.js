/* ============================================
   Checklist — Column 3 Approval Tracker
   ============================================ */

function renderChecklistPanel() {
  const panel = document.createElement('aside');
  panel.className = 'col-checklist';

  const activeOpp = st.activeOpportunity ? OPPORTUNITIES_DATA.find(o => o.id === st.activeOpportunity) : null;

  if (activeOpp) {
    panel.appendChild(renderOppChecklist(activeOpp));
  } else {
    panel.appendChild(renderDefaultChecklist());
  }

  return panel;
}

function renderOppChecklist(opp) {
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

  const items = getChecklistItems(opp);
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  el.innerHTML = `
    <div class="checklist-header">
      <h3>📋 ${opp.title.substring(0, 35)}...</h3>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px">${opp.piName} · ${opp.sponsor}</div>
      <div class="checklist-progress" style="margin-top:10px">
        <div class="checklist-progress-bar" style="width:${pct}%"></div>
      </div>
      <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px">${done}/${items.length} complete (${pct}%)</div>
    </div>
    <div class="checklist-items">
      ${renderChecklistGroups(items)}
    </div>
  `;
  return el;
}

function renderDefaultChecklist() {
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

  // Summary of all active proposals
  const active = OPPORTUNITIES_DATA.filter(o => o.stage < 12);
  const upcoming = OPPORTUNITIES_DATA.filter(o => {
    const days = Math.ceil((new Date(o.deadline) - new Date()) / (1000*60*60*24));
    return days >= 0 && days <= 30;
  });

  el.innerHTML = `
    <div class="checklist-header">
      <h3>📊 Quick Status</h3>
    </div>
    <div class="checklist-items">
      <div class="checklist-group">
        <div class="checklist-group-title">Active Proposals</div>
        ${active.map(o => `
          <div class="checklist-item" onclick="st.activeOpportunity='${o.id}'; render();" style="cursor:pointer">
            <div class="check-icon" style="background:${PIPELINE_STAGES.find(s=>s.id===o.stage)?.color || 'var(--border)'};border-color:${PIPELINE_STAGES.find(s=>s.id===o.stage)?.color || 'var(--border)'};color:white;font-size:0.6rem;">
              ${o.stage}
            </div>
            <div>
              <div class="check-text" style="font-size:0.78rem">${o.title.substring(0, 40)}...</div>
              <div style="font-size:0.68rem; color:var(--text-muted)">${o.piName} · ${PIPELINE_STAGES.find(s=>s.id===o.stage)?.short}</div>
            </div>
          </div>
        `).join('')}
      </div>

      ${upcoming.length > 0 ? `
        <div class="checklist-group" style="margin-top:16px">
          <div class="checklist-group-title">⚠️ Upcoming Deadlines</div>
          ${upcoming.map(o => `
            <div class="checklist-item" onclick="st.activeOpportunity='${o.id}'; render();" style="cursor:pointer">
              <div class="check-icon" style="background:var(--warning);border-color:var(--warning);color:white">!</div>
              <div>
                <div class="check-text" style="font-size:0.78rem">${o.title.substring(0, 35)}...</div>
                <div style="font-size:0.68rem; color:var(--warning)">${formatDate(o.deadline)} · ${getDaysRemaining(o.deadline)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="checklist-group" style="margin-top:16px">
        <div class="checklist-group-title">📚 Quick Links</div>
        ${ENV_SCAN_SOURCES.map(s => `
          <div class="checklist-item">
            <div class="check-icon" style="background:var(--info);border-color:var(--info);color:white;font-size:0.6rem">🔗</div>
            <div>
              <a href="${s.url}" target="_blank" class="check-text" style="font-size:0.78rem">${s.name}</a>
              <div style="font-size:0.68rem; color:var(--text-muted)">${s.type}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  return el;
}

function getChecklistItems(opp) {
  const stage = opp.stage;
  return [
    { group: 'Pre-Proposal', label: 'NOI form submitted', done: stage >= 1 },
    { group: 'Pre-Proposal', label: 'Grant Manager assigned', done: stage >= 2 },
    { group: 'Pre-Proposal', label: 'Schedule of values created', done: stage >= 2 },
    { group: 'Proposal Development', label: 'Technical scope drafted', done: stage >= 3 },
    { group: 'Proposal Development', label: 'Budget narrative complete', done: stage >= 4 },
    { group: 'Proposal Development', label: 'Partner commitment letters', done: stage >= 5 || !opp.subrecipients },
    { group: 'Proposal Development', label: 'Cost share documented', done: stage >= 6 || !opp.costShare },
    { group: 'Compliance', label: 'IRB protocol', done: stage >= 7 || !opp.compliance.humanSubjects, pending: opp.compliance.humanSubjects && stage < 7 },
    { group: 'Compliance', label: 'IACUC protocol', done: stage >= 7 || !opp.compliance.animals, pending: opp.compliance.animals && stage < 7 },
    { group: 'Compliance', label: 'IBC registration', done: stage >= 7 || !opp.compliance.biohazard, pending: opp.compliance.biohazard && stage < 7 },
    { group: 'Submission', label: 'Entered to InfoEd', done: stage >= 7 },
    { group: 'Submission', label: 'Draft review (3 wk)', done: stage >= 8 },
    { group: 'Submission', label: 'Submittal review (1 wk)', done: stage >= 9 },
    { group: 'Review', label: 'Merit review complete', done: stage >= 10 },
    { group: 'Review', label: 'Final approval', done: stage >= 11 },
    { group: 'Review', label: 'Submitted to sponsor', done: stage >= 12 }
  ];
}

function renderChecklistGroups(items) {
  const groups = {};
  items.forEach(i => { if (!groups[i.group]) groups[i.group] = []; groups[i.group].push(i); });

  return Object.entries(groups).map(([name, groupItems]) => `
    <div class="checklist-group">
      <div class="checklist-group-title">${name}</div>
      ${groupItems.map(i => `
        <div class="checklist-item ${i.done ? 'done' : ''} ${i.pending ? 'pending' : ''}">
          <div class="check-icon">${i.done ? '✓' : (i.pending ? '⏳' : '')}</div>
          <div class="check-text">${i.label}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}
