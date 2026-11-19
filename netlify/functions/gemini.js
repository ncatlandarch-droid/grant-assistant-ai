const { generate } = require('../lib/gemini');
const { checkOriginAndRateLimit } = require('../lib/auth');
/* ============================================
   Netlify Function — Gemini Chat Proxy
   Keeps GEMINI_API_KEY server-side only.
   ============================================ */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const guard = checkOriginAndRateLimit(event);
  if (!guard.ok) {
    return { statusCode: guard.statusCode, body: JSON.stringify({ error: guard.error }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY not configured in Netlify environment variables' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const r = await generate(body.payload, { kind: 'text' });
  try {
    return {
      statusCode: r.status,
      headers: { 'Content-Type': 'application/json', 'X-Gemini-Model': r.model || '' },
      body: r.text
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Upstream fetch failed', detail: err.message })
    };
  }
};
