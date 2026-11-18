/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================
   Proposal Idea Builder — "Drop Your Idea Here"
   ─────────────────────────────────────────────
   Prominent workspace view where PIs paste a
   research idea and Granted! generates:
     • Matching funding opportunities
     • Draft abstract / project summary
     • Suggested timeline
     • Budget range estimate
     • Compliance flags
     • Potential collaborators
   ============================================ */

// Proposal builder state
const _pb = {
  idea: '',
  loading: false,
  result: null,
  error: null
};

function renderProposalBuilder() {
  const el = document.createElement('div');
  el.className = 'proposal-builder-view';

  const inst   = window.INSTITUTION_CONFIG?.institution;
  const shortName = inst?.shortName || 'NC A&T';

  // If we have results, show them
  if (_pb.result) {
    el.innerHTML = _renderProposalResults(shortName);
    return el;
  }

  // Login reminder for unauthenticated users
  if (!st.currentUser) {
    const reminder = document.createElement('div');
    reminder.className = 'login-reminder-banner';
    reminder.innerHTML = `
      <div class="login-reminder-inner">
        <span class="login-reminder-icon">🔐</span>
        <div class="login-reminder-text">
          <strong>Sign in to save your analysis</strong>
          <span>Login with Google so your results are saved and you can continue to the NOI Wizard.</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="signInWithGoogle()">Login Now</button>
        <button class="login-reminder-dismiss" onclick="this.closest('.login-reminder-banner').remove()" title="Dismiss">✕</button>
      </div>
    `;
    el.appendChild(reminder);
  }

  el.innerHTML += `

    <!-- ── HERO PROMPT ── -->
    <div class="pb-hero">
      <div class="pb-hero-icon">💡</div>
      <h1 class="pb-hero-title">Drop Your <span>Research Idea</span></h1>
      <p class="pb-hero-sub">
        Describe your research concept below — even a rough idea works. GRANT will analyze it and generate a personalized roadmap including matching funding, a draft abstract, timeline, and compliance flags.
      </p>
    </div>

    <!-- ── IDEA INPUT ── -->
    <div class="pb-input-card">
      <label class="pb-label" for="pbIdea">
        <span class="pb-label-icon">🔬</span>
        Your Research Idea
      </label>
      <textarea id="pbIdea" class="pb-textarea" rows="6"
                placeholder="Example: I want to study the impact of cover crops on soil carbon sequestration in small farms across the Southeast United States, comparing conventional vs. regenerative agricultural practices using sensor networks and drone imagery..."
                oninput="_pb.idea = this.value">${_pb.idea}</textarea>
      <div class="pb-char-count" id="pbCharCount">${_pb.idea.length} characters</div>

      <div class="pb-options-row">
        <div class="pb-option-group">
          <label class="pb-option-label" for="pbDept">Department</label>
          <select id="pbDept" class="pb-select">
            <option value="">Auto-detect</option>
            <option value="NRCS">Natural Resources & Environmental Design</option>
            <option value="ANSC">Animal Sciences</option>
            <option value="AGRI">Agriculture</option>
            <option value="FACS">Family & Consumer Sciences</option>
            <option value="AGEC">Agribusiness & Applied Econ.</option>
          </select>
        </div>
        <div class="pb-option-group">
          <label class="pb-option-label" for="pbBudget">Target Budget Range</label>
          <select id="pbBudget" class="pb-select">
            <option value="">Any</option>
            <option value="pilot">Pilot / Seed (< $50K)</option>
            <option value="small">Small ($50K – $250K)</option>
            <option value="medium">Medium ($250K – $1M)</option>
            <option value="large">Large ($1M+)</option>
          </select>
        </div>
      </div>

      <div class="pb-actions">
        <button class="btn btn-primary btn-lg pb-submit-btn" id="pbSubmitBtn"
                onclick="submitProposalIdea()" ${_pb.loading ? 'disabled' : ''}>
          ${_pb.loading
            ? '<span class="typing-dots"><span></span><span></span><span></span></span> Analyzing…'
            : '🚀 Analyze My Idea'}
        </button>
      </div>

      ${_pb.error ? `<div class="pb-error">⚠ ${_pb.error}</div>` : ''}
    </div>

    <!-- ── EXAMPLE PROMPTS ── -->
    <div class="pb-examples">
      <div class="pb-examples-label">💬 Or try one of these examples:</div>
      <div class="pb-chips-row">
        <button class="pb-chip" onclick="_fillExample(0)">Precision Agriculture Sensors</button>
        <button class="pb-chip" onclick="_fillExample(1)">Urban Food Desert Solutions</button>
        <button class="pb-chip" onclick="_fillExample(2)">Sustainable Packaging Research</button>
        <button class="pb-chip" onclick="_fillExample(3)">Youth STEM Outreach</button>
      </div>
    </div>

    <!-- ── HOW IT WORKS ── -->
    <div class="pb-how-it-works">
      <h3>How It Works</h3>
      <div class="pb-steps-row">
        <div class="pb-step">
          <div class="pb-step-num">1</div>
          <div class="pb-step-text">Describe your research idea in plain language</div>
        </div>
        <div class="pb-step-arrow">→</div>
        <div class="pb-step">
          <div class="pb-step-num">2</div>
          <div class="pb-step-text">AI matches funding programs & generates materials</div>
        </div>
        <div class="pb-step-arrow">→</div>
        <div class="pb-step">
          <div class="pb-step-num">3</div>
          <div class="pb-step-text">Review, refine, and start your NOI</div>
        </div>
      </div>
    </div>

  `;

  // Wire up character count
  requestAnimationFrame(() => {
    const ta = document.getElementById('pbIdea');
    if (ta) {
      ta.addEventListener('input', () => {
        const c = document.getElementById('pbCharCount');
        if (c) c.textContent = `${ta.value.length} characters`;
      });
    }
  });

  return el;
}

// ── Example prompts ────────────────────────────────────────────────────────

const _PB_EXAMPLES = [
  "I want to develop low-cost IoT sensor networks for monitoring soil moisture, temperature, and nutrient levels on small farms in North Carolina. The sensors would transmit data via LoRaWAN to a cloud dashboard where farmers can see real-time field conditions and receive AI-generated irrigation and fertilization recommendations.",
  "My research would investigate the role of community gardens and mobile markets in reducing food insecurity in urban food deserts across the Piedmont Triad region. We'd partner with local churches and community organizations to establish sustainable food access points and measure health outcomes over a 3-year period.",
  "I'm interested in developing biodegradable packaging alternatives from agricultural byproducts (corn stover, sweet potato waste) that could replace petroleum-based food packaging. The research would include material science characterization, shelf-life testing, and a life-cycle assessment comparing carbon footprint to conventional plastics.",
  "We want to create a summer STEM bridge program for rural high school students from underrepresented communities, introducing them to agricultural technology, drone operation, environmental science, and data analytics through hands-on projects at the university farm."
];

function _fillExample(idx) {
  _pb.idea = _PB_EXAMPLES[idx] || '';
  render();
  requestAnimationFrame(() => {
    const ta = document.getElementById('pbIdea');
    if (ta) { ta.focus(); ta.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  });
}

// ── Submit & AI Generation ─────────────────────────────────────────────────

async function submitProposalIdea() {
  const idea = document.getElementById('pbIdea')?.value.trim();
  if (!idea || idea.length < 20) {
    _pb.error = 'Please describe your research idea in at least a sentence or two.';
    render();
    return;
  }

  _pb.loading = true;
  _pb.error = null;
  _pb.idea = idea;
  render();

  const dept   = document.getElementById('pbDept')?.value || 'any';
  const budget = document.getElementById('pbBudget')?.value || 'any';

  const systemPrompt = `You are Granted!, the AI Grant Assistant for NC A&T State University's College of Agriculture & Environmental Sciences.

A researcher has shared a research idea. Analyze it and produce a structured proposal starter package.

Respond in EXACTLY this JSON format (no markdown fencing, just raw JSON):
{
  "title": "Suggested project title",
  "abstract": "A 200-word project summary suitable for an NOI or LOI",
  "matchingFunding": [
    {"program": "Name of funding program", "sponsor": "Agency name", "fit": "High/Medium", "reason": "1-sentence why this fits", "deadline": "Typical deadline month or 'Rolling'", "range": "$50K-$250K"}
  ],
  "timeline": [
    {"phase": "Phase name", "duration": "e.g. Months 1-6", "activities": "Key activities"}
  ],
  "budgetEstimate": {
    "range": "$XXK - $XXXK",
    "breakdown": {"personnel": "XX%", "equipment": "XX%", "supplies": "XX%", "travel": "XX%", "other": "XX%", "idc": "XX%"}
  },
  "complianceFlags": ["Flag 1", "Flag 2"],
  "collaborationOpportunities": ["Suggestion 1", "Suggestion 2"],
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}

Important guidelines:
- Match funding programs that are real and relevant to HBCUs, 1890 institutions, or ${dept !== 'any' ? dept : 'CAES departments'}
- Include USDA NIFA, NSF, NIH, EPA, DOE, and foundation sources as appropriate
- Budget should factor NC A&T's IDC rate (currently negotiated with the federal government)
- Flag any IRB, IACUC, environmental review, or data management requirements
- Suggest potential cross-college collaboration areas at NC A&T
${budget !== 'any' ? `- Target budget range preference: ${budget}` : ''}`;

  try {
    const resp = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: idea }] }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.6 }
        }
      })
    });

    if (!resp.ok) throw new Error(`API returned ${resp.status}`);
    const data = await resp.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) throw new Error('Empty response');

    // Parse JSON (strip markdown fences if present)
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    _pb.result = JSON.parse(cleaned);
    _pb.loading = false;
    _pb.error = null;

    // 🎉 Celebrate successful analysis!
    CONFETTI.celebrate();

    // Voice announcement
    GRANT_TTS.speak(`Great news! I've analyzed your research idea and found ${_pb.result.matchingFunding?.length || 'several'} potential funding matches. Let me walk you through what I found.`);

    render();

  } catch (e) {
    console.error('Proposal analysis failed:', e);
    _pb.loading = false;
    _pb.error = `Analysis failed: ${e.message}. Try again or refine your idea.`;
    render();
  }
}

// ── Results Rendering ──────────────────────────────────────────────────────

function _renderProposalResults(shortName) {
  const r = _pb.result;
  if (!r) return '';

  return `
    <!-- Back button -->
    <div class="pb-back-row">
      <button class="btn btn-secondary" onclick="_pb.result=null; render()">← New Idea</button>
      <h2 class="pb-results-title">Proposal Analysis <span>Complete</span></h2>
    </div>

    <!-- Project title -->
    <div class="pb-result-card pb-title-card">
      <div class="pb-card-tag">Suggested Project Title</div>
      <h2 class="pb-project-title">${r.title || 'Untitled Project'}</h2>
    </div>

    <!-- Abstract -->
    <div class="pb-result-card">
      <div class="pb-card-tag">Draft Abstract / Project Summary</div>
      <p class="pb-abstract-text">${r.abstract || ''}</p>
      <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(\`${(r.abstract || '').replace(/`/g, "'")}\`); this.textContent='✓ Copied!'">📋 Copy Abstract</button>
    </div>

    <!-- Matching Funding -->
    <div class="pb-result-card">
      <div class="pb-card-tag">🔍 Matching Funding Programs</div>
      <div class="pb-funding-grid">
        ${(r.matchingFunding || []).map(f => `
          <div class="pb-funding-item">
            <div class="pb-funding-header">
              <span class="pb-funding-fit pb-fit-${(f.fit || 'Medium').toLowerCase()}">${f.fit || 'Medium'} Fit</span>
              <span class="pb-funding-range">${f.range || ''}</span>
            </div>
            <h4 class="pb-funding-name">${f.program}</h4>
            <div class="pb-funding-sponsor">${f.sponsor}</div>
            <p class="pb-funding-reason">${f.reason}</p>
            <div class="pb-funding-deadline">📅 ${f.deadline || 'Check sponsor site'}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Timeline -->
    <div class="pb-result-card">
      <div class="pb-card-tag">📅 Suggested Project Timeline</div>
      <div class="pb-timeline">
        ${(r.timeline || []).map((t, i) => `
          <div class="pb-timeline-phase">
            <div class="pb-phase-marker">${i + 1}</div>
            <div class="pb-phase-content">
              <strong>${t.phase}</strong> <span class="pb-phase-dur">${t.duration}</span>
              <p>${t.activities}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Budget -->
    <div class="pb-result-card">
      <div class="pb-card-tag">💰 Budget Estimate</div>
      <div class="pb-budget-range">${r.budgetEstimate?.range || 'TBD'}</div>
      <div class="pb-budget-bars">
        ${Object.entries(r.budgetEstimate?.breakdown || {}).map(([k, v]) => `
          <div class="pb-budget-row">
            <span class="pb-budget-label">${k.charAt(0).toUpperCase() + k.slice(1)}</span>
            <div class="pb-budget-bar-track">
              <div class="pb-budget-bar-fill" style="width:${parseInt(v) || 5}%"></div>
            </div>
            <span class="pb-budget-pct">${v}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Compliance Flags -->
    ${(r.complianceFlags?.length) ? `
      <div class="pb-result-card pb-compliance-card">
        <div class="pb-card-tag">⚠️ Compliance Flags</div>
        <ul class="pb-flag-list">
          ${r.complianceFlags.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <!-- Collaboration -->
    ${(r.collaborationOpportunities?.length) ? `
      <div class="pb-result-card">
        <div class="pb-card-tag">🤝 Cross-College Collaboration Opportunities</div>
        <ul class="pb-collab-list">
          ${r.collaborationOpportunities.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <!-- Next Steps -->
    <div class="pb-result-card pb-next-steps-card">
      <div class="pb-card-tag">✅ Recommended Next Steps</div>
      <ol class="pb-next-list">
        ${(r.nextSteps || []).map(s => `<li>${s}</li>`).join('')}
      </ol>
      <div class="pb-actions-row">
        <button class="btn btn-primary" onclick="setView('noi-wizard')">📝 Start NOI Now</button>
        <button class="btn btn-secondary" onclick="setView('opportunities')">🔍 Browse All Funding</button>
        <button class="btn btn-secondary" onclick="handleChat('Based on my research idea about ${(r.title || '').replace(/'/g, "\\'")}  — what should I prioritize first?'); setView('dashboard')">💬 Ask Granted!</button>
      </div>
    </div>

  `;
}
