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
    // (only if they haven't manually chosen a different voice yet)
    const stored = localStorage.getItem('grant-tts-voice');
    if (!stored && up.preferredVoice) {
      setActiveVoice(up.preferredVoice);
    }

    profile.innerHTML = `
      <div class="avatar-img-wrap user-avatar-wrap" id="avatarWrap"
           onclick="handleAvatarClick(event)" title="Click to hear a greeting" style="cursor:pointer">
        <img src="${up.avatar}" alt="${up.displayName}" id="avatarImg"
             onerror="this.src='images/grant-avatar.png'">
      </div>
      <div class="avatar-name-row">
        <span class="avatar-name">${up.displayName}</span>
        <button class="voice-badge" onclick="GRANT_TTS.toggleMute()" title="Toggle voice on/off">🔊</button>
      </div>
      <div class="avatar-role">${up.role}</div>
      <div class="avatar-assistant-tag">
        <span class="assistant-dot"></span>
        ${_A.name} · AI Grant Assistant
      </div>
      ${_renderVoicePicker()}
      ${_renderModeChips()}
    `;
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
  // Preview the new voice immediately
  const preview = `Voice changed to ${voiceName}. How does this sound?`;
  GRANT_TTS.stop();
  GRANT_TTS.speak(preview);
}
