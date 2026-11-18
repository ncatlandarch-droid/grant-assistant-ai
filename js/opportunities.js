/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================
   Opportunities — Searchable NOI Database
   ============================================ */

function renderOpportunities() {
  const el = document.createElement('div');
  const stats    = computeOppStats();
  const filtered = filterOpportunities();
  const hasSearch = !!(st.oppSearch || st.oppFilters?.sponsor || st.oppFilters?.type);

  el.innerHTML = `
    <div class="section-header">
      <h2>🔍 Grant <span>Opportunities</span></h2>
      <span class="badge badge-info">${filtered.length} of ${stats.total} shown</span>
    </div>

    <div class="search-bar" style="margin-bottom:${hasSearch ? '16px' : '20px'}">
      <input type="text" id="oppSearch" placeholder="Search by keyword, PI, department, sponsor, title…"
             value="${st.oppSearch || ''}" oninput="updateOppSearch(this.value)" autocomplete="off">
      ${hasSearch ? `<button class="btn btn-secondary btn-sm" onclick="clearOppSearch()" style="white-space:nowrap">✕ Clear</button>` : ''}
    </div>

    ${hasSearch
      ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:14px">
           ${filtered.length === 0
             ? '⚠️ No results match your search.'
             : `<span style="color:var(--caes-green-mid);font-weight:600">${filtered.length} result${filtered.length !== 1 ? 's' : ''}</span> matching "${st.oppSearch || ''}"`}
         </p>`
      : `<div class="dashboard-grid" style="margin-bottom:20px">
           <div class="stat-card">
             <div class="stat-value">${stats.total}</div>
             <div class="stat-label">Total NOIs</div>
           </div>
           <div class="stat-card">
             <div class="stat-value">$${(stats.totalFunding / 1000000).toFixed(1)}M</div>
             <div class="stat-label">Total Requested</div>
           </div>
           <div class="stat-card">
             <div class="stat-value">${Object.keys(stats.bySponsor).length}</div>
             <div class="stat-label">Sponsors</div>
           </div>
           <div class="stat-card">
             <div class="stat-value">${stats.byStage[12] || 0}</div>
             <div class="stat-label">Submitted</div>
           </div>
         </div>`
    }

    <div class="opp-table-wrap">
      <table class="opp-table">
        <thead>
          <tr>
            <th>NOI Date</th>
            <th>PI</th>
            <th>Sponsor</th>
            <th>Title</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Stage</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0
            ? `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted)">No matching records. Try broader keywords.</td></tr>`
            : filtered.map(o => `
              <tr>
                <td>${formatDate(o.noiDate)}</td>
                <td><strong>${o.piName}</strong><br><span style="font-size:0.7rem;color:var(--text-muted)">${o.piDept}</span></td>
                <td>${o.sponsor}</td>
                <td style="max-width:250px">${o.title}</td>
                <td><span class="badge ${o.type === 'Capacity' ? 'badge-info' : 'badge-warning'}">${o.type}</span></td>
                <td>$${(o.estimatedFunding/1000).toFixed(0)}K</td>
                <td><span class="badge ${getStageBadge(o.stage)}">${PIPELINE_STAGES.find(s => s.id === o.stage)?.short || '?'}</span></td>
                <td><button class="btn btn-sm btn-primary" onclick="viewOpportunity('${o.id}')">View</button></td>
              </tr>`).join('')
          }
        </tbody>
      </table>
    </div>
  `;

  // ── Grants.gov Live Search Results (when user searches) ──
  const govSearch = document.createElement('div');
  govSearch.className = 'grants-search-results';
  govSearch.id = 'grants-search-results';
  if (hasSearch && st.oppSearch?.length >= 3) {
    govSearch.innerHTML = `
      <div class="rec-opps-section">
        <div class="section-header" style="margin-bottom:12px">
          <h3>📡 Federal Opportunities <span>from Grants.gov</span></h3>
          <span class="badge badge-success" style="font-size:0.7rem">Live Search</span>
        </div>
        <div id="gov-search-list" class="rec-opps-list">
          <div class="mr-grants-loading">🔄 Searching Grants.gov for "${st.oppSearch}"...</div>
        </div>
      </div>
    `;
  }
  el.appendChild(govSearch);

  // ── Grants.gov Recommended Opportunities (based on profile) ──
  if (!hasSearch) {
    const recWrap = document.createElement('div');
    recWrap.className = 'grants-recommended';
    recWrap.id = 'grants-recommended';
    recWrap.innerHTML = renderRecommendedOpps();
    el.appendChild(recWrap);
  }

  // Kick off fetches after DOM attach
  setTimeout(() => {
    if (hasSearch && st.oppSearch?.length >= 3) _searchGrantsGov(st.oppSearch);
    else _loadRecommendedOpps();
  }, 150);

  return el;
}

function filterOpportunities() {
  let data = [...OPPORTUNITIES_DATA];

  if (st.oppSearch) {
    // Split query into individual words so "Landscape Architecture digital twins"
    // matches records where each word appears anywhere across all searchable fields.
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
  if (st.oppFilters?.type)    data = data.filter(o => o.type    === st.oppFilters.type);
  return data;
}

let _govSearchTimer = null;
function updateOppSearch(val) {
  st.oppSearch = val;
  // Restore focus + cursor after render so the full DOM rebuild doesn't break typing
  const pos = document.getElementById('oppSearch')?.selectionStart;
  render();
  const input = document.getElementById('oppSearch');
  if (input) { input.focus(); if (pos != null) input.setSelectionRange(pos, pos); }

  // Debounced Grants.gov search (500ms after user stops typing)
  clearTimeout(_govSearchTimer);
  if (val.trim().length >= 3) {
    _govSearchTimer = setTimeout(() => _searchGrantsGov(val.trim()), 500);
  }
}

function clearOppSearch() {
  st.oppSearch  = '';
  st.oppFilters = {};
  render();
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

// ===================================================
//  Grants.gov Recommended Opportunities
// ===================================================

/** Cache for recommended opps (5 min TTL) */
let _recOppsCache = null;
let _recOppsCacheTs = 0;

function renderRecommendedOpps() {
  const up = (typeof getUserProfile === 'function' && st.currentUser)
    ? getUserProfile(st.currentUser) : null;
  const hasProfile = !!(up?.researchInterests || up?.targetAgencies);

  return `
    <div class="rec-opps-section">
      <div class="section-header" style="margin-bottom:12px">
        <h3>📡 Recommended <span>Opportunities</span></h3>
        <span class="badge badge-success" style="font-size:0.7rem">Live from Grants.gov</span>
      </div>
      ${!hasProfile ? `
        <div class="rec-opps-setup">
          <div class="rec-opps-setup-icon">🎯</div>
          <div class="rec-opps-setup-text">
            <strong>Set up your research profile</strong> to get personalized opportunity recommendations.
            Add your research keywords and target agencies in your <a href="#" onclick="st.editingProfile=true; render(); return false">profile settings</a>.
          </div>
        </div>
      ` : `
        <div class="rec-opps-profile-tags">
          <span class="rec-tag-label">Matching:</span>
          ${(up.researchInterests || '').split(',').filter(k => k.trim()).map(k =>
            `<span class="rec-tag">${k.trim()}</span>`
          ).join('')}
          ${(up.targetAgencies || '').split(',').filter(k => k.trim()).map(k =>
            `<span class="rec-tag agency">${k.trim()}</span>`
          ).join('')}
        </div>
        <div id="rec-opps-list" class="rec-opps-list">
          <div class="mr-grants-loading">🔄 Searching Grants.gov for matching opportunities...</div>
        </div>
      `}
    </div>
  `;
}

async function _loadRecommendedOpps() {
  const container = document.getElementById('rec-opps-list');
  if (!container) return;

  const up = (typeof getUserProfile === 'function' && st.currentUser)
    ? getUserProfile(st.currentUser) : null;
  if (!up?.researchInterests && !up?.targetAgencies) return;

  // Check cache
  if (_recOppsCache && Date.now() - _recOppsCacheTs < 300000) {
    _renderRecOppsList(container, _recOppsCache);
    return;
  }

  // Build search queries from profile
  const keywords = (up.researchInterests || '').split(',').map(k => k.trim()).filter(Boolean);
  const agencies = (up.targetAgencies || '').split(',').map(k => k.trim().toUpperCase()).filter(Boolean);

  // Map agency abbreviations to Grants.gov codes
  const agencyMap = typeof GRANTS_GOV_AGENCY_MAP !== 'undefined' ? GRANTS_GOV_AGENCY_MAP : {};

  try {
    // Parallel searches: one per agency (or keyword-only if no agencies)
    const searches = [];
    if (agencies.length > 0) {
      for (const ag of agencies.slice(0, 4)) { // Max 4 agencies to be polite
        const govCode = agencyMap[ag] || ag;
        searches.push(
          fetch('/api/grants-gov', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'search',
              params: {
                keyword: keywords.slice(0, 3).join(' '), // Top 3 keywords
                agency: govCode,
                statuses: 'posted|forecasted',
                rows: 10,
                offset: 0,
                sortBy: 'openDate|desc'
              }
            })
          }).then(r => r.json()).catch(() => ({ data: { oppHits: [] } }))
        );
      }
    } else if (keywords.length > 0) {
      searches.push(
        fetch('/api/grants-gov', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'search',
            params: {
              keyword: keywords.slice(0, 5).join(' '),
              statuses: 'posted|forecasted',
              rows: 20,
              offset: 0,
              sortBy: 'openDate|desc'
            }
          })
        }).then(r => r.json()).catch(() => ({ data: { oppHits: [] } }))
      );
    }

    const results = await Promise.all(searches);

    // Merge and deduplicate
    const seen = new Set();
    const allOpps = [];
    results.forEach(r => {
      (r?.data?.oppHits || []).forEach(opp => {
        if (!seen.has(opp.id)) {
          seen.add(opp.id);
          allOpps.push(opp);
        }
      });
    });

    _recOppsCache = allOpps;
    _recOppsCacheTs = Date.now();
    _renderRecOppsList(container, allOpps);
  } catch (err) {
    console.error('Recommended opps fetch error:', err);
    container.innerHTML = '<div class="mr-grants-error">⚠️ Could not reach Grants.gov right now.</div>';
  }
}

function _renderRecOppsList(container, opps) {
  if (!opps.length) {
    container.innerHTML = '<div class="mr-grants-empty">No matching opportunities found. Try broadening your research keywords.</div>';
    return;
  }

  container.innerHTML = `
    <div class="mr-grants-count">${opps.length} matching opportunit${opps.length === 1 ? 'y' : 'ies'}</div>
    ${opps.slice(0, 20).map(opp => `
      <div class="mr-grant-card">
        <div class="mr-grant-title">
          <a href="https://www.grants.gov/search-results-detail/${opp.id}" target="_blank" rel="noopener">${opp.title || 'Untitled'}</a>
        </div>
        <div class="mr-grant-meta">
          <span class="mr-grant-number">${opp.number || ''}</span>
          <span class="mr-grant-status ${opp.oppStatus === 'posted' ? 'posted' : 'forecasted'}">${opp.oppStatus || '?'}</span>
          ${opp.openDate ? `<span class="mr-grant-date">📅 ${opp.openDate}</span>` : ''}
          ${opp.closeDate ? `<span class="mr-grant-date">⏰ ${opp.closeDate}</span>` : ''}
        </div>
        ${opp.agencyName ? `<div class="mr-grant-agency">${opp.agencyName}</div>` : ''}
      </div>
    `).join('')}
    <div class="mr-grants-footer">
      <a href="https://www.grants.gov/search-grants" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
        Explore All on Grants.gov →
      </a>
    </div>
  `;
}

// ===================================================
//  Grants.gov Live Search (from search bar)
// ===================================================
let _govSearchCache = {};

async function _searchGrantsGov(query) {
  const container = document.getElementById('gov-search-list');
  if (!container) return;

  // Cache check (5 min)
  if (_govSearchCache[query] && Date.now() - _govSearchCache[query].ts < 300000) {
    _renderRecOppsList(container, _govSearchCache[query].data);
    return;
  }

  try {
    const res = await fetch('/api/grants-gov', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'search',
        params: {
          keyword: query,
          statuses: 'posted|forecasted',
          rows: 25,
          offset: 0,
          sortBy: 'openDate|desc'
        }
      })
    });
    const json = await res.json();
    const opps = json?.data?.oppHits || [];

    _govSearchCache[query] = { data: opps, ts: Date.now() };

    // Only update if user hasn't changed their search since we started
    const currentContainer = document.getElementById('gov-search-list');
    if (currentContainer) {
      _renderRecOppsList(currentContainer, opps);

      // Update the badge
      const section = currentContainer.closest('.rec-opps-section');
      const badge = section?.querySelector('.badge-success');
      if (badge) badge.textContent = `${opps.length} results`;
    }
  } catch (err) {
    console.error('Grants.gov search error:', err);
    if (container) container.innerHTML = '<div class="mr-grants-error">⚠️ Could not reach Grants.gov right now.</div>';
  }
}
