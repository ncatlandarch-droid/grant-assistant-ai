/* ============================================
   Header — NC A&T Official Branding + CAES Unit
   ============================================ */

const _I   = window.INSTITUTION_CONFIG;
const _tabs = _I?.navTabs || [
  { id: 'dashboard',     label: '📊 Dashboard' },
  { id: 'opportunities', label: '🔍 Opportunities' },
  { id: 'pipeline',      label: '📋 Pipeline' },
  { id: 'noi-wizard',    label: '📝 NOI Wizard' },
  { id: 'resources',     label: '📚 Resources' }
];

function renderHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';

  const logoSrc  = _I?.brand?.logo    || 'https://www.ncat.edu/_global/images/logo-main-white.png';
  const instName = _I?.institution?.name         || 'NC Agricultural & Technical State University';
  const short    = _I?.institution?.shortName    || 'NC A&T';
  const college  = _I?.institution?.college      || 'College of Agriculture & Environmental Sciences';
  const abbrev   = _I?.institution?.abbreviation || 'CAES';

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

      <!-- CAES College Unit Lockup -->
      <div class="brand-unit">
        <span class="brand-unit-top">${abbrev}</span>
        <span class="brand-unit-name">${college}</span>
      </div>

      <!-- AI Tool Badge + Name -->
      <div class="brand-title-wrap">
        <span class="brand-ai-badge">AI</span>
        <span class="brand-tool-name">Grant <span>Assistant</span></span>
      </div>

    </div>

    <nav class="nav-tabs" id="navTabs">
      ${_tabs.map(t => `
        <button class="nav-tab ${st.view === t.id ? 'active' : ''}"
                onclick="setView('${t.id}')" id="tab-${t.id}">
          ${t.label}
        </button>
      `).join('')}
    </nav>

    <button class="hamburger" onclick="toggleMobileNav()" id="hamburgerBtn" aria-label="Menu">☰</button>
  `;

  return header;
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
