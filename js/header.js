/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================
   Header — NC A&T Official Branding + CAES Unit
   ============================================ */

const _I   = window.INSTITUTION_CONFIG;
const _tabs = _I?.navTabs || [
  { id: 'overview',       label: 'Overview' },
  { id: 'dashboard',     label: 'Dashboard' },
  { id: 'pipeline',      label: 'Pipeline' },
  { id: 'noi-wizard',    label: 'NOI Wizard' }
];
const _moreTabs = _I?.navMore || [];

function renderHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';

  const logoSrc  = _I?.brand?.logo    || 'https://www.ncat.edu/_global/images/logo-main-white.png';
  const instName = _I?.institution?.name         || 'NC Agricultural & Technical State University';
  const short    = _I?.institution?.shortName    || 'NC A&T';
  const college  = _I?.institution?.college      || 'College of Agriculture & Environmental Sciences';
  const abbrev   = _I?.institution?.abbreviation || 'CAES';

  // Is a "more" tab currently active?
  const moreActive = _moreTabs.some(t => st.view === t.id);

  header.innerHTML = `
    <div class="header-brand">

      <!-- Official NC A&T Logo (from university CDN) -->
      <div class="brand-logo-wrap">
        <img class="brand-logo-img"
             src="${logoSrc}"
             alt="${instName} logo"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="brand-logo-text" style="display:none">
          <span class="brand-short">${short}</span>
          <span class="brand-pipe">|</span>
          <span class="brand-college">${abbrev}</span>
        </div>
      </div>

      <!-- Vertical divider -->
      <div class="brand-divider"></div>

      <!-- AI Tool Badge + Name (now before the ticker) -->
      <div class="brand-title-wrap" onclick="setView('overview')" style="cursor:pointer" title="Go to home page">
        <span class="brand-ai-badge">AI</span>
        <span class="brand-tool-name">GRANT <span>AI Grant Assistant</span></span>
      </div>

      <!-- Vertical divider -->
      <div class="brand-divider"></div>

      <!-- College Unit Ticker -->
      <div class="brand-unit">
        <img class="brand-unit-icon" src="${(typeof getActiveCollege === 'function' ? getActiveCollege() : {}).icon || 'images/college-icons/icon-agriculture-color.svg'}" alt="" onerror="this.style.display='none'">
        <div class="brand-unit-text">
          <span class="brand-unit-top">${abbrev}</span>
          <span class="brand-unit-name">${college}</span>
        </div>
      </div>

    </div>

    <nav class="nav-tabs" id="navTabs">
      ${_tabs.map(t => `
        <button class="nav-tab ${st.view === t.id ? 'active' : ''}"
                onclick="setView('${t.id}')" id="tab-${t.id}">
          ${t.label}
        </button>
      `).join('')}
      ${_moreTabs.length ? `
        <div class="nav-more-wrap">
          <button class="nav-tab nav-more-btn ${moreActive ? 'active' : ''}"
                  onclick="toggleNavMore(event)" id="tab-more">
            More ▾
          </button>
          <div class="nav-more-dropdown" id="navMoreDropdown">
            ${_moreTabs.map(t => `
              <button class="nav-more-item ${st.view === t.id ? 'active' : ''}"
                      onclick="setView('${t.id}'); closeNavMore()">
                ${t.label}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      ${st.isAdmin ? `
        <button class="nav-tab ${st.view === 'team-members' ? 'active' : ''}"
                onclick="setView('team-members')" id="tab-team-members">
          👥 Team
        </button>
      ` : ''}
    </nav>

    <div class="header-admin">
      ${st.isAdmin ? `
        <div class="admin-pill">
          ${st.currentUser?.photoURL ? `<img src="${st.currentUser.photoURL}" class="admin-avatar" alt="Admin">` : ''}
          <span class="admin-label">Admin</span>
          <button class="admin-signout" onclick="signOutAdmin()">Sign Out</button>
        </div>
      ` : st.currentUser ? `
        <div class="pi-pill">
          ${st.currentUser.photoURL ? `<img src="${st.currentUser.photoURL}" class="admin-avatar" alt="">` : '<span class="pi-avatar-fallback">👤</span>'}
          <span class="pi-pill-name">${st.currentUser.displayName?.split(' ')[0] || 'Researcher'}</span>
          <button class="pi-pill-track" onclick="setView('pipeline')">My Proposals</button>
          <button class="admin-signout" onclick="signOutAdmin()">Sign Out</button>
        </div>
      ` : `
        <div class="header-auth-btns">
          <button class="pi-login-btn" onclick="signInWithGoogle()" title="Sign in with Google to save your submissions">🔐 Login</button>
        </div>
      `}
    </div>
    <button class="hamburger" onclick="toggleMobileNav()" id="hamburgerBtn" aria-label="Menu">☰</button>
  `;

  return header;
}

function toggleNavMore(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const dd = document.getElementById('navMoreDropdown');
  if (!dd) return;
  const isOpen = dd.classList.contains('open');
  if (isOpen) {
    dd.classList.remove('open');
    document.removeEventListener('click', _closeNavMoreOutside);
  } else {
    dd.classList.add('open');
    setTimeout(() => {
      document.addEventListener('click', _closeNavMoreOutside);
    }, 100);
  }
}

function _closeNavMoreOutside(e) {
  const wrap = document.querySelector('.nav-more-wrap');
  if (wrap && wrap.contains(e.target)) return;
  closeNavMore();
}

function closeNavMore() {
  const dd = document.getElementById('navMoreDropdown');
  if (dd) dd.classList.remove('open');
  document.removeEventListener('click', _closeNavMoreOutside);
}

function toggleMobileNav() {
  const nav = document.getElementById('navTabs');
  if (!nav) return;
  const open = nav.style.display === 'flex';
  nav.style.display      = open ? 'none' : 'flex';
  nav.style.position     = open ? '' : 'absolute';
  nav.style.top          = open ? '' : 'var(--header-h)';
  nav.style.left         = open ? '' : '0';
  nav.style.right        = open ? '' : '0';
  nav.style.flexDirection= open ? '' : 'column';
  nav.style.background   = open ? '' : '#061122';
  nav.style.padding      = open ? '' : '12px';
  nav.style.zIndex       = open ? '' : '200';
  nav.style.borderBottom = open ? '' : '1px solid rgba(253,185,39,0.2)';
}

/* ── College Rotation Ticker ── */
let _collegeIdx = 0;
let _collegeTicker = null;

function startCollegeTicker() {
  if (_collegeTicker) clearInterval(_collegeTicker);
  const colleges = _I?.institution?.colleges;
  if (!colleges || colleges.length <= 1) return;

  // Build icon lookup from COLLEGE_CONFIGS
  const iconMap = {};
  if (typeof COLLEGE_CONFIGS === 'object') {
    Object.values(COLLEGE_CONFIGS).forEach(c => {
      iconMap[c.abbreviation] = c.icon;
    });
  }

  _collegeTicker = setInterval(() => {
    const textEl = document.querySelector('.brand-unit-text');
    const nameEl = document.querySelector('.brand-unit-name');
    const topEl  = document.querySelector('.brand-unit-top');
    const iconEl = document.querySelector('.brand-unit-icon');
    if (!textEl || !nameEl || !topEl) return;

    // Fade out text + icon together
    textEl.classList.add('fade-out');
    textEl.classList.remove('fade-in');
    if (iconEl) iconEl.style.opacity = '0';

    setTimeout(() => {
      _collegeIdx = (_collegeIdx + 1) % colleges.length;
      const c = colleges[_collegeIdx];
      nameEl.textContent = c.name;
      topEl.textContent  = c.abbrev;
      // Swap icon while invisible
      if (iconEl && iconMap[c.abbrev]) {
        iconEl.src = iconMap[c.abbrev];
      }
      // Fade back in together
      textEl.classList.remove('fade-out');
      textEl.classList.add('fade-in');
      if (iconEl) iconEl.style.opacity = '1';
    }, 380);
  }, 3000);
}

// Auto-start on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(startCollegeTicker, 1500));
} else {
  setTimeout(startCollegeTicker, 1500);
}
