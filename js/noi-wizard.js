/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================
   NOI Wizard — Step-by-step NOI Form
   ============================================ */

const WIZARD_STEPS = [
  { id: 'pi', label: 'PI Information' },
  { id: 'sponsor', label: 'Sponsor & Program' },
  { id: 'proposal', label: 'Proposal Details' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'budget', label: 'Budget & IDC' },
  { id: 'review', label: 'Review & Submit' }
];

function _esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderNOIWizard() {
  const el = document.createElement('div');
  const step = st.wizardStep || 0;
  const data = st.noiData || {};

  // Login reminder for unauthenticated users
  if (!st.currentUser) {
    const reminder = document.createElement('div');
    reminder.className = 'login-reminder-banner';
    reminder.innerHTML = `
      <div class="login-reminder-inner">
        <span class="login-reminder-icon">🔐</span>
        <div class="login-reminder-text">
          <strong>Sign in to save your work</strong>
          <span>Your NOI data won't be saved unless you're logged in. It takes 2 seconds with Google.</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="signInWithGoogle()">Login Now</button>
        <button class="login-reminder-dismiss" onclick="this.closest('.login-reminder-banner').remove()" title="Dismiss">✕</button>
      </div>
    `;
    el.appendChild(reminder);
  }

  el.innerHTML += `
    <div class="section-header">
      <h2>📝 NOI <span>Wizard</span></h2>
    </div>
    <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:20px">
      Complete the Notice of Intent form step-by-step. Grant will provide AI guidance at each step.
    </p>
  `;
  if (st._prefillNote) {
    el.innerHTML += `<div class="card prefill-note" role="status" style="margin-bottom:16px">${_esc(st._prefillNote)}</div>`;
  }

  // Step indicators
  const steps = document.createElement('div');
  steps.className = 'wizard-steps';
  WIZARD_STEPS.forEach((s, i) => {
    steps.innerHTML += `
      <div class="wizard-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}"
           onclick="goToWizardStep(${i})" style="cursor:pointer">
        <div class="wizard-step-num">${i < step ? '✓' : i + 1}</div>
        <span>${s.label}</span>
      </div>
    `;
  });
  el.appendChild(steps);

  // Form content
  const form = document.createElement('div');
  form.className = 'wizard-form';

  switch (step) {
    case 0: form.innerHTML = renderPIStep(data); break;
    case 1: form.innerHTML = renderSponsorStep(data); break;
    case 2: form.innerHTML = renderProposalStep(data); break;
    case 3: form.innerHTML = renderComplianceStep(data); break;
    case 4: form.innerHTML = renderBudgetStep(data); break;
    case 5: form.innerHTML = renderReviewStep(data); break;
  }

  // Navigation buttons
  form.innerHTML += `
    <div style="display:flex; gap:12px; margin-top:24px; padding-top:16px; border-top:1px solid var(--border)">
      ${step > 0 ? '<button class="btn btn-secondary" onclick="prevWizardStep()">← Previous</button>' : ''}
      <div style="flex:1"></div>
      ${step < 5 ? '<button class="btn btn-primary" onclick="nextWizardStep()">Next →</button>' : ''}
      ${step === 5 ? '<button class="btn btn-primary" onclick="submitNOI()">📤 Submit NOI</button>' : ''}
    </div>
  `;

  el.appendChild(form);
  return el;
}

function renderPIStep(d) {
  return `
    <h3 style="color:var(--text-primary); margin-bottom:16px">Principal Investigator Information</h3>
    <div class="form-row">
      <div class="form-group"><label for="noi-piName">PI Name</label><input type="text" id="noi-piName" value="${_esc(d.piName || '')}" placeholder="Dr. Jane Smith"></div>
      <div class="form-group"><label for="noi-piEmail">Email</label><input type="email" id="noi-piEmail" value="${_esc(d.piEmail || '')}" placeholder="jsmith@ncat.edu"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label for="noi-piDept">Department</label>
        <select id="noi-piDept">
          <option value="">Select Department</option>
          <option ${d.piDept === 'Animal Sciences' ? 'selected' : ''}>Animal Sciences</option>
          <option ${d.piDept === 'Agribusiness, Applied Economics & Agriscience Education' ? 'selected' : ''}>Agribusiness, Applied Economics & Agriscience Education</option>
          <option ${d.piDept === 'Built Environment' ? 'selected' : ''}>Built Environment</option>
          <option ${d.piDept === 'Cooperative Extension' ? 'selected' : ''}>Cooperative Extension</option>
          <option ${d.piDept === 'Family & Consumer Sciences' ? 'selected' : ''}>Family & Consumer Sciences</option>
          <option ${d.piDept === 'Landscape Architecture' ? 'selected' : ''}>Landscape Architecture</option>
          <option ${d.piDept === 'Natural Resources & Environmental Design' ? 'selected' : ''}>Natural Resources & Environmental Design</option>
          <option ${d.piDept === 'SFRIC' ? 'selected' : ''}>SFRIC</option>
        </select>
      </div>
      <div class="form-group"><label for="noi-piCollege">College</label>
        <select id="noi-piCollege">
          <option value="">Select College</option>
          ${Object.entries(COLLEGES).map(([k, v]) => `<option value="${k}" ${d.piCollege === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group"><label for="noi-coPIs">Co-PIs (if any)</label><textarea id="noi-coPIs" placeholder="Name, Department, Institution (one per line)">${_esc(d.coPIs || '')}</textarea></div>
  `;
}

function renderSponsorStep(d) {
  return `
    <h3 style="color:var(--text-primary); margin-bottom:16px">Sponsor & Solicitation</h3>
    <div class="form-row">
      <div class="form-group"><label for="noi-sponsor">Funding Agency / Sponsor</label>
        <select id="noi-sponsor">
          <option value="">Select Sponsor</option>
          ${Object.entries(SPONSORS).map(([k, v]) => `<option value="${v}" ${d.sponsor === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label for="noi-program">Program</label><input type="text" id="noi-program" value="${_esc(d.program || '')}" placeholder="e.g., AFRI Foundational"></div>
    </div>
    <div class="form-group"><label for="noi-solicitation">Solicitation Number / Link</label><input type="text" id="noi-solicitation" value="${_esc(d.solicitation || '')}" placeholder="e.g., USDA-NIFA-AFRI-2025-001"></div>
    <div class="form-group"><label for="noi-deadline">Submission Deadline</label><input type="date" id="noi-deadline" value="${_esc(d.deadline || '')}"></div>
    <div class="form-group"><label for="noi-type">Grant Type</label>
      <select id="noi-type">
        <option value="">Select Type</option>
        ${Object.entries(OPP_TYPES).map(([k, v]) => `<option value="${v}" ${d.type === v ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
    </div>
  `;
}

function renderProposalStep(d) {
  return `
    <h3 style="color:var(--text-primary); margin-bottom:16px">Proposal Details</h3>
    <div class="form-group"><label for="noi-title">Proposal Title</label><input type="text" id="noi-title" value="${_esc(d.title || '')}" placeholder="Full proposal title"></div>
    <div class="form-group"><label for="noi-summary">Project Summary (2-3 sentences)</label><textarea id="noi-summary" placeholder="Brief description of the proposed research...">${_esc(d.summary || '')}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label for="noi-funding">Estimated Total Funding</label><input type="number" id="noi-funding" value="${_esc(d.funding || '')}" placeholder="500000"></div>
      <div class="form-group"><label for="noi-duration">Duration</label><input type="text" id="noi-duration" value="${_esc(d.duration || '')}" placeholder="e.g., 36 months"></div>
    </div>
    <div class="form-group"><label for="noi-subrec">Subrecipients?</label>
      <select id="noi-subrec"><option value="no" ${d.subrec !== 'yes' ? 'selected' : ''}>No</option><option value="yes" ${d.subrec === 'yes' ? 'selected' : ''}>Yes</option></select>
    </div>
    <div class="form-group"><label for="noi-subInst">Subrecipient Institutions (if applicable)</label><input type="text" id="noi-subInst" value="${_esc(d.subInst || '')}" placeholder="e.g., NC State, Virginia State"></div>
  `;
}

function renderComplianceStep(d) {
  return `
    <h3 style="color:var(--text-primary); margin-bottom:16px">Compliance Requirements</h3>
    <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:16px">Check all that apply. Early identification ensures timely approvals.</p>
    <div class="form-group">
      <label><input type="checkbox" id="noi-human" ${d.human ? 'checked' : ''}> Human Subjects (IRB review required)</label>
    </div>
    <div class="form-group">
      <label><input type="checkbox" id="noi-animal" ${d.animal ? 'checked' : ''}> Animal Use (IACUC protocol required)</label>
    </div>
    <div class="form-group">
      <label><input type="checkbox" id="noi-radio" ${d.radio ? 'checked' : ''}> Radioactive Materials</label>
    </div>
    <div class="form-group">
      <label><input type="checkbox" id="noi-biohazard" ${d.biohazard ? 'checked' : ''}> Biohazardous Materials (IBC review)</label>
    </div>
    <div class="form-group">
      <label><input type="checkbox" id="noi-export" ${d.exportCtrl ? 'checked' : ''}> Export Control (international collaborators or restricted tech)</label>
    </div>
    <div class="form-group">
      <label><input type="checkbox" id="noi-coi" ${d.coi ? 'checked' : ''}> Conflict of Interest disclosure needed</label>
    </div>
  `;
}

function renderBudgetStep(d) {
  const idcRate = d.type === 'Capacity' ? 0 : 48;
  return `
    <h3 style="color:var(--text-primary); margin-bottom:16px">Budget & IDC</h3>
    <div class="form-row">
      <div class="form-group"><label for="noi-idc">IDC Rate</label><input type="text" id="noi-idc" value="${idcRate}%" readonly style="opacity:0.7"></div>
      <div class="form-group"><label for="noi-costShare">Cost Share Required?</label>
        <select id="noi-costShare"><option value="no" ${d.costShare !== 'yes' ? 'selected' : ''}>No</option><option value="yes" ${d.costShare === 'yes' ? 'selected' : ''}>Yes</option></select>
      </div>
    </div>
    <div class="form-group"><label for="noi-costShareAmt">Cost Share Amount (if applicable)</label><input type="number" id="noi-costShareAmt" value="${_esc(d.costShareAmt || '')}" placeholder="0"></div>
    <div class="form-group"><label for="noi-effort">PI Effort (%)</label><input type="number" id="noi-effort" value="${_esc(d.effort || '')}" placeholder="e.g., 20" min="0" max="100"></div>
    <div class="form-group"><label for="noi-budgetNotes">Budget Notes</label><textarea id="noi-budgetNotes" placeholder="Any special budget considerations...">${_esc(d.budgetNotes || '')}</textarea></div>
    <div class="card" style="margin-top:12px; background:rgba(253,185,39,0.05); border-color:rgba(253,185,39,0.2)">
      <div style="font-size:0.82rem; color:var(--aggie-gold)">💡 <strong>Grant says:</strong> ${idcRate === 0 ? 'Capacity programs carry 0% IDC. Budget the full award for direct costs.' : 'Competitive grants at NC A&T use a 48% IDC rate on modified total direct costs (MTDC). Equipment >$5K and participant support are excluded from the IDC base.'}</div>
    </div>
  `;
}

function renderReviewStep(d) {
  return `
    <h3 style="color:var(--text-primary); margin-bottom:16px">Review & Submit</h3>
    <div class="card" style="margin-bottom:12px">
      <div class="card-subtitle">PI</div>
      <div class="card-title">${_esc(d.piName || 'Not provided')}</div>
      <div style="font-size:0.8rem; color:var(--text-secondary)">${_esc(d.piDept || '')} · ${_esc(d.piEmail || '')}</div>
    </div>
    <div class="card" style="margin-bottom:12px">
      <div class="card-subtitle">Proposal</div>
      <div class="card-title">${_esc(d.title || 'Not provided')}</div>
      <div style="font-size:0.8rem; color:var(--text-secondary)">${_esc(d.sponsor || '')} · ${_esc(d.program || '')} · ${_esc(d.type || '')}</div>
      <div style="font-size:0.8rem; color:var(--aggie-gold); margin-top:4px">$${Number(d.funding || 0).toLocaleString()} · ${_esc(d.duration || '')}</div>
    </div>
    <div class="card" style="margin-bottom:12px">
      <div class="card-subtitle">Compliance Flags</div>
      <div style="display:flex; gap:6px; margin-top:4px; flex-wrap:wrap">
        ${d.human ? '<span class="badge badge-danger">Human Subjects</span>' : ''}
        ${d.animal ? '<span class="badge badge-danger">Animal Use</span>' : ''}
        ${d.biohazard ? '<span class="badge badge-danger">Biohazard</span>' : ''}
        ${d.radio ? '<span class="badge badge-danger">Radioactive</span>' : ''}
        ${!d.human && !d.animal && !d.biohazard && !d.radio ? '<span class="badge badge-success">None flagged</span>' : ''}
      </div>
    </div>
    <div class="card" style="background:rgba(34,197,94,0.05); border-color:rgba(34,197,94,0.2)">
      <div style="font-size:0.85rem; color:var(--success)">✅ NOI is ready for submission to the Associate Dean for Research office. Upon approval, a Grant Manager will be assigned and you'll receive your proposal packet.</div>
    </div>
  `;
}

function saveWizardData() {
  const d = st.noiData || {};
  // Save whichever fields exist on the current step
  const fields = ['piName','piEmail','piDept','piCollege','coPIs','sponsor','program','solicitation','deadline','type','title','summary','funding','duration','subrec','subInst','costShare','costShareAmt','effort','budgetNotes'];
  fields.forEach(f => {
    const el = document.getElementById('noi-' + f);
    if (el) d[f] = el.type === 'checkbox' ? el.checked : el.value;
  });
  // Compliance checkboxes
  ['human','animal','radio','biohazard','export','coi'].forEach(f => {
    const el = document.getElementById('noi-' + f);
    if (el) d[f] = el.checked;
  });
  st.noiData = d;
}

function nextWizardStep() {
  saveWizardData();
  st.wizardStep = (st.wizardStep || 0) + 1;
  // Confetti burst on step completion
  const btn = document.querySelector('.btn-primary[onclick="nextWizardStep()"]');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    CONFETTI.burst(rect.left + rect.width / 2, rect.top);
  }
  render();
}
function prevWizardStep() { saveWizardData(); st.wizardStep = Math.max(0, (st.wizardStep || 0) - 1); render(); }
function goToWizardStep(i) { saveWizardData(); st.wizardStep = i; render(); }
async function submitNOI() {
  saveWizardData();
  const btn = document.querySelector('.btn-primary[onclick="submitNOI()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

  try {
    await saveSubmission(st.noiData);
    st.wizardStep = 0;
    st.noiData = {};
    // 🎉 Full confetti party on NOI submission!
    CONFETTI.party();
    addMessage('ai', `✅ NOI submitted and saved! Your proposal is now in the pipeline at Stage 1. A Grant Manager will be assigned after your Associate Dean approves. Track progress in the Pipeline tab.`);
    GRANT_TTS.speak('Your NOI has been submitted and saved to the system. You can track its progress in the Pipeline tab.');
    setView('pipeline');
  } catch (err) {
    console.error('NOI save failed:', err);
    if (btn) { btn.disabled = false; btn.textContent = '📤 Submit NOI'; }
    alert('Submission failed — please check your connection and try again.');
  }
}
