/* ============================================
   Avatar Panel — driven by INSTITUTION_CONFIG
   and USER_PROFILES when a user is signed in.
   ============================================ */

const _A = (window.INSTITUTION_CONFIG?.assistant) || {
  name: 'Grant', role: 'AI Grant Assistant',
  image: 'images/grant-avatar.png', greeting: "Welcome! I'm Grant.", modes: []
};

function renderAvatarPanel() {
  const panel = document.createElement('aside');
  panel.className = 'col-avatar';

  const profile = document.createElement('div');
  profile.className = 'avatar-profile';

  if (st.currentUser) {
    // ── Logged-in: show the user's profile ──────────────────
    const up = getUserProfile(st.currentUser);

    // Set the active voice to this user's preference on first login
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
    // ── Not logged in: show the AI assistant avatar ──────────
    profile.innerHTML = `
      <div class="avatar-img-wrap" id="avatarWrap"
           onclick="handleAvatarClick(event)" title="Click to hear Grant speak" style="cursor:pointer">
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
  panel.appendChild(renderQuickChips());
  panel.appendChild(renderChatMessages());
  panel.appendChild(renderChatInput());

  // Sync mute badge + voice select after render
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
  const photoVal = up.avatar && !up.avatar.startsWith('images/') ? safeVal(up.avatar) : '';
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

      <label class="pef-label">
        Photo URL
        <span class="pef-hint">paste a link to your photo</span>
      </label>
      <input id="pef-photo" class="pef-input" value="${photoVal}"
             placeholder="https://…">

      <div class="pef-photo-preview" id="pefPreview" style="display:${photoVal ? 'block' : 'none'}">
        <img src="${photoVal || ''}" onerror="this.parentElement.style.display='none'">
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

async function saveProfileEdit() {
  const name  = document.getElementById('pef-name')?.value.trim();
  const title = document.getElementById('pef-ftitle')?.value.trim();
  const dept  = document.getElementById('pef-dept')?.value.trim();
  const photo = document.getElementById('pef-photo')?.value.trim();
  const voice = document.getElementById('pef-voice')?.value;

  if (!st.currentUser) return;

  const data = {};
  if (name)  data.displayName    = name;
  if (title) data.formalTitle    = title;
  if (dept)  data.department     = dept;
  if (photo) data.avatarUrl      = photo;
  if (voice) data.preferredVoice = voice;

  try {
    await saveUserProfile(st.currentUser.uid, data);
    st.firestoreProfile = { ...(st.firestoreProfile || {}), ...data };
    if (voice) setActiveVoice(voice);
    st.editingProfile = false;
    render();
  } catch (e) {
    console.error('Profile save failed:', e);
    alert('Could not save profile. Please try again.');
  }
}

// Live photo preview as user types
document.addEventListener('input', e => {
  if (e.target.id === 'pef-photo') {
    const preview = document.getElementById('pefPreview');
    if (!preview) return;
    const url = e.target.value.trim();
    if (url) {
      preview.style.display = 'block';
      preview.querySelector('img').src = url;
    } else {
      preview.style.display = 'none';
    }
  }
});

function handleAvatarClick() {
  const greeting = st._greeting
    || window.INSTITUTION_CONFIG?.assistant?.greeting
    || "Hi! I'm Grant, your AI Grant Assistant.";
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
