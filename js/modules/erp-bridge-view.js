/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Tier 1 ERP Bridge View (Banner FOAPAL + InfoEd eRA Sync & Routing) */

function _erpEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _erpState() {
  if (!st._erp) {
    st._erp = { csvInput: '', parsedRows: [], syncStatus: '', syncing: false };
  }
  return st._erp;
}

function _erpActiveSubmissions() {
  return (st.submissions && st.submissions.length) ? st.submissions : (typeof OPPORTUNITIES_DATA !== 'undefined' ? OPPORTUNITIES_DATA.slice(0, 10) : []);
}

function renderErpBridge() {
  const erp = _erpState();
  const subs = _erpActiveSubmissions();
  const isLiveData = !!(st.submissions && st.submissions.length);
  const roles = window.GRANTED_ERP?.ERP_ROUTING_ROLES || [];
  const el = document.createElement('div');

  el.innerHTML = `
    <div class="section-header">
      <h2><svg class="mod-icon" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg> ERP Bridge <span>(Banner &amp; InfoEd)</span></h2>
      <span class="badge ${isLiveData ? 'badge-success' : 'badge-info'}">
        ${isLiveData ? `${st.submissions.length} Live Firestore NOI${st.submissions.length === 1 ? '' : 's'}` : 'Demo / Benchmark Mode (Sign In for Live)'}
      </span>
    </div>
    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:16px">
      Tier 1 Zero-IT-Ticket bridge connecting Granted to NC A&amp;T <strong>InfoEd eRA</strong> and <strong>Ellucian Banner Finance (FOAPAL)</strong>: export submission packages, bulk-import weekly InfoEd/Banner status CSVs, and track role-based approval handoffs.
    </p>

    <div class="gs-grid">
      <div class="gs-card">
        <h3>1. Export to InfoEd &amp; Banner (FOAPAL)</h3>
        <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px">
          Generates RFC-4180 CSV or Banner JSON pre-mapped with NC A&amp;T Org codes, FOAPAL fields, MTDC/Cost-Share totals, and IRB/IACUC/Export flags so OSP Grant Managers avoid manual re-entry.
        </p>
        <div class="gs-actions" style="margin:0 0 14px 0">
          <button type="button" class="btn btn-primary btn-sm" onclick="erpDownloadCsv()">Download InfoEd / Banner CSV</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="erpDownloadJson()">Download Banner JSON</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="erpExportRoutingWord()">Export OSP Routing Sheet (.doc)</button>
        </div>
        <div style="font-size:0.78rem;color:var(--text-secondary)">
          <strong>Preview (${subs.length} record${subs.length === 1 ? '' : 's'}):</strong>
          ${subs.slice(0, 3).map(s => {
            const m = window.GRANTED_ERP.mapSubmissionToERP(s);
            return `<div class="gs-check-item pass" style="margin-top:6px">
              <span><strong>${_erpEsc(m.Title.slice(0, 46))}</strong><br><small>Org ${m.Banner_Org} · Fund ${m.Banner_Fund} · InfoEd ${m.InfoEd_Proposal_ID}</small></span>
              <span class="badge badge-info">Stage ${m.Stage_Num}</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="gs-card">
        <h3>2. Import Weekly InfoEd / Banner Status CSV</h3>
        <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:10px">
          Paste or upload an InfoEd/Banner export CSV (<code>Title, InfoEd_Proposal_ID, Banner_Fund, Banner_Org, Stage_Num</code>) to sync official university award/proposal IDs and stages back into Granted.
        </p>
        <div class="gs-field" style="margin-bottom:8px">
          <label for="erpCsvFile">Upload CSV File (optional)</label>
          <input id="erpCsvFile" type="file" accept=".csv,text/csv" onchange="erpHandleFileUpload(this)" style="font-size:0.8rem;color:var(--text-secondary)">
        </div>
        <div class="gs-field">
          <label for="erpCsvText">Or Paste InfoEd / Banner CSV Rows</label>
          <textarea id="erpCsvText" class="gs-textarea" style="min-height:110px;font-family:monospace;font-size:0.76rem" placeholder="Granted_ID,Title,InfoEd_Proposal_ID,Banner_Fund,Banner_Org,Stage_Num" onchange="erpSetCsv(this.value)">${_erpEsc(erp.csvInput)}</textarea>
        </div>
        <div class="gs-actions" style="margin:10px 0 6px">
          <button type="button" class="btn btn-primary btn-sm" onclick="erpParseCsv()">Preview Sync Diff</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="erpLoadSampleCsv()">Load Sample CSV</button>
          ${erp.parsedRows.some(r => r.matchedId) && st.isAdmin ? `
            <button type="button" class="btn btn-primary btn-sm" onclick="erpApplySync()" ${erp.syncing ? 'disabled' : ''}>
              ${erp.syncing ? 'Syncing to Firestore...' : 'Apply Matched Updates to Firestore'}
            </button>` : ''}
        </div>
        ${erp.syncStatus ? `<p style="font-size:0.8rem;color:var(--aggie-gold);margin-top:6px">${_erpEsc(erp.syncStatus)}</p>` : ''}
      </div>
    </div>

    ${erp.parsedRows.length ? `
      <div class="gs-card" style="margin-top:16px">
        <h3>Import Diff Preview (${erp.parsedRows.length} row${erp.parsedRows.length === 1 ? '' : 's'})</h3>
        <div class="opp-table-wrap">
          <table class="opp-table">
            <thead>
              <tr>
                <th scope="col">CSV Record</th><th scope="col">Match Status</th>
                <th scope="col">InfoEd #</th><th scope="col">Banner Fund / Org</th><th scope="col">Stage Change</th>
              </tr>
            </thead>
            <tbody>
              ${erp.parsedRows.map(r => `
                <tr>
                  <td>${_erpEsc(r.matchedTitle || r.rawTitle)}</td>
                  <td><span class="badge ${r.matchedId ? 'badge-success' : 'badge-warning'}">${r.matchedId ? 'Matched Live NOI' : 'No Live Match'}</span></td>
                  <td>${_erpEsc(r.infoEdId || '—')}</td>
                  <td>${_erpEsc([r.bannerFund, r.bannerOrg].filter(Boolean).join(' / ') || '—')}</td>
                  <td>${r.currentStage ? `Stage ${r.currentStage} → ${r.newStage || r.currentStage}` : (r.newStage ? `Stage ${r.newStage}` : '—')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${!st.isAdmin ? `<p style="font-size:0.78rem;color:var(--text-secondary);margin-top:8px">Sign in with an Admin account to write matched ERP updates directly to Firestore.</p>` : ''}
      </div>
    ` : ''}

    <div class="gs-card" style="margin-top:16px">
      <h3>3. Institutional Role-Based Routing &amp; ERP Handoff Chain</h3>
      <div class="opp-table-wrap">
        <table class="opp-table">
          <thead>
            <tr>
              <th scope="col">Stages</th><th scope="col">Approving Role</th>
              <th scope="col">System of Record</th><th scope="col">Target SLA</th><th scope="col">ERP / Compliance Checkpoint</th>
            </tr>
          </thead>
          <tbody>
            ${roles.map(r => `
              <tr>
                <td><strong>${_erpEsc(r.stages)}</strong></td>
                <td>${_erpEsc(r.role)}</td>
                <td><span class="badge badge-info">${_erpEsc(r.system)}</span></td>
                <td>${_erpEsc(r.sla)}</td>
                <td>${_erpEsc(r.checkpoint)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  return el;
}

function erpDownloadCsv() {
  const subs = _erpActiveSubmissions();
  const csv = window.GRANTED_ERP.buildERPCsv(subs);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `granted-infoed-banner-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function erpDownloadJson() {
  const subs = _erpActiveSubmissions().map(s => window.GRANTED_ERP.mapSubmissionToERP(s));
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), schema: 'NCAT-InfoEd-Banner-v1', records: subs }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `granted-banner-foapal-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function erpExportRoutingWord() {
  const subs = _erpActiveSubmissions().map(s => window.GRANTED_ERP.mapSubmissionToERP(s));
  window.GRANTED_DOCX.exportWordDocument({
    filename: 'granted-osp-erp-routing-sheet',
    title: 'OSP Pre-Award & Banner FOAPAL Routing Sheet',
    subtitle: `${window.INSTITUTION_CONFIG?.institution?.name || 'NC A&T State University'} — InfoEd / Banner Bridge`,
    tables: [{
      heading: 'Active NOI Queue Mapped to InfoEd & Banner FOAPAL',
      headers: ['Title', 'PI', 'Banner Org', 'Banner Fund', 'InfoEd #', 'Funding', 'Stage'],
      rows: subs.slice(0, 25).map(m => [
        m.Title, m.PI_Name, m.Banner_Org, m.Banner_Fund, m.InfoEd_Proposal_ID,
        '$' + Math.round(m.Estimated_Funding).toLocaleString(), `Stage ${m.Stage_Num}`
      ])
    }]
  });
}

function erpSetCsv(val) {
  _erpState().csvInput = val;
}

function erpHandleFileUpload(input) {
  const file = input?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    _erpState().csvInput = String(reader.result || '');
    erpParseCsv();
  };
  reader.readAsText(file);
}

function erpLoadSampleCsv() {
  const first = (st.submissions && st.submissions[0]) || { id: 'DEMO-001', title: 'Sample CAES Precision Agriculture NOI' };
  _erpState().csvInput = [
    'Granted_ID,Title,InfoEd_Proposal_ID,Banner_Fund,Banner_Org,Stage_Num',
    `${first.id},"${String(first.title || '').replace(/"/g, '""')}",IE-2026-0418,214820,210400,7`
  ].join('\n');
  erpParseCsv();
}

function erpParseCsv() {
  const erp = _erpState();
  const ta = document.getElementById('erpCsvText');
  if (ta) erp.csvInput = ta.value;
  erp.parsedRows = window.GRANTED_ERP.parseERPStatusCsv(erp.csvInput, st.submissions || []);
  const matched = erp.parsedRows.filter(r => r.matchedId).length;
  erp.syncStatus = erp.parsedRows.length
    ? `Parsed ${erp.parsedRows.length} row(s): ${matched} matched to live Firestore NOI(s).`
    : 'No valid CSV rows found. Include a header line and at least one data row.';
  render();
}

async function erpApplySync() {
  const erp = _erpState();
  if (!st.isAdmin || erp.syncing) return;
  const toApply = erp.parsedRows.filter(r => r.matchedId);
  if (!toApply.length) return;
  erp.syncing = true;
  render();

  let okCount = 0;
  for (const row of toApply) {
    try {
      await applyERPSyncUpdate(row.matchedId, {
        infoEdId: row.infoEdId || undefined,
        bannerFund: row.bannerFund || undefined,
        bannerOrg: row.bannerOrg || undefined,
        stage: row.newStage || undefined
      }, st.currentUser?.email || 'OSP ERP Sync');
      okCount++;
    } catch (err) {
      console.error('ERP sync error for', row.matchedId, err);
    }
  }
  erp.syncing = false;
  erp.syncStatus = `Synced ${okCount} of ${toApply.length} NOI record(s) to Firestore.`;
  render();
}
