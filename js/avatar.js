/* ============================================
   Avatar — driven by INSTITUTION_CONFIG
   ============================================ */

// Fallback if config not loaded
const _A = (window.INSTITUTION_CONFIG?.assistant) || {
  name: 'Grant', role: 'AI Grant Assistant',
  image: 'images/grant-avatar.png', greeting: "Welcome! I'm Grant.", modes: []
};

function renderAvatarPanel() {
  const panel = document.createElement('aside');
  panel.className = 'col-avatar';

  const profile = document.createElement('div');
  profile.className = 'avatar-profile';
  profile.innerHTML = `
    <div class="avatar-img-wrap" id="avatarWrap"
         onclick="handleAvatarClick(event)" title="Click to hear Grant speak" style="cursor:pointer">
      <img src="${_A.image}" alt="${_A.name}" id="avatarImg">
      <button class="voice-badge" onclick="event.stopPropagation(); GRANT_TTS.toggleMute()" title="Toggle voice on/off">🔊</button>
    </div>
    <div class="avatar-name">${_A.name}</div>
    <div class="avatar-role">${_A.role}</div>
    <div style="margin-top:10px; display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
      ${_A.modes.map(m => `
        <button class="chip ${st.avatarMode === m.id ? 'active' : ''}"
                onclick="setAvatarMode('${m.id}')" title="${m.desc}"
                style="${st.avatarMode === m.id ? 'background:var(--aggie-blue);color:white;border-color:var(--aggie-blue)' : ''}">
          ${m.label}
        </button>
      `).join('')}
    </div>
  `;

  panel.appendChild(profile);
  panel.appendChild(renderQuickChips());
  panel.appendChild(renderChatMessages());
  panel.appendChild(renderChatInput());

  // Sync mute badge after render
  requestAnimationFrame(() => {
    document.querySelectorAll('.voice-badge').forEach(el => {
      el.textContent = GRANT_TTS.isMuted() ? '🔇' : '🔊';
    });
  });

  return panel;
}

function handleAvatarClick() {
  // Clicking the avatar speaks the greeting (user gesture unlocks AudioContext)
  const greeting = st._greeting || window.INSTITUTION_CONFIG?.assistant?.greeting || "Hi! I'm Grant, your AI Grant Assistant.";
  GRANT_TTS.speak(greeting);
}

function setAvatarMode(mode) {
  st.avatarMode = mode;
  const modeInfo = _A.modes.find(m => m.id === mode);
  if (modeInfo) {
    const msg = `Switched to ${modeInfo.label} mode. ${modeInfo.desc}. How can I help?`;
    addMessage('ai', msg);
    GRANT_TTS.speak(msg);
  }
  render();
}
