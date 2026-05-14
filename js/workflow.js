/* ============================================
   Workflow — Research Idea → Full Results View
   Triggered by the proposal builder input.
   Replaces the workspace with structured cards.
   ============================================ */

// ── Entry point ───────────────────────────────────────────────────────────────

async function launchWorkflow() {
  const input = document.getElementById('ideaInput');
  const idea  = input?.value?.trim();
  if (!idea) return;

  // Match opportunities with OR+relevance scoring
  const terms   = idea.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const scored  = OPPORTUNITIES_DATA.map(o => {
    const hay = [o.title, o.piName, o.piDept, o.sponsor, o.program || '']
      .join(' ').toLowerCase();
    return { ...o, _score: terms.filter(t => hay.includes(t)).length };
  }).filter(o => o._score > 0).sort((a, b) => b._score - a._score);

  // Transition to workflow view immediately with loading state
  st.workflowQuery   = idea;
  st.workflowMatches = scored;
  st.workflowResult  = null;
  st.workflowLoading = true;
  st.view = 'workflow';
  if (input) input.value = '';
  render();

  // Build context for Gemini
  const oppContext = scored.length
    ? scored.slice(0, 5).map(o =>
        `• ${o.title} — ${o.sponsor}${o.program ? ', ' + o.program : ''}, $${Number(o.estimatedFunding||0).toLocaleString()}, ${o.type}`
      ).join('\n')
    : '• No exact database matches — suggest external programs';

  const prompt = `You are a grant expert at NC A&T CAES (College of Agriculture & Environmental Sciences), an 1890 land-grant HBCU.

A researcher described their idea: "${idea}"

Matching grants already in our database:
${oppContext}

Return ONLY a valid JSON object — no markdown, no explanation, just the JSON:
{
  "fundingMatches": [
    {"name": "Sponsor name", "program": "Program name", "rationale": "One sentence why this fits"}
  ],
  "abstract": "A 150-word NOI abstract for this research idea ready to paste into the NC A&T Notice of Intent form. Start with the problem, describe the approach, state expected outcomes.",
  "compliance": [
    {"item": "IRB", "required": true, "note": "Brief reason why"}
  ],
  "timeline": [
    {"timeframe": "10 weeks out", "action": "Action to take"}
  ]
}

Rules:
- fundingMatches: 4–5 items, include specific federal programs (USDA NIFA, NSF, NIH, DOE, EPA, DOD etc.)
- compliance: check all 6 — IRB (human subjects), IACUC (animal use), Biohazard, Radioactive Materials, Export Control, Conflict of Interest
- timeline: exactly 6 steps from 10 weeks out to submission day
- abstract: exactly 150 words, grant-ready prose`;

  try {
    const resp = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        payload: {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.4 }
        }
      })
    });
    const data = await resp.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if Gemini wraps in ```json
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const result = JSON.parse(clean);

    st.workflowResult  = result;
    st.workflowLoading = false;

    // Speak a short summary
    const count = st.workflowMatches.length;
    GRANT_TTS.speak(
      `I found ${count > 0 ? count + ' matching opportunit' + (count === 1 ? 'y' : 'ies') + ' in our database and' : ''} ` +
      `${result.fundingMatches?.length || 0} recommended funding programs. Your NOI abstract is ready to copy. Check the compliance flags before submitting.`
    );
  } catch (err) {
    // Fallback — show what we have locally
    st.workflowResult  = _workflowFallback(idea, scored);
    st.workflowLoading = false;
  }

  render();
}

function _workflowFallback(idea, matches) {
  return {
    fundingMatches: [
      { name: 'USDA NIFA', program: 'AFRI Foundational', rationale: 'Primary federal funder for agriculture and environmental research at 1890 land-grant institutions.' },
      { name: 'National Science Foundation', program: 'CBET / ENG', rationale: 'Supports foundational research in engineering, environment, and emerging technologies.' },
      { name: 'USDA NIFA', program: '1890 Capacity Building Grant', rationale: 'Dedicated funding stream for NC A&T as a historically Black land-grant institution.' }
    ],
    abstract: `This project addresses critical challenges in ${idea.toLowerCase()}. ` +
      `Researchers at NC A&T CAES will investigate innovative approaches to advance understanding in this domain. ` +
      `The project will leverage the university's expertise and partnerships with community stakeholders. ` +
      `Expected outcomes include peer-reviewed publications, trained graduate students, and actionable recommendations ` +
      `for practitioners. This research aligns with the USDA and NSF priorities for agricultural innovation and ` +
      `environmental sustainability. NC A&T's position as an 1890 land-grant HBCU uniquely positions this work ` +
      `to address equity and access in research outcomes.`,
    compliance: [
      { item: 'IRB — Human Subjects', required: false, note: 'Confirm if surveys or interviews are planned' },
      { item: 'IACUC — Animal Use', required: false, note: 'Confirm if animal studies are involved' },
      { item: 'Biohazard / IBC', required: false, note: 'Confirm if biological materials are used' },
      { item: 'Radioactive Materials', required: false, note: 'Unlikely for this research area' },
      { item: 'Export Control', required: false, note: 'Confirm if international collaborators or controlled technology' },
      { item: 'Conflict of Interest', required: false, note: 'Disclose any financial interests related to this work' }
    ],
    timeline: [
      { timeframe: '10 weeks out', action: 'Submit Notice of Intent to Associate Dean for Research' },
      { timeframe: '8 weeks out', action: 'Department Chair and Associate Dean review and sign' },
      { timeframe: '6 weeks out', action: 'OSP initial review — budget and compliance check' },
      { timeframe: '4 weeks out', action: 'Complete full proposal in InfoEd — budget finalized' },
      { timeframe: '2 weeks out', action: 'OSP final review and sponsor portal entry' },
      { timeframe: 'Deadline day', action: 'OSP submits to sponsor portal on your behalf' }
    ]
  };
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderWorkflow() {
  const el = document.createElement('div');

  // ── Header ──
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap';
  header.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="st.view='dashboard';st.workflowResult=null;render()">← Dashboard</button>
    <div style="flex:1;min-width:200px">
      <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-bottom:3px">Results for</div>
      <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary)">"${st.workflowQuery}"</div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="workflowRefine" class="workflow-refine-input"
             placeholder="Refine your idea…" value="${st.workflowQuery}"
             onkeydown="if(event.key==='Enter'){document.getElementById('ideaInput').value=this.value;launchWorkflow()}"
             style="font-size:0.83rem">
      <button class="btn btn-primary btn-sm"
              onclick="document.getElementById('ideaInput').value=document.getElementById('workflowRefine').value;launchWorkflow()">
        Search →
      </button>
    </div>
  `;
  el.appendChild(header);

  if (st.workflowLoading) {
    el.appendChild(_renderWorkflowSkeleton());
    return el;
  }

  const r       = st.workflowResult || {};
  const matches = st.workflowMatches || [];

  // ── Section 1: Matched Opportunities ──
  const oppSection = document.createElement('div');
  oppSection.className = 'workflow-section';
  oppSection.innerHTML = `
    <div class="workflow-section-label">
      🔍 Database Matches
      <span class="workflow-section-count">${matches.length} found</span>
    </div>
  `;

  if (matches.length === 0) {
    oppSection.innerHTML += `
      <div class="workflow-empty">No exact matches in the NC A&T database — see AI-suggested sponsors below.</div>
    `;
  } else {
    const cards = document.createElement('div');
    cards.className = 'workflow-opp-row';
    matches.slice(0, 6).forEach(o => {
      const stage = PIPELINE_STAGES.find(s => s.id === o.stage);
      const card  = document.createElement('div');
      card.className = 'workflow-opp-card';
      card.innerHTML = `
        <div class="workflow-opp-sponsor">${o.sponsor}</div>
        <div class="workflow-opp-title">${o.title}</div>
        <div class="workflow-opp-meta">${o.piName} · ${o.piDept}</div>
        <div class="workflow-opp-footer">
          <span style="color:var(--aggie-gold);font-weight:700">$${(o.estimatedFunding/1000).toFixed(0)}K</span>
          <span class="stage-badge-sm" style="background:${stage?.color||'#888'}22;color:${stage?.color||'#888'}">Stage ${o.stage}</span>
        </div>
      `;
      card.onclick = () => { st.activeOpportunity = o.id; setView('pipeline'); };
      cards.appendChild(card);
    });
    oppSection.appendChild(cards);
  }
  el.appendChild(oppSection);

  // ── Section 2: Two-col — Abstract + Compliance ──
  const midRow = document.createElement('div');
  midRow.className = 'workflow-mid-row';

  // Abstract card
  const abstractCard = document.createElement('div');
  abstractCard.className = 'card workflow-abstract-card';
  abstractCard.innerHTML = `
    <div class="workflow-section-label" style="margin-bottom:12px">📝 NOI Abstract <span class="workflow-section-count">Ready to copy</span></div>
    <p class="workflow-abstract-text" id="workflowAbstract">${r.abstract || '—'}</p>
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" onclick="_copyWorkflowAbstract()">📋 Copy Abstract</button>
      <button class="btn btn-primary btn-sm" onclick="_startNOIFromWorkflow()">Start NOI →</button>
    </div>
  `;
  midRow.appendChild(abstractCard);

  // Compliance card
  const compCard = document.createElement('div');
  compCard.className = 'card workflow-compliance-card';
  compCard.innerHTML = `<div class="workflow-section-label" style="margin-bottom:12px">⚠️ Compliance Review</div>`;
  const items = r.compliance || [];
  if (items.length === 0) {
    compCard.innerHTML += `<div class="workflow-empty">Compliance analysis not available.</div>`;
  } else {
    items.forEach(c => {
      const flag = document.createElement('div');
      flag.className = 'workflow-compliance-item';
      flag.innerHTML = `
        <span class="compliance-dot ${c.required ? 'dot-required' : 'dot-clear'}"></span>
        <div>
          <div class="compliance-item-label ${c.required ? 'required' : ''}">${c.item}</div>
          <div class="compliance-item-note">${c.note}</div>
        </div>
      `;
      compCard.appendChild(flag);
    });
  }
  midRow.appendChild(compCard);
  el.appendChild(midRow);

  // ── Section 3: AI Suggested Sponsors ──
  const sponsorSection = document.createElement('div');
  sponsorSection.className = 'workflow-section';
  sponsorSection.innerHTML = `<div class="workflow-section-label">🏆 Recommended Funding Programs</div>`;
  const fundingMatches = r.fundingMatches || [];
  if (fundingMatches.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'workflow-sponsor-grid';
    fundingMatches.forEach((f, i) => {
      grid.innerHTML += `
        <div class="workflow-sponsor-card">
          <div class="sponsor-rank">${i + 1}</div>
          <div class="sponsor-body">
            <div class="sponsor-name">${f.name}</div>
            <div class="sponsor-program">${f.program}</div>
            <div class="sponsor-rationale">${f.rationale}</div>
          </div>
        </div>
      `;
    });
    sponsorSection.appendChild(grid);
  }
  el.appendChild(sponsorSection);

  // ── Section 4: Timeline ──
  const timelineSection = document.createElement('div');
  timelineSection.className = 'workflow-section';
  timelineSection.innerHTML = `<div class="workflow-section-label">⏰ Submission Timeline</div>`;
  const steps = r.timeline || [];
  if (steps.length > 0) {
    const track = document.createElement('div');
    track.className = 'workflow-timeline';
    steps.forEach((s, i) => {
      track.innerHTML += `
        <div class="workflow-timeline-step">
          <div class="wt-dot ${i === steps.length - 1 ? 'wt-dot-final' : ''}"></div>
          ${i < steps.length - 1 ? '<div class="wt-line"></div>' : ''}
          <div class="wt-timeframe">${s.timeframe}</div>
          <div class="wt-action">${s.action}</div>
        </div>
      `;
    });
    timelineSection.appendChild(track);
  }
  el.appendChild(timelineSection);

  // ── CTA ──
  const cta = document.createElement('div');
  cta.className = 'workflow-cta';
  cta.innerHTML = `
    <button class="btn btn-primary" onclick="_startNOIFromWorkflow()">📝 Open NOI Wizard with This Research →</button>
    <button class="btn btn-secondary" onclick="setView('opportunities')">🔍 Browse All Opportunities</button>
  `;
  el.appendChild(cta);

  return el;
}

function _renderWorkflowSkeleton() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="workflow-section">
      <div class="workflow-section-label">🔍 Database Matches <span class="workflow-section-count">searching…</span></div>
      <div class="workflow-opp-row">
        ${[1,2,3].map(() => `<div class="workflow-opp-card skeleton-card"><div class="sk sk-title"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div></div>`).join('')}
      </div>
    </div>
    <div class="workflow-mid-row">
      <div class="card workflow-abstract-card">
        <div class="workflow-section-label" style="margin-bottom:12px">📝 NOI Abstract</div>
        <div class="workflow-generating">
          <div class="typing-dots"><span></span><span></span><span></span></div>
          <span style="margin-left:10px;font-size:0.83rem;color:var(--text-muted)">Grant is drafting your abstract…</span>
        </div>
      </div>
      <div class="card workflow-compliance-card">
        <div class="workflow-section-label" style="margin-bottom:12px">⚠️ Compliance Review</div>
        <div class="workflow-generating">
          <div class="typing-dots"><span></span><span></span><span></span></div>
          <span style="margin-left:10px;font-size:0.83rem;color:var(--text-muted)">Checking requirements…</span>
        </div>
      </div>
    </div>
    <div class="workflow-section">
      <div class="workflow-section-label">🏆 Recommended Funding Programs</div>
      <div class="sk sk-block"></div>
    </div>
    <div class="workflow-section">
      <div class="workflow-section-label">⏰ Submission Timeline</div>
      <div class="sk sk-block"></div>
    </div>
  `;
  return el;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _copyWorkflowAbstract() {
  const text = st.workflowResult?.abstract;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('button[onclick="_copyWorkflowAbstract()"]');
    if (btn) { btn.textContent = '✓ Copied'; setTimeout(() => { btn.textContent = '📋 Copy Abstract'; }, 2000); }
  });
}

function _startNOIFromWorkflow() {
  if (st.workflowResult?.abstract) {
    st.noiData = {
      ...st.noiData,
      title:   st.workflowQuery,
      summary: st.workflowResult.abstract
    };
  }
  setView('noi-wizard');
}
