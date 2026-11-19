/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Budget & IDC Builder View (Modular UI + Word Export) */

function _bvEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _bvFmt(n) {
  return '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
}

function _bvState() {
  if (!st._budget) {
    st._budget = {
      preset: 'usda-nifa-tffa',
      awardCap: Number(st.noiData?.funding) || 300000,
      personnel: 110000,
      fringe: 33000,
      travel: 8000,
      supplies: 12000,
      otherDirect: 15000,
      equipment: 20000,
      tuition: 18000,
      participantSupport: 0,
      subawardTotal: 0,
      subawardCount: 0,
      costShare: 0,
      justification: '',
      loading: false
    };
  }
  return st._budget;
}

function renderBudgetBuilder() {
  const b = _bvState();
  const calc = window.GRANTED_BUDGET.calculateBudget(b);
  const presets = window.GRANTED_BUDGET.PRESETS;
  const el = document.createElement('div');

  const fields = [
    ['personnel', 'Personnel Salaries ($)', 'MTDC eligible'],
    ['fringe', 'Fringe Benefits ($)', 'MTDC eligible'],
    ['travel', 'Travel ($)', 'MTDC eligible'],
    ['supplies', 'Materials & Supplies ($)', 'MTDC eligible'],
    ['otherDirect', 'Other Direct (Consultants/Pubs) ($)', 'MTDC eligible'],
    ['equipment', 'Equipment >= $5,000 ($)', 'Excluded from MTDC'],
    ['tuition', 'Graduate Tuition Remission ($)', 'Excluded from MTDC'],
    ['participantSupport', 'Participant Support ($)', 'Excluded from MTDC'],
    ['subawardTotal', 'Subawards Total ($)', 'First $25K per subaward in MTDC'],
    ['costShare', 'Institutional Cost Share / Match ($)', 'Requires OSP approval']
  ];

  el.innerHTML = `
    <div class="section-header">
      <h2><svg class="mod-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg> Budget &amp; <span>IDC Calculator</span></h2>
      <span class="badge ${calc.isZeroNegativeCompliant ? 'badge-success' : 'badge-warning'}">
        ${calc.isZeroNegativeCompliant ? 'Zero-Negative Verified' : 'Over Sponsor Cap'}
      </span>
    </div>
    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:14px">
      2 CFR 200 MTDC exclusion calculator with USDA NIFA 30% TFFA statutory cap, zero-negative ledger enforcement, AI budget justification, and Word export.
    </p>

    <div class="gs-controls">
      <div class="gs-field">
        <label for="bvPreset">Funder IDC Rate Rule</label>
        <select id="bvPreset" onchange="bvSet('preset', this.value)">
          ${Object.entries(presets).map(([k, p]) =>
            `<option value="${_bvEsc(k)}" ${b.preset === k ? 'selected' : ''}>${_bvEsc(p.name)}</option>`
          ).join('')}
        </select>
      </div>
      <div class="gs-field">
        <label for="bvCap">Sponsor Award Ceiling ($) — 0 for none</label>
        <input id="bvCap" type="number" min="0" step="1000" class="gs-textarea" style="min-height:auto;padding:9px 12px"
               value="${b.awardCap}" onchange="bvSet('awardCap', this.value)">
      </div>
      <div class="gs-field">
        <label for="bvFringePreset">NC A&amp;T Fringe Rate Helper</label>
        <select id="bvFringePreset" onchange="bvApplyFringeRate(this.value)">
          <option value="">Auto-calc fringe from Personnel...</option>
          ${(window.GRANTED_ERP?.NCAT_FRINGE_RATES || []).map(f =>
            `<option value="${f.rate}">${_bvEsc(f.label)}</option>`
          ).join('')}
        </select>
      </div>
    </div>

    <div class="gs-grid" style="margin-top:12px">
      <div class="gs-card">
        <h3>Direct Cost Line Items</h3>
        <div class="gs-controls" style="grid-template-columns:repeat(auto-fit,minmax(175px,1fr))">
          ${fields.map(([key, label, hint]) => `
            <div class="gs-field">
              <label for="bv_${key}">${_bvEsc(label)}</label>
              <input id="bv_${key}" type="number" min="0" step="500" class="gs-textarea" style="min-height:auto;padding:8px 10px"
                     value="${b[key]}" onchange="bvSet('${key}', this.value)">
              <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px">${_bvEsc(hint)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="gs-card">
        <h3>OSP Budget &amp; MTDC Summary</h3>
        <table class="opp-table" style="margin-bottom:14px">
          <thead><tr><th scope="col">Ledger Line</th><th scope="col" style="text-align:right">Amount</th></tr></thead>
          <tbody>
            <tr><td>Total Direct Costs (TDC)</td><td style="text-align:right"><strong>${_bvFmt(calc.totalDirect)}</strong></td></tr>
            <tr><td>MTDC Exclusions (Equip/Tuition/Sub&gt;$25K)</td><td style="text-align:right">${_bvFmt(calc.mtdcExclusions)}</td></tr>
            <tr><td>Modified Total Direct Costs (MTDC)</td><td style="text-align:right">${_bvFmt(calc.mtdcBase)}</td></tr>
            <tr><td>Indirect Costs / F&amp;A (${calc.effectiveIdcPct}% of award)</td><td style="text-align:right"><strong>${_bvFmt(calc.indirectCosts)}</strong></td></tr>
            <tr><td><strong>Total Sponsor Request</strong></td><td style="text-align:right"><strong style="color:var(--aggie-gold)">${_bvFmt(calc.totalSponsorRequest)}</strong></td></tr>
            ${calc.costShare > 0 ? `<tr><td>Institutional Cost Share</td><td style="text-align:right">${_bvFmt(calc.costShare)}</td></tr>` : ''}
            <tr><td>Total Project Cost</td><td style="text-align:right">${_bvFmt(calc.totalProjectCost)}</td></tr>
            ${calc.remainingUnderCap !== null ? `
              <tr>
                <td>Remaining Under Ceiling (${_bvFmt(calc.awardCap)})</td>
                <td style="text-align:right;font-weight:700;color:${calc.remainingUnderCap >= 0 ? '#4ade80' : '#f87171'}">${_bvFmt(calc.remainingUnderCap)}</td>
              </tr>` : ''}
          </tbody>
        </table>
        <p style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:10px">${_bvEsc(calc.presetNote)}</p>
        ${calc.warnings.map(w => `<div class="gs-check-item fail" style="margin-bottom:6px"><span>${_bvEsc(w)}</span></div>`).join('')}

        <div class="gs-actions" style="margin-bottom:0">
          <button type="button" class="btn btn-primary btn-sm" onclick="bvGenerateJustification()" ${b.loading ? 'disabled' : ''}>
            ${b.loading ? 'Drafting Justification...' : 'AI Draft Budget Justification'}
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="bvExportWord()">Export Word (.doc)</button>
        </div>
      </div>
    </div>

    ${b.justification ? `
      <div class="gs-card" style="margin-top:16px">
        <h3>AI Budget Justification <span class="badge badge-warning" style="margin-left:auto">Verify Yellow [VERIFY] Items</span></h3>
        <div class="gs-ai-output">${_bvEsc(b.justification).replace(/\[VERIFY[^\]]*\]/g, m => `<span class="gs-verify-tag">${m}</span>`)}</div>
      </div>
    ` : ''}
  `;
  return el;
}

function bvSet(key, val) {
  const b = _bvState();
  b[key] = key === 'preset' ? val : Math.max(0, Number(val) || 0);
  render();
}

function bvApplyFringeRate(rateStr) {
  const rate = Number(rateStr);
  if (!Number.isFinite(rate) || rate <= 0) return;
  const b = _bvState();
  b.fringe = Math.round((Number(b.personnel) || 0) * rate);
  render();
}

async function bvGenerateJustification() {
  const b = _bvState();
  const calc = window.GRANTED_BUDGET.calculateBudget(b);
  b.loading = true;
  render();

  const prompt = [
    `Write a concise, audit-ready federal Budget Justification narrative matching these exact numbers (do NOT alter any dollar figure):`,
    `Rule: ${calc.presetName}`,
    `Personnel: ${_bvFmt(calc.items.personnel)}, Fringe: ${_bvFmt(calc.items.fringe)}, Travel: ${_bvFmt(calc.items.travel)}, Supplies: ${_bvFmt(calc.items.supplies)}, Other Direct: ${_bvFmt(calc.items.otherDirect)}, Equipment: ${_bvFmt(calc.items.equipment)}, Tuition: ${_bvFmt(calc.items.tuition)}, Participant Support: ${_bvFmt(calc.items.participantSupport)}, Subawards: ${_bvFmt(calc.items.subawardTotal)}.`,
    `Total Direct: ${_bvFmt(calc.totalDirect)}, MTDC Base: ${_bvFmt(calc.mtdcBase)}, Indirect Costs: ${_bvFmt(calc.indirectCosts)}, Total Sponsor Request: ${_bvFmt(calc.totalSponsorRequest)}, Cost Share: ${_bvFmt(calc.costShare)}.`,
    `CRITICAL: Never invent staff names, fringe percentages, or vendor quotes — insert [VERIFY: detail needed] wherever specific institutional rates or names must be confirmed.`
  ].join('\n');

  try {
    const fn = window.authFetch || fetch;
    const resp = await fn('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.25, maxOutputTokens: 1400 } } })
    });
    const data = await resp.json();
    b.justification = data?.candidates?.[0]?.content?.parts?.[0]?.text || `Error (${resp.status})`;
  } catch (err) {
    b.justification = `Network error: ${err.message}`;
  } finally {
    b.loading = false;
    render();
  }
}

function bvExportWord() {
  const b = _bvState();
  const calc = window.GRANTED_BUDGET.calculateBudget(b);
  window.GRANTED_DOCX.exportWordDocument({
    filename: 'granted-budget-summary',
    title: st.noiData?.title || 'Proposal Budget & IDC Summary',
    subtitle: calc.presetName,
    metadata: [
      ['Institution', window.INSTITUTION_CONFIG?.institution?.name || 'NC A&T State University'],
      ['IDC Rule', calc.presetName],
      ['Total Sponsor Request', _bvFmt(calc.totalSponsorRequest)],
      ['Zero-Negative Ledger Check', calc.isZeroNegativeCompliant ? 'PASS' : 'OVER CAP']
    ],
    tables: [{
      heading: 'Line-Item Budget Ledger',
      headers: ['Category', 'MTDC Treatment', 'Amount'],
      rows: [
        ['Personnel Salaries', 'Included', _bvFmt(calc.items.personnel)],
        ['Fringe Benefits', 'Included', _bvFmt(calc.items.fringe)],
        ['Travel', 'Included', _bvFmt(calc.items.travel)],
        ['Materials & Supplies', 'Included', _bvFmt(calc.items.supplies)],
        ['Other Direct Costs', 'Included', _bvFmt(calc.items.otherDirect)],
        ['Equipment (>= $5,000)', 'Excluded', _bvFmt(calc.items.equipment)],
        ['Graduate Tuition Remission', 'Excluded', _bvFmt(calc.items.tuition)],
        ['Participant Support', 'Excluded', _bvFmt(calc.items.participantSupport)],
        ['Subawards Total', 'First $25K per subaward', _bvFmt(calc.items.subawardTotal)],
        ['Total Direct Costs', '—', _bvFmt(calc.totalDirect)],
        ['MTDC Base', '—', _bvFmt(calc.mtdcBase)],
        ['Indirect Costs (F&A)', `${calc.effectiveIdcPct}% of award`, _bvFmt(calc.indirectCosts)],
        ['Total Sponsor Request', '—', _bvFmt(calc.totalSponsorRequest)],
        ['Cost Share / Match', 'Non-Federal', _bvFmt(calc.costShare)],
        ['Total Project Cost', '—', _bvFmt(calc.totalProjectCost)]
      ]
    }],
    sections: b.justification ? [{ heading: 'Budget Justification Narrative', body: b.justification }] : []
  });
}
