/* ============================================
   Opportunities — Searchable NOI Database
   ============================================ */

function renderOpportunities() {
  const el = document.createElement('div');
  const stats = computeOppStats();
  const filtered = filterOpportunities();

  el.innerHTML = `
    <div class="section-header">
      <h2>🔍 Grant <span>Opportunities</span></h2>
      <span class="badge badge-info">${filtered.length} of ${stats.total} shown</span>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px">
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
    </div>

    <div class="search-bar">
      <input type="text" id="oppSearch" placeholder="Search by PI, title, sponsor..."
             value="${st.oppSearch || ''}" oninput="updateOppSearch(this.value)">
      <select id="oppSponsorFilter" onchange="updateOppFilter('sponsor', this.value)">
        <option value="">All Sponsors</option>
        ${[...new Set(OPPORTUNITIES_DATA.map(o => o.sponsor))].sort().map(s =>
          `<option value="${s}" ${st.oppFilters?.sponsor === s ? 'selected' : ''}>${s}</option>`
        ).join('')}
      </select>
      <select id="oppTypeFilter" onchange="updateOppFilter('type', this.value)">
        <option value="">All Types</option>
        <option value="Capacity" ${st.oppFilters?.type === 'Capacity' ? 'selected' : ''}>Capacity</option>
        <option value="Competitive" ${st.oppFilters?.type === 'Competitive' ? 'selected' : ''}>Competitive</option>
        <option value="Contract" ${st.oppFilters?.type === 'Contract' ? 'selected' : ''}>Contract</option>
        <option value="Cooperative" ${st.oppFilters?.type === 'Cooperative' ? 'selected' : ''}>Cooperative</option>
      </select>
    </div>

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
          ${filtered.map(o => `
            <tr>
              <td>${formatDate(o.noiDate)}</td>
              <td><strong>${o.piName}</strong><br><span style="font-size:0.7rem;color:var(--text-muted)">${o.piDept}</span></td>
              <td>${o.sponsor}</td>
              <td style="max-width:250px">${o.title}</td>
              <td><span class="badge ${o.type === 'Capacity' ? 'badge-info' : 'badge-warning'}">${o.type}</span></td>
              <td>$${(o.estimatedFunding/1000).toFixed(0)}K</td>
              <td><span class="badge ${getStageBadge(o.stage)}">${PIPELINE_STAGES.find(s => s.id === o.stage)?.short || '?'}</span></td>
              <td><button class="btn btn-sm btn-primary" onclick="viewOpportunity('${o.id}')">View</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  return el;
}

function filterOpportunities() {
  let data = [...OPPORTUNITIES_DATA];
  if (st.oppSearch) {
    const q = st.oppSearch.toLowerCase();
    data = data.filter(o =>
      o.piName.toLowerCase().includes(q) ||
      o.title.toLowerCase().includes(q) ||
      o.sponsor.toLowerCase().includes(q) ||
      o.piDept.toLowerCase().includes(q)
    );
  }
  if (st.oppFilters?.sponsor) data = data.filter(o => o.sponsor === st.oppFilters.sponsor);
  if (st.oppFilters?.type) data = data.filter(o => o.type === st.oppFilters.type);
  return data;
}

function updateOppSearch(val) { st.oppSearch = val; render(); }
function updateOppFilter(key, val) {
  if (!st.oppFilters) st.oppFilters = {};
  st.oppFilters[key] = val;
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
