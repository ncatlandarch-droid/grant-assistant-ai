/* ============================================
   Document Upload — Research-to-Grant Matching
   Drop a PDF or paste text → Gemini reads it →
   matched opportunities + pre-filled NOI
   ============================================ */

let _uploadedFileBase64 = null;
let _uploadedMimeType   = null;
let _analysisPrefill    = {};

function renderDocumentAnalysis() {
  const el = document.createElement('div');

  // ── Header ──────────────────────────────────────────────────
  const header = document.createElement('div');
  header.innerHTML = `
    <div class="section-header">
      <h2>🔬 Research <span>Match</span></h2>
    </div>
    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:20px;line-height:1.6">
      Drop a research paper, abstract, or paste your text below.
      Grant reads your work, finds matching funding opportunities, detects compliance requirements,
      and pre-fills your NOI — so you spend time on research, not paperwork.
    </p>
  `;
  el.appendChild(header);

  // ── Drop Zone ────────────────────────────────────────────────
  // The drop zone accepts PDF files via drag-and-drop or click-to-browse.
  // FileReader converts the PDF to base64 so it can be sent as JSON.
  const dropZone = document.createElement('div');
  dropZone.className = 'drop-zone';
  dropZone.id = 'dropZone';
  dropZone.innerHTML = `
    <div style="font-size:2.2rem;margin-bottom:8px">📄</div>
    <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">Drop a PDF here or click to browse</div>
    <div style="font-size:0.78rem;color:var(--text-muted)">Research papers, abstracts, white papers · PDF only · Max 700KB</div>
    <input type="file" id="fileInput" accept=".pdf" style="display:none">
  `;

  dropZone.addEventListener('click', () => dropZone.querySelector('#fileInput').click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) _processFile(file, dropZone);
  });
  dropZone.querySelector('#fileInput').addEventListener('change', function () {
    if (this.files[0]) _processFile(this.files[0], dropZone);
  });
  el.appendChild(dropZone);

  // ── OR divider ───────────────────────────────────────────────
  const or = document.createElement('div');
  or.className = 'upload-or';
  or.textContent = '— or paste text below —';
  el.appendChild(or);

  // ── Text paste area ──────────────────────────────────────────
  const textarea = document.createElement('textarea');
  textarea.className = 'pb-input';
  textarea.id = 'abstractInput';
  textarea.rows = 7;
  textarea.placeholder = 'Paste your abstract, project narrative, or research description here…';
  textarea.style.width = '100%';
  el.appendChild(textarea);

  // ── Analyze button ───────────────────────────────────────────
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;justify-content:flex-end;margin-top:12px;gap:10px';
  btnRow.innerHTML = `
    <button class="btn btn-secondary" onclick="_clearUpload()">Clear</button>
    <button class="btn btn-primary" id="analyzeBtn" onclick="_analyzeDocument()">🔍 Find Matching Grants</button>
  `;
  el.appendChild(btnRow);

  // ── Results container ────────────────────────────────────────
  const results = document.createElement('div');
  results.id = 'analysisResults';
  results.style.marginTop = '24px';
  el.appendChild(results);

  return el;
}

// ── File handling ─────────────────────────────────────────────────────────────

function _processFile(file, dropZone) {
  if (file.type !== 'application/pdf') {
    alert('Please upload a PDF file. For other formats, copy and paste the text instead.');
    return;
  }
  // 700KB limit — keeps the base64 payload safely under Netlify's 1MB function limit
  if (file.size > 700 * 1024) {
    alert('This PDF is too large for direct upload (max 700KB). Please paste the abstract or key text instead.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    // FileReader gives us a data URL like "data:application/pdf;base64,AAAA..."
    // We strip the prefix to get just the base64 data.
    const base64 = e.target.result.split(',')[1];
    _uploadedFileBase64 = base64;
    _uploadedMimeType   = 'application/pdf';

    dropZone.innerHTML = `
      <div style="font-size:1.8rem;margin-bottom:6px">✅</div>
      <div style="font-weight:600;color:var(--caes-green-mid);margin-bottom:4px">${file.name}</div>
      <div style="font-size:0.78rem;color:var(--text-muted)">${(file.size / 1024).toFixed(0)} KB · Ready to analyze</div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">Click to change file</div>
      <input type="file" id="fileInput" accept=".pdf" style="display:none">
    `;
    dropZone.querySelector('#fileInput').addEventListener('change', function () {
      if (this.files[0]) _processFile(this.files[0], dropZone);
    });
  };
  reader.readAsDataURL(file);
}

function _clearUpload() {
  _uploadedFileBase64 = null;
  _uploadedMimeType   = null;
  _analysisPrefill    = {};
  // Re-render the view fresh
  setView('research-match');
}

// ── Core analysis ─────────────────────────────────────────────────────────────

async function _analyzeDocument() {
  const text    = document.getElementById('abstractInput')?.value?.trim();
  const hasFile = !!_uploadedFileBase64;
  const hasText = !!text;

  if (!hasFile && !hasText) {
    alert('Please upload a PDF or paste your research text first.');
    return;
  }

  const btn     = document.getElementById('analyzeBtn');
  const results = document.getElementById('analysisResults');

  if (btn) { btn.disabled = true; btn.textContent = 'Analyzing…'; }

  results.innerHTML = `
    <div class="card" style="text-align:center;padding:40px 24px">
      <div style="font-size:2rem;margin-bottom:12px">🔬</div>
      <div style="font-weight:700;color:var(--text-primary);margin-bottom:6px;font-size:1rem">Grant is reading your research…</div>
      <div style="font-size:0.83rem;color:var(--text-secondary);line-height:1.6">
        Analyzing themes · Matching funding databases · Checking compliance · Drafting your NOI title
      </div>
    </div>
  `;

  try {
    const payload = {};
    if (hasFile) { payload.fileBase64 = _uploadedFileBase64; payload.mimeType = _uploadedMimeType; }
    if (hasText)   payload.text = text;

    const res  = await fetch('/.netlify/functions/analyze-doc', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      results.innerHTML = `<div class="card"><div style="color:#f87171;font-size:0.85rem">Analysis failed: ${data.error || 'Unknown error. Please try again.'}</div></div>`;
      return;
    }

    _renderResults(data, results);

    // Grant speaks a brief summary
    const matchCount = _matchOpportunities(data).length;
    const summary = data.researchSummary?.split('. ')[0] || '';
    GRANT_TTS.speak(`I've analyzed your research. ${summary}. I found ${matchCount} matching funding opportunit${matchCount === 1 ? 'y' : 'ies'} in our database. Check the results below, and when you're ready I can pre-fill your NOI with everything I found.`);

  } catch (err) {
    results.innerHTML = `<div class="card"><div style="color:#f87171;font-size:0.85rem">Could not connect. Please check your connection and try again.</div></div>`;
    console.error('Analysis error:', err);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔍 Find Matching Grants'; }
  }
}

// ── Opportunity matching ──────────────────────────────────────────────────────
// Takes Gemini's extracted keywords and compares them against OPPORTUNITIES_DATA.
// This is the "bridge" between the AI analysis and our local database.

function _matchOpportunities(analysis) {
  if (typeof OPPORTUNITIES_DATA === 'undefined') return [];

  const keywords = [
    ...(analysis.keywords || []),
    ...(analysis.researchThemes || []),
    ...(analysis.matchedOpportunityKeywords || [])
  ].map(k => k.toLowerCase().trim()).filter(k => k.length > 3);

  return OPPORTUNITIES_DATA.filter(opp => {
    const haystack = [opp.title, opp.program, opp.sponsor, opp.piDept, opp.type]
      .filter(Boolean).join(' ').toLowerCase();
    return keywords.some(kw => haystack.includes(kw));
  }).slice(0, 6);
}

// ── Results rendering ─────────────────────────────────────────────────────────

function _renderResults(data, container) {
  container.innerHTML = '';

  const matches = _matchOpportunities(data);

  // Store prefill for the NOI wizard
  _analysisPrefill = {
    title:    data.suggestedTitle  || '',
    sponsor:  data.suggestedSponsors?.[0] || '',
    program:  data.suggestedPrograms?.[0] || '',
    summary:  data.researchSummary || '',
    human:    data.complianceFlags?.humanSubjects || false,
    animal:   data.complianceFlags?.animals       || false,
    biohazard:data.complianceFlags?.biohazard     || false,
    export:   data.complianceFlags?.exportControl  || false
  };

  // 1 ── Research summary
  _appendCard(container, `
    <div class="card-title" style="margin-bottom:10px">📋 Research Analysis</div>
    <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.65;margin-bottom:14px">${data.researchSummary || ''}</p>
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:${data.piExpertise ? '12px' : '0'}">
      ${(data.researchThemes || []).map(t => `<span class="badge badge-info">${t}</span>`).join('')}
    </div>
    ${data.piExpertise ? `<div style="font-size:0.79rem;color:var(--text-muted);margin-top:4px">Expertise identified: <em>${data.piExpertise}</em></div>` : ''}
    ${data.estimatedBudgetRange ? `<div style="font-size:0.83rem;color:var(--aggie-gold);font-weight:700;margin-top:10px">Typical award range: ${data.estimatedBudgetRange}</div>` : ''}
  `);

  // 2 ── Compliance flags (only if any detected)
  const c = data.complianceFlags || {};
  if (c.humanSubjects || c.animals || c.biohazard || c.exportControl) {
    _appendCard(container, `
      <div class="card-title" style="margin-bottom:10px">⚠️ Compliance Requirements Detected</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        ${c.humanSubjects ? '<span class="badge badge-danger">Human Subjects — IRB Required</span>' : ''}
        ${c.animals       ? '<span class="badge badge-danger">Animal Use — IACUC Required</span>' : ''}
        ${c.biohazard     ? '<span class="badge badge-danger">Biohazardous Materials — IBC</span>' : ''}
        ${c.exportControl ? '<span class="badge badge-warning">Export Control Review</span>' : ''}
      </div>
      <div style="font-size:0.79rem;color:var(--text-muted)">These will be automatically checked when you start your NOI.</div>
    `);
  }

  // 3 ── Matched opportunities
  const oppCard = document.createElement('div');
  oppCard.className = 'card';
  oppCard.style.marginBottom = '14px';
  oppCard.innerHTML = `<div class="card-title" style="margin-bottom:12px">🎯 Matched Funding Opportunities <span style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">(${matches.length} found)</span></div>`;

  if (matches.length === 0) {
    oppCard.innerHTML += `
      <div style="color:var(--text-secondary);font-size:0.84rem;line-height:1.6">
        No direct matches in our local database for this research area — but based on your work, I recommend exploring:
        <strong style="color:var(--text-primary)">${(data.suggestedSponsors || ['USDA NIFA', 'NSF']).join(', ')}</strong>
      </div>`;
  } else {
    matches.forEach((opp, i) => {
      const row = document.createElement('div');
      row.style.cssText = `padding:10px 0;${i < matches.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}`;
      row.innerHTML = `
        <div style="font-weight:600;font-size:0.88rem;color:var(--text-primary)">${opp.title}</div>
        <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:3px">
          ${opp.sponsor} · ${opp.program || opp.type} · <span style="color:var(--aggie-gold);font-weight:600">$${(opp.estimatedFunding / 1000).toFixed(0)}K</span>
        </div>
      `;
      oppCard.appendChild(row);
    });
  }
  container.appendChild(oppCard);

  // 4 ── AI-recommended sponsors
  if (data.suggestedSponsors?.length) {
    _appendCard(container, `
      <div class="card-title" style="margin-bottom:10px">💡 AI-Recommended Sponsors & Programs</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:${data.suggestedPrograms?.length ? '10px' : '0'}">
        ${data.suggestedSponsors.map(s => `<span class="badge badge-info">${s}</span>`).join('')}
      </div>
      ${data.suggestedPrograms?.length ? `<div style="font-size:0.8rem;color:var(--text-secondary)">Programs: ${data.suggestedPrograms.join(' · ')}</div>` : ''}
    `);
  }

  // 5 ── CTA — launch pre-filled NOI
  const cta = document.createElement('div');
  cta.className = 'card';
  cta.style.cssText = 'background:rgba(253,185,39,0.06);border-color:rgba(253,185,39,0.25);margin-bottom:8px';
  cta.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
      <div>
        <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px">Ready to apply?</div>
        <div style="font-size:0.82rem;color:var(--text-secondary)">Grant has pre-filled your NOI with the analysis. Just review, adjust, and submit.</div>
      </div>
      <button class="btn btn-primary" onclick="_launchPrefilledNOI()">📝 Start Pre-Filled NOI →</button>
    </div>
    ${data.suggestedTitle ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:10px;border-top:1px solid var(--border);padding-top:10px">Suggested title: <em>"${data.suggestedTitle}"</em></div>` : ''}
  `;
  container.appendChild(cta);
}

function _appendCard(container, html) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.marginBottom = '14px';
  card.innerHTML = html;
  container.appendChild(card);
}

function _launchPrefilledNOI() {
  st.noiData   = { ...(st.noiData || {}), ..._analysisPrefill };
  st.wizardStep = 0;
  setView('noi-wizard');
  addMessage('ai', `I've pre-filled your NOI with everything from the analysis — title, sponsor, summary, and compliance flags. Review each step and adjust anything before submitting.`);
  GRANT_TTS.speak('Your NOI is pre-filled. Review each step in the wizard and make any adjustments before you submit.');
}
