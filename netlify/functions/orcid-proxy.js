/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! ORCID Public API v3.0 Proxy (Works out-of-the-box without OAuth secrets)
   Consolidated from 2-SBIR SRTT Grants */

const ORCID_ID_RE = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

async function orcidFetch(path) {
  const res = await fetch(`https://pub.orcid.org${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Granted-ThinkDesignPlanning/1.0' }
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`ORCID API error (${res.status}): ${errText.slice(0, 180)}`);
  }
  return res.json();
}

function parseOrcidProfile(id, raw) {
  const person = raw?.person || {};
  const nameObj = person.name || {};
  const given = nameObj['given-names']?.value || '';
  const family = nameObj['family-name']?.value || '';
  const fullName = [given, family].filter(Boolean).join(' ') || nameObj['credit-name']?.value || id;
  const biography = person.biography?.content || '';
  const keywords = (person.keywords?.keyword || []).map(k => k.content).filter(Boolean);

  const activities = raw?.['activities-summary'] || {};
  const employments = (activities.employments?.['affiliation-group'] || [])
    .map(g => g.summaries?.[0]?.['employment-summary'])
    .filter(Boolean)
    .slice(0, 5)
    .map(e => ({
      role: e['role-title'] || '',
      org: e.organization?.name || '',
      dept: e['department-name'] || '',
      startYear: e['start-date']?.year?.value || '',
      endYear: e['end-date']?.year?.value || 'Present'
    }));

  const educations = (activities.educations?.['affiliation-group'] || [])
    .map(g => g.summaries?.[0]?.['education-summary'])
    .filter(Boolean)
    .slice(0, 4)
    .map(e => ({
      degree: e['role-title'] || '',
      org: e.organization?.name || '',
      endYear: e['end-date']?.year?.value || ''
    }));

  const works = (activities.works?.group || [])
    .map(g => g['work-summary']?.[0])
    .filter(Boolean)
    .slice(0, 8)
    .map(w => ({
      title: w.title?.title?.value || 'Untitled',
      year: w['publication-date']?.year?.value || '',
      journal: w['journal-title']?.value || '',
      type: w.type || ''
    }));

  return { orcid: id, fullName, biography, keywords, employments, educations, works };
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  const params = event.queryStringParameters || {};
  const action = params.action || 'profile';

  try {
    if (action === 'profile') {
      const id = (params.id || '').trim().replace(/^https?:\/\/orcid\.org\//i, '');
      if (!ORCID_ID_RE.test(id)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid ORCID format (expected 0000-0000-0000-0000)' }) };
      }
      const raw = await orcidFetch(`/v3.0/${encodeURIComponent(id)}/record`);
      return { statusCode: 200, headers, body: JSON.stringify(parseOrcidProfile(id, raw)) };
    }

    if (action === 'search') {
      const q = (params.q || '').trim();
      if (q.length < 2) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Query q must be at least 2 characters' }) };
      const raw = await orcidFetch(`/v3.0/expanded-search/?q=${encodeURIComponent(q)}&rows=10`);
      const items = (raw?.['expanded-result'] || []).map(r => ({
        orcid: r['orcid-id'],
        name: [r['given-names'], r['family-names']].filter(Boolean).join(' ') || r['orcid-id'],
        institutions: (r['institution-name'] || []).slice(0, 3)
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ results: items }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action (use profile or search)' }) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) };
  }
};
