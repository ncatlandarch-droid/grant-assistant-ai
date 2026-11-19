/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================
   Avatar Panel — driven by INSTITUTION_CONFIG
   and USER_PROFILES when a user is signed in.
   ============================================ */

// ── Guide Profiles (pre-set voices — no picker needed) ──
const GUIDE_PROFILES = {
  grant: {
    name: 'Grant', role: 'AI Grant Assistant',
    image: 'images/grant-avatar.png',
    voice: 'Charon',
    greeting: "Hello! I'm your AI Grant Assistant for NC A&T. I can help you find funding, navigate the NOI process, build budgets, and ensure compliance. What would you like to work on?",
  },
  cathy: {
    name: 'Cathy', role: 'AI Grant Assistant',
    image: 'images/cathy-avatar.png',
    voice: 'Aoede',
    greeting: "Hello! I'm your AI Grant Assistant for NC A&T. I'm here to help you find funding opportunities, prepare proposals, and guide you through every step. How can I help today?",
  }
};

function getActiveGuide() {
  const id = localStorage.getItem('granted-guide') || 'grant';
  return { id, ...GUIDE_PROFILES[id] };
}

function switchGuide(id) {
  if (!GUIDE_PROFILES[id]) return;
  localStorage.setItem('granted-guide', id);
  // Set the pre-assigned voice automatically
  setActiveVoice(GUIDE_PROFILES[id].voice);
  render();
}

const _A = (() => {
  const g = getActiveGuide();
  return {
    name: g.name, role: g.role, image: g.image, voice: g.voice,
    greeting: g.greeting, modes: window.INSTITUTION_CONFIG?.assistant?.modes || []
  };
})();

// Holds a processed image data-URL between file-pick and save
let _pendingAvatarDataUrl = null;

function renderAvatarPanel() {
  // Re-read guide dynamically each render
  const guide = getActiveGuide();
  const panel = document.createElement('aside');
  panel.className = 'col-avatar';

  const profile = document.createElement('div');
  profile.className = 'avatar-profile';

  if (st.currentUser) {
    const up = getUserProfile(st.currentUser);

    // Set preferred voice on first login
    const stored = localStorage.getItem('grant-tts-voice');
    if (!stored && up.preferredVoice) setActiveVoice(up.preferredVoice);

    if (st.editingProfile) {
      profile.innerHTML = _renderProfileEditForm(up);
    } else {
      profile.innerHTML = `
        <div class="avatar-img-wrap user-avatar-wrap" id="avatarWrap"
             onclick="handleAvatarClick(event)" title="Click to hear a greeting" style="cursor:pointer">
          <img src="${up.avatar}" alt="${up.displayName}" id="avatarImg"
               onerror="this.src='images/grant-avatar.png'">
        </div>
        <div class="avatar-name-row">
          <span class="avatar-name">${up.displayName}</span>
          <button class="voice-badge" onclick="GRANT_TTS.toggleMute()" title="Toggle voice on/off">🔊</button>
          <button class="profile-edit-btn" onclick="st.editingProfile=true; render()" title="Edit profile">✏️</button>
        </div>
        <div class="avatar-role">${up.formalTitle || up.role}</div>
        ${up.department ? `<div class="avatar-dept">${up.department}</div>` : ''}
        <div class="avatar-assistant-tag">
          <span class="assistant-dot"></span>
          ${guide.name} · AI Grant Assistant
        </div>
        ${_renderGuideSelector(guide)}
        ${_renderModeChips()}
      `;
    }
  } else {
    profile.innerHTML = `
      <div class="avatar-img-wrap" id="avatarWrap"
           onclick="handleAvatarClick(event)" title="Click to hear ${guide.name} speak" style="cursor:pointer">
        <img src="${guide.image}" alt="${guide.name}" id="avatarImg">
      </div>
      <div class="avatar-name-row">
        <span class="avatar-name">${guide.name}</span>
        <button class="voice-badge" onclick="GRANT_TTS.toggleMute()" title="Toggle voice on/off">🔊</button>
      </div>
      <div class="avatar-role">${guide.role}</div>
      ${_renderGuideSelector(guide)}
      ${_renderModeChips()}
    `;
  }

  panel.appendChild(profile);
  panel.appendChild(renderChatMessages());
  panel.appendChild(renderChatInput());

  requestAnimationFrame(() => {
    document.querySelectorAll('.voice-badge').forEach(el => {
      el.textContent = GRANT_TTS.isMuted() ? '🔇' : '🔊';
    });
  });

  return panel;
}

function _renderGuideSelector(guide) {
  return `
    <div class="guide-selector">
      <span class="guide-selector-label">Your Guide</span>
      <div class="guide-selector-pills">
        <button class="guide-pill ${guide.id === 'grant' ? 'active' : ''}"
                onclick="switchGuide('grant')" title="Grant — Male voice (Charon)">
          <img src="images/grant-avatar.png" alt="Grant" class="guide-pill-img">
          <span>Grant</span>
        </button>
        <button class="guide-pill ${guide.id === 'cathy' ? 'active' : ''}"
                onclick="switchGuide('cathy')" title="Cathy — Female voice (Aoede)">
          <img src="images/cathy-avatar.png" alt="Cathy" class="guide-pill-img">
          <span>Cathy</span>
        </button>
      </div>
    </div>
  `;
}

function _renderModeChips() {
  if (!_A.modes?.length) return '';
  return `
    <div style="margin-top:10px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
      ${_A.modes.map(m => `
        <button class="chip ${st.avatarMode === m.id ? 'active' : ''}"
                onclick="setAvatarMode('${m.id}')" title="${m.desc}"
                style="${st.avatarMode === m.id ? 'background:var(--aggie-blue);color:white;border-color:var(--aggie-blue)' : ''}">
          ${m.label}
        </button>
      `).join('')}
    </div>
  `;
}

function _renderProfileEditForm(up) {
  const safeVal = v => (v || '').replace(/"/g, '&quot;');
  // Never put data: URLs into a text field — only show http/https URLs
  const isDataUrl = up.avatar?.startsWith('data:');
  const photoVal  = (up.avatar && !up.avatar.startsWith('images/') && !isDataUrl)
    ? safeVal(up.avatar) : '';
  const showPreview = !!(photoVal || isDataUrl);
  const previewSrc  = isDataUrl ? up.avatar : (photoVal || '');
  return `
    <div class="profile-edit-form">
      <div class="pef-header">
        <span class="pef-title">${st.firstTimeProfile ? 'Welcome! Set Up Your Profile' : 'Edit Profile'}</span>
        <button class="pef-close" onclick="st.editingProfile=false; st.firstTimeProfile=false; render()">✕</button>
      </div>
      ${st.firstTimeProfile ? `<p class="pef-welcome">Add a photo so your teammates can recognize you.</p>` : ''}

      <label class="pef-label" for="pef-name">Display Name</label>
      <input id="pef-name" class="pef-input" value="${safeVal(up.displayName)}"
             placeholder="Preferred first name">

      <label class="pef-label" for="pef-ftitle">Formal Title</label>
      <input id="pef-ftitle" class="pef-input" value="${safeVal(up.formalTitle)}"
             placeholder="e.g. Research Operations Manager">

      <label class="pef-label" for="pef-dept">Department / Unit</label>
      <input id="pef-dept" class="pef-input" value="${safeVal(up.department)}"
             placeholder="e.g. CAES · OSP">

      <label class="pef-label">Profile Photo</label>
      <div class="pef-photo-options">
        <label class="pef-upload-btn">
          📷 Upload Photo
          <input type="file" id="pef-file" accept="image/jpeg,image/png,image/webp,image/*"
                 style="display:none" onchange="handleAvatarFileSelect(this,'pefPreview')">
        </label>
        <span class="pef-or">or</span>
        <input id="pef-photo" class="pef-input pef-url-input" value="${photoVal}"
               placeholder="Paste an image URL"
               oninput="onAvatarUrlInput(this.value,'pefPreview','pefPreviewImg')">
      </div>
      <div class="pef-photo-preview" id="pefPreview" style="display:${showPreview ? 'block' : 'none'}">
        <img id="pefPreviewImg" src="${previewSrc}" onerror="this.parentElement.style.display='none'">
      </div>
      <div id="pefStatus" class="pef-status"></div>

      <label class="pef-label" for="pef-interests">Research Interests / Keywords</label>
      <textarea id="pef-interests" class="pef-input" rows="3"
                placeholder="e.g. precision agriculture, environmental justice, AI/ML, food safety, water quality">${safeVal(up.researchInterests)}</textarea>
      <div class="pef-hint" style="font-size:0.7rem;color:var(--text-muted);margin-top:-6px;margin-bottom:10px">Comma-separated keywords — used to recommend Grants.gov opportunities</div>

      <label class="pef-label" for="pef-agencies">Target Agencies</label>
      <input id="pef-agencies" class="pef-input" value="${safeVal(up.targetAgencies)}"
             placeholder="e.g. NSF, USDA, NIH, DOD">
      <div class="pef-hint" style="font-size:0.7rem;color:var(--text-muted);margin-top:-6px;margin-bottom:10px">Agencies you typically submit to — used for opportunity matching</div>

      <label class="pef-label" for="pef-voice">Preferred Voice</label>
      <select id="pef-voice" class="pef-input pef-select">
        ${(typeof GEMINI_VOICES !== 'undefined' ? GEMINI_VOICES : []).map(v =>
          `<option value="${v.id}" ${(up.preferredVoice === v.id || _activeVoice() === v.id) ? 'selected' : ''}>${v.label} — ${v.desc}</option>`
        ).join('')}
      </select>

      <div class="pef-actions">
        <button class="btn btn-primary btn-sm" onclick="saveProfileEdit()">Save Changes</button>
        <button class="btn btn-secondary btn-sm" onclick="st.editingProfile=false; render()">Cancel</button>
      </div>
    </div>
  `;
}

// ── Shared helpers used by both self-edit and admin-edit ───────────────────

async function handleAvatarFileSelect(input, previewId) {
  const file = input.files?.[0];
  if (!file) return;
  _pendingAvatarDataUrl = null;
  _setAvatarStatus(previewId, 'Loading photo…', 'processing');
  try {
    const dataUrl = await _resizeWithCanvas(file);
    _showAvatarPreview(previewId, dataUrl);
    _pendingAvatarDataUrl = dataUrl;
    _setAvatarStatus(previewId, '✓ Photo ready — click Save Changes', 'done');
  } catch (e) {
    _setAvatarStatus(previewId, '⚠ Could not read image file', 'warn');
  }
}

async function _resizeWithCanvas(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = 240;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      // White background (handles PNGs with transparency)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      // Center-crop to square
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')); };
    img.src = url;
  });
}

function onAvatarUrlInput(url, previewId, imgId) {
  _pendingAvatarDataUrl = null; // URL overrides file upload
  const preview = document.getElementById(previewId);
  const img     = document.getElementById(imgId);
  if (!preview || !img) return;
  if (url.trim()) {
    preview.style.display = 'block';
    img.src = url.trim();
  } else {
    preview.style.display = 'none';
  }
}

async function _processAvatarWithGemini(base64, mimeType, previewId) {
  const fetcher = window.authFetch || fetch;
  const resp = await fetcher('/.netlify/functions/process-avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData: base64, mimeType: mimeType || 'image/jpeg' })
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const result = await resp.json();
  if (result.error) throw new Error(result.error);
  const dataUrl = `data:${result.mimeType};base64,${result.imageData}`;
  _showAvatarPreview(previewId, dataUrl);
  return dataUrl;
}

function _readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function _readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function _showAvatarPreview(previewId, dataUrl) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  preview.style.display = 'block';
  preview.innerHTML = `<img src="${dataUrl}">`;
}

function _setAvatarStatus(previewId, msg, type) {
  // Try the standard status div first, then a fallback based on previewId
  const statusId = previewId === 'pefPreview' ? 'pefStatus' : 'aueStatus';
  const el = document.getElementById(statusId);
  if (el) {
    el.textContent = msg;
    el.className = `pef-status pef-status-${type}`;
  }
}

// ── Save functions ─────────────────────────────────────────────────────────

async function saveProfileEdit() {
  const name      = document.getElementById('pef-name')?.value.trim();
  const title     = document.getElementById('pef-ftitle')?.value.trim();
  const dept      = document.getElementById('pef-dept')?.value.trim();
  const urlVal    = document.getElementById('pef-photo')?.value.trim();
  const voice     = document.getElementById('pef-voice')?.value;
  const interests = document.getElementById('pef-interests')?.value.trim();
  const agencies  = document.getElementById('pef-agencies')?.value.trim();

  if (!st.currentUser) return;

  const saveBtn = document.querySelector('.pef-actions .btn-primary');
  const _resetBtn = () => { if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Changes'; } };

  // Guard: data URLs over ~700KB will exceed Firestore's 1MB document limit
  if (_pendingAvatarDataUrl && _pendingAvatarDataUrl.length > 700000) {
    _resetBtn();
    _showToast('Photo is too large — please crop it smaller and try again.', true);
    return;
  }

  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

  const data = {};
  if (name)  data.displayName    = name;
  if (title) data.formalTitle    = title;
  if (dept)  data.department     = dept;
  if (voice) data.preferredVoice = voice;
  data.researchInterests = interests || '';
  data.targetAgencies    = agencies  || '';

  // Uploaded photos → localStorage (avoids Firestore size limits)
  // URL photos → Firestore (small string, syncs across devices)
  if (_pendingAvatarDataUrl) {
    localStorage.setItem('grant-avatar-' + st.currentUser.uid, _pendingAvatarDataUrl);
    data.hasCustomAvatar = true;
  } else if (urlVal) {
    localStorage.removeItem('grant-avatar-' + st.currentUser.uid);
    data.avatarUrl = urlVal;
  }

  try {
    await saveUserProfile(st.currentUser.uid, data);
    st.firestoreProfile    = await loadUserProfile(st.currentUser.uid);
    if (voice) setActiveVoice(voice);
    _pendingAvatarDataUrl  = null;
    st.editingProfile      = false;
    st.firstTimeProfile    = false;
    render();
    _showToast('Profile saved!');
  } catch (e) {
    console.error('Profile save failed:', e);
    _resetBtn();
    _showToast(`Save failed: ${e.message || 'check console for details'}`, true);
  }
}

// ── Other handlers ─────────────────────────────────────────────────────────

function handleAvatarClick() {
  const guide = getActiveGuide();
  const greeting = st._greeting || guide.greeting;
  GRANT_TTS.speak(greeting);
}

function setAvatarMode(mode) {
  st.avatarMode = mode;
  const modeInfo = _A.modes?.find(m => m.id === mode);
  if (modeInfo) {
    const msg = `Switched to ${modeInfo.label} mode. ${modeInfo.desc}. How can I help?`;
    addMessage('ai', msg);
    GRANT_TTS.speak(msg);
  }
  render();
}

function changeVoice(voiceName) {
  setActiveVoice(voiceName);
  const preview = `Voice changed to ${voiceName}. How does this sound?`;
  GRANT_TTS.stop();
  GRANT_TTS.speak(preview);
}

function _showToast(msg, isError = false) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:${isError ? '#f87171' : 'var(--caes-green-mid)'};
    color:#fff; font-size:0.82rem; font-weight:600;
    padding:10px 22px; border-radius:100px;
    box-shadow:0 4px 20px rgba(0,0,0,0.3);
    z-index:9999; pointer-events:none;
    animation: toastIn 0.2s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
