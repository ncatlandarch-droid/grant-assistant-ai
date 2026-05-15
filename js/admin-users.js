/* ============================================
   Admin Users — Team directory + profile editor
   Visible only to admin accounts.
   ============================================ */

function renderAdminUsers() {
  const el = document.createElement('div');

  // If editing a user, show that form
  if (st.adminEditingUser) {
    el.appendChild(_renderAdminEditForm(st.adminEditingUser));
    return el;
  }

  el.innerHTML = `
    <div class="section-header">
      <h2>👥 Team <span>Members</span></h2>
    </div>
    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:20px">
      Everyone who has signed in to Grant AI. Edit profiles, update titles, or jump to any user's proposals.
    </p>
    <div id="adminUsersGrid" class="admin-user-grid">
      <div class="au-loading">Loading team members…</div>
    </div>
  `;

  // Async load — updates the grid div directly without a full re-render
  loadAllUserProfiles()
    .then(profiles => _populateAdminUserGrid(profiles))
    .catch(err => {
      const g = document.getElementById('adminUsersGrid');
      if (g) g.innerHTML = `<p style="color:#f87171">Error loading users: ${err.message}</p>`;
    });

  return el;
}

function _populateAdminUserGrid(profiles) {
  const grid = document.getElementById('adminUsersGrid');
  if (!grid) return;

  if (profiles.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted)">No users have signed in yet.</p>';
    return;
  }

  grid.innerHTML = '';
  profiles.forEach(p => grid.appendChild(_renderAdminUserCard(p)));
}

function _resolveUserAvatar(p) {
  // Priority: custom avatarUrl > static USER_PROFILES entry > Google photo
  if (p.avatarUrl) return p.avatarUrl;
  const known = USER_PROFILES[p.email?.toLowerCase()];
  if (known?.avatar) return known.avatar;
  return p.googlePhotoURL || 'images/grant-avatar.png';
}

function _resolveUserName(p) {
  return p.displayName || p.googleDisplayName?.split(' ')[0] || p.email?.split('@')[0] || 'User';
}

function _resolveUserRole(p) {
  const known = USER_PROFILES[p.email?.toLowerCase()];
  const title = p.formalTitle || known?.formalTitle || '';
  const dept  = p.department  || known?.department  || '';
  return [title, dept].filter(Boolean).join(' · ') || known?.role || 'NC A&T Researcher';
}

function _renderAdminUserCard(p) {
  const card = document.createElement('div');
  card.className = 'au-card';

  const avatar  = _resolveUserAvatar(p);
  const name    = _resolveUserName(p);
  const role    = _resolveUserRole(p);
  const email   = p.email || '';
  const lastSeen = p.lastSeen
    ? new Date(p.lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';

  // Count their submissions from live data
  const submissionCount = (st.submissions || []).filter(
    s => s.piEmail?.toLowerCase() === email.toLowerCase()
  ).length;

  card.innerHTML = `
    <div class="au-card-top">
      <img class="au-avatar" src="${avatar}" alt="${name}"
           onerror="this.src='images/grant-avatar.png'">
      <div class="au-info">
        <div class="au-name">${name}</div>
        <div class="au-role">${role}</div>
        <div class="au-email">${email}</div>
      </div>
    </div>
    <div class="au-meta">
      <span>Last active: ${lastSeen}</span>
      <span>${submissionCount} proposal${submissionCount !== 1 ? 's' : ''}</span>
    </div>
    <div class="au-actions">
      <button class="btn btn-secondary btn-sm" onclick="adminEditUser(${JSON.stringify(p).replace(/"/g, '&quot;')})">
        ✏️ Edit Profile
      </button>
      <button class="btn btn-secondary btn-sm" onclick="adminViewProposals('${email}')">
        📋 View Proposals
      </button>
    </div>
  `;
  return card;
}

function adminEditUser(profile) {
  st.adminEditingUser = profile;
  render();
}

function adminViewProposals(email) {
  st.adminUserFilter  = email;
  st.adminEditingUser = null;
  setView('pipeline');
}

function _renderAdminEditForm(p) {
  const el = document.createElement('div');
  const name    = _resolveUserName(p);
  const role    = _resolveUserRole(p);
  const known   = USER_PROFILES[p.email?.toLowerCase()] || {};
  const avatar   = _resolveUserAvatar(p);
  // Never put data: URLs into a text input — only http/https URLs
  const isDataUrl = p.avatarUrl?.startsWith('data:');
  const photoVal  = (p.avatarUrl && !isDataUrl) ? p.avatarUrl
    : (known.avatar && !known.avatar.startsWith('images/') && !known.avatar?.startsWith('data:') ? known.avatar : '');
  const safeVal = v => (v || '').replace(/"/g, '&quot;');

  el.innerHTML = `
    <div class="section-header">
      <h2>✏️ Edit <span>${name}'s Profile</span></h2>
      <button class="btn btn-secondary btn-sm" onclick="st.adminEditingUser=null; render()">← Back to Team</button>
    </div>

    <div class="au-edit-wrap">
      <div class="au-edit-preview">
        <img id="auPreviewImg" src="${avatar}" class="au-edit-avatar"
             onerror="this.src='images/grant-avatar.png'" alt="${name}">
        <div class="au-edit-name">${name}</div>
        <div class="au-edit-role">${role}</div>
        <div class="au-email" style="margin-top:4px">${p.email || ''}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:8px">
          Google account: ${p.googleDisplayName || '—'}
        </div>
      </div>

      <div class="au-edit-form">
        <label class="pef-label">Display Name</label>
        <input id="aue-name" class="pef-input" value="${safeVal(p.displayName || p.googleDisplayName?.split(' ')[0])}"
               placeholder="Preferred first name">

        <label class="pef-label">Full Name</label>
        <input id="aue-fullname" class="pef-input" value="${safeVal(p.fullName || p.googleDisplayName)}"
               placeholder="Full legal name">

        <label class="pef-label">Formal Title</label>
        <input id="aue-title" class="pef-input" value="${safeVal(p.formalTitle || known.formalTitle)}"
               placeholder="e.g. Research Director">

        <label class="pef-label">Department / Unit</label>
        <input id="aue-dept" class="pef-input" value="${safeVal(p.department || known.department)}"
               placeholder="e.g. CAES · OSP">

        <label class="pef-label">Profile Photo</label>
        <div class="pef-photo-options">
          <label class="pef-upload-btn" title="Granted! will remove the background and create a clean white-background portrait">
            📷 Upload Photo
            <input type="file" id="aue-file" accept="image/jpeg,image/png,image/webp,image/*"
                   style="display:none" onchange="handleAvatarFileSelect(this,'auePreview')">
          </label>
          <span class="pef-or">or</span>
          <input id="aue-photo" class="pef-input pef-url-input" value="${safeVal(photoVal)}"
                 placeholder="paste a URL"
                 oninput="onAvatarUrlInput(this.value,'auePreview','auPreviewImg')">
        </div>
        <div class="pef-photo-preview" id="auePreview" style="display:${photoVal ? 'block' : 'none'}">
          <img id="auePreviewImg" src="${photoVal || ''}">
        </div>
        <div id="aueStatus" class="pef-status"></div>

        <label class="pef-label">Preferred Voice</label>
        <select id="aue-voice" class="pef-input pef-select">
          ${(typeof GEMINI_VOICES !== 'undefined' ? GEMINI_VOICES : []).map(v =>
            `<option value="${v.id}" ${(p.preferredVoice || known.preferredVoice) === v.id ? 'selected' : ''}>${v.label} — ${v.desc}</option>`
          ).join('')}
        </select>

        <div class="pef-actions" style="margin-top:20px">
          <button class="btn btn-primary" onclick="saveAdminUserEdit('${p.uid}', '${p.email}')">Save Changes</button>
          <button class="btn btn-secondary" onclick="st.adminEditingUser=null; render()">Cancel</button>
          <button class="btn btn-secondary btn-sm" onclick="adminViewProposals('${p.email}')"
                  style="margin-left:auto">📋 View Their Proposals</button>
        </div>
      </div>
    </div>
  `;
  return el;
}

async function saveAdminUserEdit(uid, email) {
  const name     = document.getElementById('aue-name')?.value.trim();
  const fullName = document.getElementById('aue-fullname')?.value.trim();
  const title    = document.getElementById('aue-title')?.value.trim();
  const dept     = document.getElementById('aue-dept')?.value.trim();
  const photo    = document.getElementById('aue-photo')?.value.trim();
  const voice    = document.getElementById('aue-voice')?.value;

  if (!uid) return;

  const data = {};
  if (name)                   data.displayName    = name;
  if (fullName)               data.fullName       = fullName;
  if (title)                  data.formalTitle    = title;
  if (dept)                   data.department     = dept;
  if (_pendingAvatarDataUrl)  data.avatarUrl      = _pendingAvatarDataUrl;
  else if (photo)             data.avatarUrl      = photo;
  if (voice)                  data.preferredVoice = voice;

  try {
    await saveUserProfile(uid, data);
    // If editing the current user's own profile, refresh their local state
    if (st.currentUser?.uid === uid) {
      st.firestoreProfile = { ...(st.firestoreProfile || {}), ...data };
    }
    _pendingAvatarDataUrl = null;
    st.adminEditingUser = null;
    render();
    _showToast('Profile saved!');
  } catch (e) {
    console.error('Admin profile save failed:', e);
    _showToast('Save failed — check your connection and try again.', true);
  }
}
