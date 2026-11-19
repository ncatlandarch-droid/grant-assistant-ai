/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Team Roster, ORCID Import & AI Biosketch Studio
   Consolidated from 2-SBIR SRTT Grants team-bio-generator.js */

const _TB_STORAGE_KEY = 'granted_team_roster_v1';

function _tbEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _tbLoadRoster() {
  if (!st._teamRoster) {
    try {
      const saved = JSON.parse(localStorage.getItem(_TB_STORAGE_KEY) || 'null');
      st._teamRoster = Array.isArray(saved) && saved.length ? saved : [
        {
          id: 'pi-default',
          name: 'William "Chris" Harrison, PLA, MLA',
          role: 'Principal Investigator (PI)',
          affiliation: 'NC A&T State University — Dept. of Natural Resources & Environmental Design',
          orcid: '',
          expertise: 'Landscape Architecture, Digital Twins, AI Visualization, SITES v2, 1890 Land-Grant Outreach',
          bio: ''
        }
      ];
    } catch {
      st._teamRoster = [];
    }
  }
  return st._teamRoster;
}

function _tbSaveRoster() {
  try { localStorage.setItem(_TB_STORAGE_KEY, JSON.stringify(_tbLoadRoster())); } catch {}
}

function renderTeamBiosStudio() {
  const roster = _tbLoadRoster();
  const status = st._tbStatus || '';
  const el = document.createElement('div');

  el.innerHTML = `
    <div class="section-header">
      <h2><svg class="mod-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Team Roster &amp; <span>ORCID Biosketches</span></h2>
      <span class="badge badge-info">${roster.length} Team Member${roster.length === 1 ? '' : 's'}</span>
    </div>
    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:16px">
      Import verified researcher publications and affiliations directly from ORCID v3.0, generate sponsor-ready Key Personnel biosketches (with <code>[VERIFY]</code> guards), and export to Word.
    </p>

    <div class="gs-card" style="margin-bottom:16px">
      <h3>Add Team Member (or Import by ORCID)</h3>
      <div class="gs-controls">
        <div class="gs-field">
          <label for="tbOrcidInput">ORCID ID (optional — auto-fills profile)</label>
          <input id="tbOrcidInput" type="text" class="gs-textarea" style="min-height:auto;padding:8px 10px" placeholder="0000-0002-1825-0097">
        </div>
        <div class="gs-field">
          <label for="tbNameInput">Full Name &amp; Credentials</label>
          <input id="tbNameInput" type="text" class="gs-textarea" style="min-height:auto;padding:8px 10px" placeholder="Dr. Jane Doe, Ph.D.">
        </div>
        <div class="gs-field">
          <label for="tbRoleInput">Proposal Role</label>
          <select id="tbRoleInput">
            <option value="Principal Investigator (PI)">Principal Investigator (PI)</option>
            <option value="Co-Principal Investigator (Co-PI)">Co-Principal Investigator (Co-PI)</option>
            <option value="Senior Personnel">Senior Personnel</option>
            <option value="Industry / Commercialization Advisor">Industry / Commercialization Advisor</option>
            <option value="Extension / Community Partner">Extension / Community Partner</option>
          </select>
        </div>
      </div>
      <div class="gs-controls">
        <div class="gs-field">
          <label for="tbAffilInput">Institution / Department</label>
          <input id="tbAffilInput" type="text" class="gs-textarea" style="min-height:auto;padding:8px 10px" placeholder="NC A&T State University">
        </div>
        <div class="gs-field">
          <label for="tbExpInput">Expertise / Qualifications</label>
          <input id="tbExpInput" type="text" class="gs-textarea" style="min-height:auto;padding:8px 10px" placeholder="Soil science, precision ag, extension...">
        </div>
      </div>
      <div class="gs-actions" style="margin-bottom:0">
        <button type="button" class="btn btn-primary btn-sm" onclick="tbImportOrcid()">Import from ORCID</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="tbAddMember()">Add to Roster</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="tbExportAllWord()" ${!roster.length ? 'disabled' : ''}>Export Roster &amp; Bios (.doc)</button>
      </div>
      ${status ? `<p style="margin-top:10px;font-size:0.8rem;color:var(--aggie-gold)">${_tbEsc(status)}</p>` : ''}
    </div>

    <div class="gs-grid">
      ${roster.map((m, idx) => `
        <div class="gs-card">
          <div class="gs-score-header" style="margin-bottom:8px">
            <div>
              <h3 style="margin:0">${_tbEsc(m.name)}</h3>
              <div style="font-size:0.78rem;color:var(--aggie-gold);font-weight:600">${_tbEsc(m.role)}</div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="tbRemoveMember(${idx})" aria-label="Remove ${_tbEsc(m.name)}">Remove</button>
          </div>
          <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:6px">${_tbEsc(m.affiliation)}</div>
          ${m.orcid ? `<div style="font-size:0.75rem;color:#4ade80;margin-bottom:6px">ORCID: ${_tbEsc(m.orcid)}</div>` : ''}
          <div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:10px"><strong>Expertise:</strong> ${_tbEsc(m.expertise || '—')}</div>
          ${m.works?.length ? `<div style="font-size:0.74rem;color:var(--text-secondary);margin-bottom:10px"><strong>Imported Publications (${m.works.length}):</strong> ${_tbEsc(m.works.slice(0, 2).map(w => `${w.title} (${w.year || 'n.d.'})`).join('; '))}</div>` : ''}

          <div class="gs-actions" style="margin:8px 0">
            <button type="button" class="btn btn-primary btn-sm" onclick="tbGenerateBio(${idx}, 'nsf-usda')" ${m._loading ? 'disabled' : ''}>
              ${m._loading ? 'Drafting...' : 'AI Federal Biosketch'}
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="tbGenerateBio(${idx}, 'startup')" ${m._loading ? 'disabled' : ''}>
              AI Founder / SBIR Bio
            </button>
          </div>

          ${m.bio ? `<div class="gs-ai-output" style="margin-top:8px;font-size:0.82rem">${_tbEsc(m.bio).replace(/\[VERIFY[^\]]*\]/g, tag => `<span class="gs-verify-tag">${tag}</span>`)}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
  return el;
}

async function tbImportOrcid() {
  const rawId = (document.getElementById('tbOrcidInput')?.value || '').trim();
  if (!rawId) { st._tbStatus = 'Enter an ORCID ID first (e.g. 0000-0002-1825-0097).'; render(); return; }
  st._tbStatus = `Fetching ORCID profile ${rawId}...`;
  render();

  try {
    const res = await fetch(`/.netlify/functions/orcid-proxy?action=profile&id=${encodeURIComponent(rawId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    const affil = data.employments?.[0] ? `${data.employments[0].org}${data.employments[0].dept ? ' — ' + data.employments[0].dept : ''}` : '';
    const roster = _tbLoadRoster();
    roster.push({
      id: 'orcid-' + Date.now(),
      name: data.fullName || rawId,
      role: document.getElementById('tbRoleInput')?.value || 'Co-Principal Investigator (Co-PI)',
      affiliation: affil,
      orcid: data.orcid,
      expertise: (data.keywords || []).join(', ') || data.biography?.slice(0, 140) || '',
      works: data.works || [],
      bio: ''
    });
    _tbSaveRoster();
    st._tbStatus = `Imported ${data.fullName} (${(data.works || []).length} publications found).`;
  } catch (err) {
    st._tbStatus = `ORCID import failed: ${err.message}`;
  }
  render();
}

function tbAddMember() {
  const name = (document.getElementById('tbNameInput')?.value || '').trim();
  if (!name) { st._tbStatus = 'Enter a full name to add a team member.'; render(); return; }
  const roster = _tbLoadRoster();
  roster.push({
    id: 'mem-' + Date.now(),
    name,
    role: document.getElementById('tbRoleInput')?.value || 'Senior Personnel',
    affiliation: (document.getElementById('tbAffilInput')?.value || '').trim(),
    orcid: (document.getElementById('tbOrcidInput')?.value || '').trim(),
    expertise: (document.getElementById('tbExpInput')?.value || '').trim(),
    works: [],
    bio: ''
  });
  _tbSaveRoster();
  st._tbStatus = `Added ${name} to proposal roster.`;
  render();
}

function tbRemoveMember(idx) {
  const roster = _tbLoadRoster();
  roster.splice(idx, 1);
  _tbSaveRoster();
  render();
}

async function tbGenerateBio(idx, style) {
  const roster = _tbLoadRoster();
  const m = roster[idx];
  if (!m || m._loading) return;
  m._loading = true;
  render();

  const worksLine = m.works?.length
    ? `Verified ORCID works: ${m.works.slice(0, 4).map(w => `${w.title} (${w.year || 'n.d.'})`).join('; ')}.`
    : 'No publication list provided.';
  const formatHint = style === 'startup'
    ? '3-4 sentence investor/SBIR/NC IDEA third-person founder bio emphasizing execution, technical credibility, and commercialization readiness.'
    : '1-paragraph federal Key Personnel biographical statement (NSF/USDA NIFA style) emphasizing qualifications, institutional role, and project contribution.';

  const prompt = [
    `Write a ${formatHint}`,
    `Name: ${m.name} | Role: ${m.role} | Affiliation: ${m.affiliation || '[VERIFY: affiliation]'} | Expertise: ${m.expertise || '[VERIFY: expertise]'}`,
    worksLine,
    `ANTI-HALLUCINATION RULE: Never invent degrees, grant totals, years of experience, or publication counts not provided above. Use [VERIFY: detail] wherever a missing credential or metric should be confirmed.`
  ].join('\n');

  try {
    const fn = window.authFetch || fetch;
    const resp = await fn('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 700 } } })
    });
    const data = await resp.json();
    m.bio = data?.candidates?.[0]?.content?.parts?.[0]?.text || `Error (${resp.status})`;
    _tbSaveRoster();
  } catch (err) {
    m.bio = `Network error: ${err.message}`;
  } finally {
    m._loading = false;
    render();
  }
}

function tbExportAllWord() {
  const roster = _tbLoadRoster();
  window.GRANTED_DOCX.exportWordDocument({
    filename: 'granted-key-personnel-bios',
    title: 'Key Personnel Roster & Biographical Statements',
    subtitle: st.noiData?.title || 'Granted Proposal Team Package',
    tables: [{
      heading: 'Locked Proposal Team Roster',
      headers: ['Name', 'Role', 'Affiliation', 'ORCID'],
      rows: roster.map(m => [m.name, m.role, m.affiliation || '—', m.orcid || '—'])
    }],
    sections: roster.map(m => ({
      heading: `${m.name} — ${m.role}`,
      body: m.bio || `Affiliation: ${m.affiliation || '[VERIFY]'}\nExpertise: ${m.expertise || '[VERIFY]'}`
    }))
  });
}
