/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant — Opportunities Browser (Live Grants.gov Default + Historical Benchmarks) */

let _liveOppsCache = {};
let _govSearchTimer = null;

function _oppEsc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _oppSvg(path) {
  return `<svg class="mod-icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

function renderOpportunities() {
  const el = document.createElement('div');
  const activeTab = st.oppTab || 'live'; // 'live' | 'historical'
  const stats = computeOppStats();

  el.innerHTML = `
    <div class="section-header">
      <h2>${_oppSvg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>')} Grant <span>Opportunities</span></h2>
      <span class="badge ${activeTab === 'live' ? 'badge-success' : 'badge-info'}">
        ${activeTab === 'live' ? 'Live Federal Feed (Grants.gov)' : `${stats.total} Historical NC A&T NOIs`}
      </span>
    </div>

    <div class="mod-tabs" role="tablist" aria-label="Opportunities view">
      <button type="button" role="tab" aria-selected="${activeTab === 'live'}" class="mod-tab ${activeTab === 'live' ? 'active' : ''}" onclick="setOppTab('live')">
        ${_oppSvg('<path d="M2 12h4l3-9 5 18 3-9h5"/>')} Live Federal Solicitations
      </button>
      <button type="button" role="tab" aria-selected="${activeTab === 'historical'}" class="mod-tab ${activeTab === 'historical' ? 'active' : ''}" onclick="setOppTab('historical')">
        ${_oppSvg('<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>')} Historical NC A&amp;T Awards (${stats.total})
      </button>
    </div>

    ${activeTab === 'live' ? _renderLiveTab() : _renderHistoricalTab(stats)}
  `;

  if (activeTab === 'live') {
    setTimeout(() => _loadLiveGrantsGov(), 60);
  }
  return el;
}

function _renderLiveTab() {
  const agency = st.oppAgency || '';
  const query = st.oppSearch || '';
  return `
    <div class="opp-filter-row">
      <input type="text" id="oppSearch" class="gs-textarea" style="min-height:auto;flex:1;min-width:220px;padding:9px 12px"
             placeholder="Search open federal grants (e.g., agriculture, AI, water, STEM, SBIR)..."
             value="${_oppEsc(query)}" oninput="updateOppSearch(this.value)" autocomplete="off">
      <select aria-label="Filter by federal agency" onchange="setOppAgency(this.value)">
        <option value="" ${agency === '' ? 'selected' : ''}>All Federal Agencies</option>
        <option value="USDA" ${agency === 'USDA' ? 'selected' : ''}>USDA / NIFA</option>
        <option value="NSF" ${agency === 'NSF' ? 'selected' : ''}>National Science Foundation (NSF)</option>
        <option value="HHS-NIH11" ${agency === 'HHS-NIH11' ? 'selected' : ''}>NIH</option>
        <option value="DOE" ${agency === 'DOE' ? 'selected' : ''}>Dept. of Energy (DOE)</option>
        <option value="EPA" ${agency === 'EPA' ? 'selected' : ''}>EPA</option>
        <option value="ED" ${agency === 'ED' ? 'selected' : ''}>Dept. of Education</option>
        <option value="DOD" ${agency === 'DOD' ? 'selected' : ''}>Dept. of Defense (DOD)</option>
      </select>
      ${(query || agency) ? `<button type="button" class="btn btn-secondary btn-sm" onclick="clearOppSearch()">Clear</button>` : ''}
    </div>

    <div id="gov-live-list" class="rec-opps-list">
      <div class="mr-grants-loading">Loading open federal solicitations from Grants.gov...</div>
    </div>
  `;
}

function _renderHistoricalTab(stats) {
  const filtered = filterOpportunities();
  const hasSearch = !!(st.oppSearch || st.oppFilters?.sponsor || st.oppFilters?.type);
  return `
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:14px">
      Institutional benchmark archive of past NC A&amp;T CAES Notices of Intent (2025). Use this to benchmark typical award sizes, sponsors, and department history.
    </p>
    <div class="search-bar" style="margin-bottom:16px">
      <input type="text" id="oppSearch" placeholder="Search historical NOIs by PI, department, sponsor, or title..."
             value="${_oppEsc(st.oppSearch || '')}" oninput="updateOppSearch(this.value)" autocomplete="off">
      ${hasSearch ? `<button type="button" class="btn btn-secondary btn-sm" onclick="clearOppSearch()">Clear</button>` : ''}
    </div>

    ${!hasSearch ? `
      <div class="dashboard-grid" style="margin-bottom:18px">
        <div class="stat-card"><div class="stat-value">${stats.total}</div><div class="stat-label">Archived NOIs</div></div>
        <div class="stat-card"><div class="stat-value">$${(stats.totalFunding / 1000000).toFixed(1)}M</div><div class="stat-label">Historical Volume</div></div>
        <div class="stat-card"><div class="stat-value">${Object.keys(stats.bySponsor).length}</div><div class="stat-label">Sponsors</div></div>
        <div class="stat-card"><div class="stat-value">${stats.byStage[12] || 0}</div><div class="stat-label">Submitted</div></div>
      </div>
    ` : ''}

    <div class="opp-table-wrap">
      <table class="opp-table">
        <thead>
          <tr>
            <th scope="col">NOI Date</th><th scope="col">PI</th><th scope="col">Sponsor</th>
            <th scope="col">Title</th><th scope="col">Type</th><th scope="col">Amount</th>
            <th scope="col">Stage</th><th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0
            ? `<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--text-muted)">No matching historical records.</td></tr>`
            : filtered.map(o => `
              <tr>
                <td>${formatDate(o.noiDate)}</td>
                <td><strong>${_oppEsc(o.piName)}</strong><br><span style="font-size:0.7rem;color:var(--text-muted)">${_oppEsc(o.piDept)}</span></td>
                <td>${_oppEsc(o.sponsor)}</td>
                <td style="max-width:250px">${_oppEsc(o.title)}</td>
                <td><span class="badge ${o.type === 'Capacity' ? 'badge-info' : 'badge-warning'}">${_oppEsc(o.type)}</span></td>
                <td>$${(o.estimatedFunding / 1000).toFixed(0)}K</td>
                <td><span class="badge ${getStageBadge(o.stage)}">${_oppEsc(PIPELINE_STAGES.find(s => s.id === o.stage)?.short || '?')}</span></td>
                <td><button type="button" class="btn btn-sm btn-primary" onclick="viewOpportunity('${_oppEsc(o.id)}')">View</button></td>
              </tr>`).join('')
          }
        </tbody>
      </table>
    </div>
  `;
}

function setOppTab(tab) {
  st.oppTab = tab;
  render();
}

function setOppAgency(agency) {
  st.oppAgency = agency;
  render();
}

function updateOppSearch(val) {
  st.oppSearch = val;
  if ((st.oppTab || 'live') === 'historical') {
    const pos = document.getElementById('oppSearch')?.selectionStart;
    render();
    const input = document.getElementById('oppSearch');
    if (input) { input.focus(); if (pos != null) input.setSelectionRange(pos, pos); }
    return;
  }
  clearTimeout(_govSearchTimer);
  _govSearchTimer = setTimeout(() => _loadLiveGrantsGov(), 450);
}

function clearOppSearch() {
  st.oppSearch = '';
  st.oppAgency = '';
  st.oppFilters = {};
  render();
}

async function _loadLiveGrantsGov() {
  const container = document.getElementById('gov-live-list');
  if (!container) return;

  const up = (typeof getUserProfile === 'function' && st.currentUser) ? getUserProfile(st.currentUser) : null;
  const profileKw = (up?.researchInterests || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 2).join(' ');
  const keyword = (st.oppSearch || '').trim() || profileKw || 'research agriculture education';
  const agency = (st.oppAgency || '').trim();
  const cacheKey = `${agency}|${keyword}`;

  if (_liveOppsCache[cacheKey] && Date.now() - _liveOppsCache[cacheKey].ts < 300000) {
    _renderLiveOppsList(container, _liveOppsCache[cacheKey].data, keyword);
    return;
  }

  container.innerHTML = `<div class="mr-grants-loading">Searching Grants.gov for "${_oppEsc(keyword)}"...</div>`;

  try {
    const res = await fetch('/api/grants-gov', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'search',
        params: {
          keyword,
          agency,
          statuses: 'posted|forecasted',
          rows: 20,
          offset: 0,
          sortBy: 'openDate|desc'
        }
      })
    });
    const json = await res.json();
    const opps = json?.data?.oppHits || [];
    _liveOppsCache[cacheKey] = { data: opps, ts: Date.now() };
    const current = document.getElementById('gov-live-list');
    if (current) _renderLiveOppsList(current, opps, keyword);
  } catch (err) {
    console.error('Grants.gov fetch error:', err);
    const current = document.getElementById('gov-live-list');
    if (current) current.innerHTML = '<div class="mr-grants-error">Could not reach Grants.gov right now. Please try again shortly.</div>';
  }
}

function _renderLiveOppsList(container, opps, keyword) {
  if (!opps.length) {
    container.innerHTML = `<div class="mr-grants-empty">No open or forecasted Grants.gov solicitations matched "${_oppEsc(keyword)}". Try broader keywords or clear the agency filter.</div>`;
    return;
  }

  window._liveOppsIndex = {};
  opps.forEach(o => { window._liveOppsIndex[String(o.id)] = o; });

  container.innerHTML = `
    <div class="mr-grants-count">${opps.length} open/forecasted solicitation${opps.length === 1 ? '' : 's'} for "${_oppEsc(keyword)}"</div>
    ${opps.map(opp => `
      <div class="mr-grant-card">
        <div class="mr-grant-title">
          <a href="https://www.grants.gov/search-results-detail/${encodeURIComponent(opp.id)}" target="_blank" rel="noopener">${_oppEsc(opp.title || 'Untitled Solicitation')}</a>
        </div>
        <div class="mr-grant-meta">
          <span class="mr-grant-number">${_oppEsc(opp.number || '')}</span>
          <span class="mr-grant-status ${opp.oppStatus === 'posted' ? 'posted' : 'forecasted'}">${_oppEsc(opp.oppStatus || 'open')}</span>
          ${opp.openDate ? `<span class="mr-grant-date">Open: ${_oppEsc(opp.openDate)}</span>` : ''}
          ${opp.closeDate ? `<span class="mr-grant-date">Close: ${_oppEsc(opp.closeDate)}</span>` : ''}
        </div>
        ${opp.agencyName ? `<div class="mr-grant-agency">${_oppEsc(opp.agencyName)}</div>` : ''}
        <div class="opp-card-actions">
          <button type="button" class="btn btn-primary btn-sm" onclick="startNOIFromGrant('${_oppEsc(opp.id)}')">Start NOI with This Solicitation</button>
          <a href="https://www.grants.gov/search-results-detail/${encodeURIComponent(opp.id)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">View on Grants.gov</a>
        </div>
      </div>
    `).join('')}
  `;
}

function startNOIFromGrant(oppId) {
  const opp = window._liveOppsIndex?.[String(oppId)];
  if (!opp) return;
  st.noiData = {
    ...(st.noiData || {}),
    sponsor: opp.agencyName || '',
    solicitation: opp.number || '',
    title: opp.title || '',
    deadline: opp.closeDate || ''
  };
  st.wizardStep = 0;
  setView('noi-wizard');
}

function filterOpportunities() {
  let data = [...OPPORTUNITIES_DATA];
  if (st.oppSearch) {
    const terms = st.oppSearch.toLowerCase().split(/\s+/).filter(Boolean);
    data = data.filter(o => {
      const haystack = [
        o.piName, o.piDept, o.title, o.sponsor,
        o.program || '', o.piCollege || '',
        (o.subInstitutions || []).join(' ')
      ].join(' ').toLowerCase();
      return terms.every(t => haystack.includes(t));
    });
  }
  if (st.oppFilters?.sponsor) data = data.filter(o => o.sponsor === st.oppFilters.sponsor);
  if (st.oppFilters?.type) data = data.filter(o => o.type === st.oppFilters.type);
  return data;
}

function viewOpportunity(id) {
  st.activeOpportunity = id;
  setView('pipeline');
}

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStageBadge(stage) {
  if (stage >= 12) return 'badge-success';
  if (stage >= 8) return 'badge-warning';
  if (stage >= 4) return 'badge-info';
  return 'badge-muted';
}
