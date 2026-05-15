/* ============================================
   Avatar Panel — driven by INSTITUTION_CONFIG
   and USER_PROFILES when a user is signed in.
   ============================================ */

const _A = (window.INSTITUTION_CONFIG?.assistant) || {
  name: 'Granted!', role: 'AI Grant Assistant',
  image: 'images/grant-avatar.png',
  greeting: "Hello! I'm Granted!, your AI Grant Assistant.", modes: []
};

// Holds a processed image data-URL between file-pick and save
let _pendingAvatarDataUrl = null;

function renderAvatarPanel() {
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
          ${_A.name} · AI Grant Assistant
        </div>
        ${_renderVoicePicker()}
        ${_renderModeChips()}
      `;
    }
  } else {
    profile.innerHTML = `
      <div class="avatar-img-wrap" id="avatarWrap"
           onclick="handleAvatarClick(event)" title="Click to hear Granted! speak" style="cursor:pointer">
        <img src="${_A.image}" alt="${_A.name}" id="avatarImg">
      </div>
      <div class="avatar-name-row">
        <span class="avatar-name">${_A.name}</span>
        <button class="voice-badge" onclick="GRANT_TTS.toggleMute()" title="Toggle voice on/off">🔊</button>
      </div>
      <div class="avatar-role">${_A.role}</div>
      ${_renderVoicePicker()}
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
    const voiceSelect = document.getElementById('voiceSelect');
    if (voiceSelect) voiceSelect.value = _activeVoice();
  });

  return panel;
}

function _renderVoicePicker() {
  const voices = (typeof GEMINI_VOICES !== 'undefined') ? GEMINI_VOICES : [
    { id: 'Charon', label: 'Charon', desc: 'Deep · Authoritative' },
    { id: 'Aoede',  label: 'Aoede',  desc: 'Warm · Conversational' },
    { id: 'Fenrir', label: 'Fenrir', desc: 'Clear · Professional'  },
    { id: 'Kore',   label: 'Kore',   desc: 'Smooth · Calm'         },
    { id: 'Puck',   label: 'Puck',   desc: 'Energetic · Friendly'  },
    { id: 'Zephyr', label: 'Zephyr', desc: 'Neutral · Clean'       }
  ];
  return `
    <div class="voice-picker-wrap">
      <label class="voice-picker-label">🎙️ Voice</label>
      <select id="voiceSelect" class="voice-picker-select"
              onchange="changeVoice(this.value)">
        ${voices.map(v => `<option value="${v.id}" title="${v.desc}">${v.label} — ${v.desc}</option>`).join('')}
      </select>
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
        <span class="pef-title">Edit Profile</span>
        <button class="pef-close" onclick="st.editingProfile=false; render()">✕</button>
      </div>

      <label class="pef-label">Display Name</label>
      <input id="pef-name" class="pef-input" value="${safeVal(up.displayName)}"
             placeholder="Preferred first name">

      <label class="pef-label">Formal Title</label>
      <input id="pef-ftitle" class="pef-input" value="${safeVal(up.formalTitle)}"
             placeholder="e.g. Research Operations Manager">

      <label class="pef-label">Department / Unit</label>
      <input id="pef-dept" class="pef-input" value="${safeVal(up.department)}"
             placeholder="e.g. CAES · OSP">

      <label class="pef-label">Profile Photo URL</label>
      <input id="pef-photo" class="pef-input" value="${photoVal}"
             placeholder="Paste an image URL"
             oninput="onAvatarUrlInput(this.value,'pefPreview','pefPreviewImg')">
      <div class="pef-photo-preview" id="pefPreview" style="display:${showPreview ? 'block' : 'none'}">
        <img id="pefPreviewImg" src="${previewSrc}" onerror="this.parentElement.style.display='none'">
      </div>

      <label class="pef-label">Preferred Voice</label>
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
  _setAvatarStatus(previewId, 'Preparing photo…', 'processing');

  // Step 1: Always resize with Canvas first — guarantees a small saveable JPEG
  let resizedDataUrl;
  try {
    resizedDataUrl = await _resizeWithCanvas(file);
  } catch (e) {
    _setAvatarStatus(previewId, '⚠ Could not read image file', 'warn');
    return;
  }

  // Show preview immediately — it's already usable
  _showAvatarPreview(previewId, resizedDataUrl);
  _pendingAvatarDataUrl = resizedDataUrl;
  _setAvatarStatus(previewId, '✨ Enhancing with Granted!…', 'processing');

  // Step 2: Try Gemini background removal on top (enhancement only — not required to save)
  try {
    const base64 = resizedDataUrl.split(',')[1];
    const geminiDataUrl = await _processAvatarWithGemini(base64, 'image/jpeg', previewId);
    _pendingAvatarDataUrl = geminiDataUrl;
    _setAvatarStatus(previewId, '✓ Photo ready — click Save Changes', 'done');
  } catch (err) {
    // Canvas version already set — save works fine without Gemini
    _setAvatarStatus(previewId, '✓ Photo ready — click Save Changes', 'done');
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
  const resp = await fetch('/.netlify/functions/process-avatar', {
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
  const name   = document.getElementById('pef-name')?.value.trim();
  const title  = document.getElementById('pef-ftitle')?.value.trim();
  const dept   = document.getElementById('pef-dept')?.value.trim();
  const urlVal = document.getElementById('pef-photo')?.value.trim();
  const voice  = document.getElementById('pef-voice')?.value;

  if (!st.currentUser) return;

  const data = {};
  if (name)  data.displayName    = name;
  if (title) data.formalTitle    = title;
  if (dept)  data.department     = dept;
  if (urlVal) data.avatarUrl     = urlVal;
  if (voice) data.preferredVoice = voice;

  try {
    await saveUserProfile(st.currentUser.uid, data);
    st.firestoreProfile = { ...(st.firestoreProfile || {}), ...data };
    if (voice) setActiveVoice(voice);
    st.editingProfile = false;
    render();
    _showToast('Profile saved!');
  } catch (e) {
    console.error('Profile save failed:', e);
    _showToast('Save failed — check your connection and try again.', true);
  }
}

// ── Other handlers ─────────────────────────────────────────────────────────

function handleAvatarClick() {
  const greeting = st._greeting
    || window.INSTITUTION_CONFIG?.assistant?.greeting
    || "Hello! I'm Granted!, your AI Grant Assistant.";
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
