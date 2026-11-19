/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! Server-Side Firebase ID Token Verification & Rate Guard
   Uses official Google x509 certs + Node crypto (zero service-account secrets needed). */

const crypto = require('node:crypto');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'grant-assistant-ai';
const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || 'ncatlandarch@gmail.com,wcharrison@ncat.edu,chris@thinkdesignplanning.com')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
);

const ALLOWED_ORIGINS = [
  /^https:\/\/thinkgrant\.app$/i,
  /^https:\/\/[a-z0-9-]+\.netlify\.app$/i,
  /^https?:\/\/localhost(?::\d+)?$/i,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i
];

let _certCache = { certs: null, expiresAt: 0 };
const _rateBuckets = new Map();

function _b64UrlDecode(str) {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

async function _getCerts(fetchImpl = fetch) {
  if (_certCache.certs && Date.now() < _certCache.expiresAt) return _certCache.certs;
  const res = await fetchImpl(CERTS_URL);
  if (!res.ok) throw new Error(`Cert fetch failed (${res.status})`);
  const cc = res.headers.get('cache-control') || '';
  const maxAgeMatch = cc.match(/max-age=(\d+)/i);
  const ttlMs = (maxAgeMatch ? Number(maxAgeMatch[1]) : 3600) * 1000;
  const certs = await res.json();
  _certCache = { certs, expiresAt: Date.now() + ttlMs };
  return certs;
}

async function verifyIdToken(token, opts = {}) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let header, payload;
  try {
    header = JSON.parse(_b64UrlDecode(parts[0]).toString('utf8'));
    payload = JSON.parse(_b64UrlDecode(parts[1]).toString('utf8'));
  } catch { return null; }

  if (header.alg !== 'RS256' || !header.kid) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) return null;
  if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) return null;
  if (payload.aud !== (opts.projectId || PROJECT_ID)) return null;
  if (payload.iss !== `https://securetoken.google.com/${opts.projectId || PROJECT_ID}`) return null;
  if (!payload.sub || typeof payload.sub !== 'string') return null;

  const certs = opts.certs || await _getCerts(opts.fetchImpl);
  const cert = certs[header.kid];
  if (!cert) return null;

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();
  const sig = _b64UrlDecode(parts[2]);
  if (!verifier.verify(cert, sig)) return null;

  return {
    uid: payload.sub,
    email: (payload.email || '').toLowerCase(),
    emailVerified: !!payload.email_verified,
    isAdmin: !!payload.email_verified && ADMIN_EMAILS.has((payload.email || '').toLowerCase())
  };
}

function _extractBearer(event) {
  const h = event?.headers || {};
  const auth = h.authorization || h.Authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : '';
}

async function requireAuth(event, opts = {}) {
  const token = _extractBearer(event);
  if (!token) return { ok: false, statusCode: 401, error: 'Authentication required (missing Firebase ID token)' };
  try {
    const user = await verifyIdToken(token, opts);
    if (!user) return { ok: false, statusCode: 401, error: 'Invalid or expired authentication token' };
    if (opts.adminOnly && !user.isAdmin) {
      return { ok: false, statusCode: 403, error: 'Admin privileges required for this action' };
    }
    return { ok: true, user };
  } catch (err) {
    return { ok: false, statusCode: 401, error: `Auth verification failed: ${err.message}` };
  }
}

function checkOriginAndRateLimit(event, opts = {}) {
  const h = event?.headers || {};
  const origin = h.origin || h.Origin || '';
  if (origin && !ALLOWED_ORIGINS.some(rx => rx.test(origin))) {
    return { ok: false, statusCode: 403, error: 'Cross-origin request blocked' };
  }

  const maxBytes = opts.maxBodyBytes || 512 * 1024;
  if (event?.body && Buffer.byteLength(event.body, 'utf8') > maxBytes) {
    return { ok: false, statusCode: 413, error: 'Request payload too large' };
  }

  const ip = (h['x-nf-client-connection-ip'] || h['x-forwarded-for'] || 'local').split(',')[0].trim();
  const hasToken = !!_extractBearer(event);
  const limit = hasToken ? (opts.maxAuthedPerMin || 120) : (opts.maxAnonPerMin || 25);
  const now = Date.now();
  const entry = _rateBuckets.get(ip);

  if (!entry || now - entry.windowStart > 60000) {
    _rateBuckets.set(ip, { windowStart: now, count: 1 });
  } else {
    entry.count++;
    if (entry.count > limit) {
      return { ok: false, statusCode: 429, error: 'Rate limit exceeded. Please wait a moment and try again.' };
    }
  }
  return { ok: true };
}

module.exports = { verifyIdToken, requireAuth, checkOriginAndRateLimit, ADMIN_EMAILS };
