/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Readiness & Compliance Studio View (Modular UI)
   Unified interface bridging University OSP + SBIR/Startup tracks */

const _GS_SECTIONS = [
  'Project Summary', 'Executive Summary', 'Problem Statement', 'Project Narrative',
  'Intellectual Merit', 'Broader Impacts', 'Work Plan', 'Commercialization Plan',
  'Market Opportunity', 'Team', 'Use of Funds', 'Budget Justification'
];

function _gsEsc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _gsSvg(path) {
  return `<svg class="mod-icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

function _gsState() {
  if (!st._studio) {
    st._studio = {
      rubricKey: 'usda-nifa',
      section: 'Project Summary',
      text: st.noiData?.summary || '',
      aiResult: '',
      aiLoading: false
    };
  }
  return st._studio;
}

function renderGrantStudio() {
  const gs = _gsState();
  const el = document.createElement('div');
  const rubrics = window.GRANTED_RUBRIC_ENGINE?.RUBRICS || {};

  const rubricScore = gs.text.trim() && window.GRANTED_RUBRIC_ENGINE
    ? window.GRANTED_RUBRIC_ENGINE.scoreProposalAgainstRubric(gs.rubricKey, gs.text)
    : null;
  const complianceChecks = gs.text.trim() && window.GRANTED_COMPLIANCE
    ? window.GRANTED_COMPLIANCE.checkProposalCompliance(gs.section, gs.text, gs.rubricKey)
    : [];
  const complianceFlags = gs.text.trim() && window.GRANTED_COMPLIANCE
    ? window.GRANTED_COMPLIANCE.detectComplianceFlags(gs.text)
    : [];

  el.innerHTML = `
    <div class="section-header">
      <h2>${_gsSvg('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')} Readiness &amp; <span>Compliance Studio</span></h2>
      <span class="badge badge-info">Unified OSP + SBIR Engine</span>
    </div>
    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:16px">
      Score any proposal section against live agency rubrics, scan for disqualifiers and NIFA/NC IDEA rules, auto-detect IRB/IACUC triggers, and run anti-hallucination AI refinement.
    </p>

    <div class="gs-controls">
      <div class="gs-field">
        <label for="gsRubricSelect">Agency Rubric &amp; Track</label>
        <select id="gsRubricSelect" onchange="gsUpdateField('rubricKey', this.value)">
          ${Object.entries(rubrics).map(([k, r]) =>
            `<option value="${_gsEsc(k)}" ${gs.rubricKey === k ? 'selected' : ''}>${_gsEsc(r.name)} (${_gsEsc(r.track)})</option>`
          ).join('')}
        </select>
      </div>
      <div class="gs-field">
        <label for="gsSectionSelect">Proposal Section</label>
        <select id="gsSectionSelect" onchange="gsUpdateField('section', this.value)">
          ${_GS_SECTIONS.map(sec =>
            `<option value="${_gsEsc(sec)}" ${gs.section === sec ? 'selected' : ''}>${_gsEsc(sec)}</option>`
          ).join('')}
        </select>
      </div>
    </div>

    <div class="gs-field">
      <label for="gsDraftText">Draft Narrative / Abstract</label>
      <textarea id="gsDraftText" class="gs-textarea" placeholder="Paste your project summary, narrative section, or pitch draft here to score it instantly..." oninput="gsUpdateText(this.value)">${_gsEsc(gs.text)}</textarea>
    </div>

    <div class="gs-actions">
      <button type="button" class="btn btn-primary" onclick="gsRunAiRefine()" ${gs.aiLoading || !gs.text.trim() ? 'disabled' : ''}>
        ${_gsSvg('<path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/>')}
        ${gs.aiLoading ? 'Analyzing with Gemini...' : 'AI Strengthen (with [VERIFY] Guard)'}
      </button>
      ${st.noiData?.summary ? `<button type="button" class="btn btn-secondary" onclick="gsLoadFromNOI()">Load Current NOI Summary</button>` : ''}
      ${gs.text.trim() ? `<button type="button" class="btn btn-secondary" onclick="gsClear()">Clear</button>` : ''}
    </div>

    ${rubricScore ? _gsRenderResults(rubricScore, complianceChecks, complianceFlags) : `
      <div class="gs-card" style="text-align:center;color:var(--text-secondary);padding:28px">
        Paste a draft above to see your instant agency rubric score, disqualifier checks, and regulatory compliance triggers.
      </div>
    `}

    ${gs.aiResult ? `
      <div class="gs-card" style="margin-top:16px">
        <h3>${_gsSvg('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>')} AI Strengthened Draft <span class="badge badge-warning" style="margin-left:auto">Review Yellow [VERIFY] Tags</span></h3>
        <div class="gs-ai-output">${_gsFormatVerify(_gsEsc(gs.aiResult))}</div>
      </div>
    ` : ''}
  `;

  return el;
}

function _gsRenderResults(score, checks, flags) {
  return `
    <div class="gs-grid">
      <div class="gs-card">
        <div class="gs-score-header">
          <div>
            <h3 style="margin:0">${_gsSvg('<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>')} ${_gsEsc(score.rubricName)}</h3>
            <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:3px">Weighted criterion coverage</div>
          </div>
          <div class="gs-score-pill ${score.grade}">${score.overall}%</div>
        </div>
        ${score.criteria.map(c => `
          <div class="gs-crit-row">
            <div class="gs-crit-top">
              <span>${_gsEsc(c.name)} (${c.weight}%)</span>
              <span>${c.score}%</span>
            </div>
            <div class="gs-bar-track"><div class="gs-bar-fill ${c.grade}" style="width:${c.score}%"></div></div>
            <ul class="gs-sub-list">
              ${c.subcriteria.map(s => `
                <li>
                  <span class="${s.matched ? 'gs-pass' : 'gs-fail'}">${s.matched ? 'PASS' : 'GAP'}</span>
                  <span>${_gsEsc(s.label)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <div class="gs-card">
        <h3>${_gsSvg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>')} Compliance &amp; Disqualifier Scan</h3>
        <div class="gs-check-list">
          ${checks.map(c => `
            <div class="gs-check-item ${c.status}">
              <span>${_gsEsc(c.label)}</span>
              <strong class="gs-${c.status}">${c.status.toUpperCase()}</strong>
            </div>
          `).join('')}
        </div>

        <h3 style="margin-top:18px">${_gsSvg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')} Auto-Detected Regulatory Triggers</h3>
        ${flags.length ? `
          <div class="gs-flag-chips">
            ${flags.map(f => `<span class="gs-flag-chip" title="${_gsEsc(f.guidance)}">${_gsEsc(f.label)}</span>`).join('')}
          </div>
          <ul class="gs-sub-list" style="margin-top:10px">
            ${flags.map(f => `<li><strong>${_gsEsc(f.label)}:</strong> ${_gsEsc(f.guidance)}</li>`).join('')}
          </ul>
        ` : `<p style="font-size:0.82rem;color:var(--text-secondary)">No IRB, IACUC, IBC, Export Control, or Cost-Share triggers detected in this excerpt.</p>`}
      </div>
    </div>
  `;
}

function _gsFormatVerify(escapedText) {
  return escapedText.replace(/\[VERIFY[^\]]*\]/g, m => `<span class="gs-verify-tag">${m}</span>`);
}

function gsUpdateField(key, value) {
  _gsState()[key] = value;
  render();
}

let _gsTypingTimer = null;
function gsUpdateText(val) {
  _gsState().text = val;
  clearTimeout(_gsTypingTimer);
  _gsTypingTimer = setTimeout(() => {
    const pos = document.getElementById('gsDraftText')?.selectionStart;
    render();
    const ta = document.getElementById('gsDraftText');
    if (ta) { ta.focus(); if (pos != null) ta.setSelectionRange(pos, pos); }
  }, 350);
}

function gsLoadFromNOI() {
  _gsState().text = st.noiData?.summary || '';
  render();
}

function gsClear() {
  const gs = _gsState();
  gs.text = '';
  gs.aiResult = '';
  render();
}

async function gsRunAiRefine() {
  const gs = _gsState();
  if (!gs.text.trim() || gs.aiLoading) return;
  const rubric = window.GRANTED_RUBRIC_ENGINE?.scoreProposalAgainstRubric(gs.rubricKey, gs.text);
  const missing = rubric
    ? rubric.criteria.flatMap(c => c.subcriteria.filter(s => !s.matched).map(s => `${c.name}: ${s.label}`))
    : [];

  gs.aiLoading = true;
  render();

  const prompt = [
    `You are a senior federal grant editor for NC A&T and Think! Design and Planning.`,
    `Rewrite and strengthen the "${gs.section}" draft below for the "${rubric?.rubricName || gs.rubricKey}" rubric.`,
    `CRITICAL ANTI-HALLUCINATION RULE: Never invent statistics, citations, dollar figures, dates, or partner commitments. Whenever a specific number, citation, or institutional fact is needed but missing from the draft, insert [VERIFY: brief description] inline.`,
    missing.length ? `Address these missing rubric criteria:\n- ${missing.join('\n- ')}` : '',
    `\nDraft:\n${gs.text}`
  ].filter(Boolean).join('\n\n');

  try {
    const resp = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 1600 }
        }
      })
    });
    const data = await resp.json();
    gs.aiResult = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || `Error (${resp.status}): ${data?.error?.message || 'Unable to generate refined draft.'}`;
  } catch (err) {
    gs.aiResult = `Network error: ${err.message}`;
  } finally {
    gs.aiLoading = false;
    render();
  }
}
