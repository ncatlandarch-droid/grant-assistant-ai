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

function updateOppSearch(val) {
  st.oppSearch = val;
  // Restore focus + cursor after render so the full DOM rebuild doesn't break typing
  const pos = document.getElementById('oppSearch')?.selectionStart;
  render();
  const input = document.getElementById('oppSearch');
  if (input) { input.focus(); if (pos != null) input.setSelectionRange(pos, pos); }
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
