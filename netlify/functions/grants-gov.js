/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant — Proprietary and Confidential */
/* ============================================
   Grants.gov Search Proxy
   ────────────────────────────────────────────
   Proxies requests to the public Grants.gov
   REST API (search2 + fetchOpportunity).
   No API key required — public endpoints.
   ============================================ */

export default async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 204, headers });
  }

  try {
    const body = await req.json();
    const { action, params } = body;

    let url, fetchOpts;

    if (action === 'search') {
      // Search for opportunities
      url = 'https://api.grants.gov/v1/api/search2';
      fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: params.keyword || '',
          oppStatuses: params.statuses || 'posted|forecasted',
          agencies: params.agency || '',
          fundingCategories: params.category || '',
          rows: params.rows || 10,
          startRecordNum: params.offset || 0,
          sortBy: params.sortBy || 'openDate|desc'
        })
      };
    } else if (action === 'fetch') {
      // Fetch single opportunity details
      url = `https://api.grants.gov/v1/api/fetchOpportunity?oppId=${params.oppId}`;
      fetchOpts = { method: 'GET' };
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "search" or "fetch".' }), {
        status: 400, headers
      });
    }

    const res = await fetch(url, fetchOpts);
    const data = await res.json();

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers
    });
  }
};

export const config = { path: '/api/grants-gov' };
