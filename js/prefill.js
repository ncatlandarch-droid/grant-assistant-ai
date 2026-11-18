/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Prefill link — lets Aggie Gateway (or any page) hand an opportunity to Granted:

     https://thinkgrant.app/?opp=<Grants.gov number>&title=<title>&agency=<agency>&close=<close date>&src=aggie-gateway

   Every value is untrusted: validated, length-capped, control/angle characters stripped,
   and only ever written into the NOI form through escaped rendering. */

const PREFILL_SOURCES = { 'aggie-gateway': 'Aggie Gateway' };

function _pfText(v, max) {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function _pfDate(v) {
  v = _pfText(v, 30);
  let y, m, d, x;
  if ((x = v.match(/^(\d{4})-(\d{2})-(\d{2})/))) [, y, m, d] = x;
  else if ((x = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) [, m, d, y] = x;   // Grants.gov style MM/DD/YYYY
  else return '';
  const dt = new Date(Date.UTC(+y, +m - 1, +d));
  if (isNaN(dt) || dt.getUTCMonth() !== +m - 1 || +y < 2000 || +y > 2100) return '';
  return dt.toISOString().slice(0, 10);
}

/** Parses a query string. Returns null unless `opp` is a plausible opportunity number. */
function parseOppPrefill(search) {
  let q;
  try { q = new URLSearchParams(search); } catch { return null; }
  const opp = (q.get('opp') || '').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._\-]{0,59}$/.test(opp)) return null;
  const src = q.get('src') || '';
  return {
    opp,
    title:  _pfText(q.get('title'), 300),
    agency: _pfText(q.get('agency'), 120),
    close:  _pfDate(q.get('close')),
    src:    Object.prototype.hasOwnProperty.call(PREFILL_SOURCES, src) ? src : ''
  };
}

/** Maps a free-text agency onto one of the wizard's sponsor options (or ''). */
function _pfSponsor(agency) {
  if (!agency || typeof SPONSORS === 'undefined') return '';
  const a = agency.toLowerCase();
  const vals = Object.values(SPONSORS);
  return vals.find(v => v.toLowerCase() === a)
      || vals.find(v => a.includes(v.toLowerCase()) || v.toLowerCase().includes(a))
      || '';
}

/** Called once at start-up: opens the NOI wizard prefilled, then cleans the URL. */
function applyOppPrefill() {
  const p = parseOppPrefill(window.location.search);
  if (!p) return false;
  const sponsor = _pfSponsor(p.agency);
  st.noiData = {
    ...(st.noiData || {}),
    solicitation: p.opp,
    ...(p.title ? { title: p.title } : {}),
    ...(p.close ? { deadline: p.close } : {}),
    ...(sponsor ? { sponsor } : {}),
    ...(!sponsor && p.agency ? { program: p.agency } : {}),
    prefillSource: p.src || 'link'
  };
  st.wizardStep = 0;
  st.view = 'noi-wizard';
  const from = p.src ? ` from ${PREFILL_SOURCES[p.src]}` : '';
  st._prefillNote = `Opportunity ${p.opp}${from} is filled in on the Sponsor and Proposal steps. Check each value before you submit.`;
  try { history.replaceState(null, '', window.location.pathname); } catch {}
  return true;
}

if (typeof window !== 'undefined') window.parseOppPrefill = parseOppPrefill;
