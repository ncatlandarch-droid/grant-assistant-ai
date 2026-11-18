/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Shared Gemini caller for Granted's Netlify functions.
   - Model comes from env (GEMINI_MODEL), never from the browser.
   - Falls back to GEMINI_FALLBACK_MODEL on 404/410/503, a retired-model 400,
     a network error, or if the main model hasn't answered in ~14 s (hedged).
   - The API key is read from env only and never returned to the caller. */

const DEFAULT_MODEL = 'gemini-3.8-flash';
const DEFAULT_FALLBACK = 'gemini-3.5-flash';
const HEDGE_MS = 14000;
const HARD_TIMEOUT_MS = 25000;
const MODEL_RE = /^[a-z0-9][a-z0-9.\-]{1,63}$/;

function cleanModel(m, def) {
  return typeof m === 'string' && MODEL_RE.test(m.trim()) ? m.trim() : def;
}

function models(kind = 'text') {
  if (kind === 'tts') {
    return {
      main: cleanModel(process.env.GEMINI_TTS_MODEL, 'gemini-2.5-flash-preview-tts'),
      fallback: cleanModel(process.env.GEMINI_TTS_FALLBACK_MODEL, 'gemini-2.5-pro-preview-tts')
    };
  }
  if (kind === 'image') {
    return {
      main: cleanModel(process.env.GEMINI_IMAGE_MODEL, 'gemini-2.5-flash-image'),
      fallback: cleanModel(process.env.GEMINI_IMAGE_FALLBACK_MODEL, 'gemini-2.5-flash-image')
    };
  }
  return {
    main: cleanModel(process.env.GEMINI_MODEL, DEFAULT_MODEL),
    fallback: cleanModel(process.env.GEMINI_FALLBACK_MODEL, DEFAULT_FALLBACK)
  };
}

/** True when the response means "this model can't serve you, try another". */
function shouldFallback(status, text) {
  if (status === 404 || status === 410 || status === 503) return true;
  if (status === 400 && /no longer available|not found|deprecated|retired|is not supported|unknown model/i.test(text || '')) return true;
  return false;
}

async function callOnce(model, payload, apiKey, signal) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload),
    signal
  });
  const text = await res.text();
  return { status: res.status, text, model };
}

/**
 * Calls Gemini with fallback + hedging.
 * Resolves { status, text, model } — text is the raw upstream body.
 * Options: kind ('text'|'tts'|'image'), fetchImpl (tests), hedgeMs.
 */
async function generate(payload, opts = {}) {
  const apiKey = opts.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return { status: 500, text: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), model: null };
  const { main, fallback } = opts.models || models(opts.kind);
  const hedgeMs = opts.hedgeMs ?? HEDGE_MS;
  const hardMs = opts.hardTimeoutMs ?? HARD_TIMEOUT_MS;
  const call = opts.callOnce || callOnce;

  const ctlMain = new AbortController();
  const ctlBack = new AbortController();
  const hardTimer = setTimeout(() => { ctlMain.abort(); ctlBack.abort(); }, hardMs);

  let backupPromise = null;
  const startBackup = () => {
    if (!backupPromise) {
      backupPromise = (fallback && fallback !== main)
        ? call(fallback, payload, apiKey, ctlBack.signal).catch(e => ({ status: 502, text: JSON.stringify({ error: 'Upstream fetch failed', detail: String(e.message || e) }), model: fallback }))
        : Promise.resolve(null);
    }
    return backupPromise;
  };

  const mainPromise = call(main, payload, apiKey, ctlMain.signal)
    .then(r => ({ ...r, ok: !shouldFallback(r.status, r.text) }))
    .catch(e => ({ status: 502, text: JSON.stringify({ error: 'Upstream fetch failed', detail: String(e.message || e) }), model: main, ok: false }));

  let hedgeTimer;
  const hedge = new Promise(resolve => { hedgeTimer = setTimeout(() => resolve('hedge'), hedgeMs); });

  try {
    const first = await Promise.race([mainPromise, hedge]);
    if (first !== 'hedge') {
      if (first.ok) { return strip(first); }
      const b = await startBackup();
      return strip(b || first);
    }
    // Main is slow: ask the backup too and take whichever usable answer comes first.
    startBackup();
    const winner = await Promise.race([
      mainPromise.then(r => (r.ok ? r : backupPromise.then(b => b || r))),
      backupPromise.then(b => (b && !shouldFallback(b.status, b.text) ? b : mainPromise))
    ]);
    return strip(winner);
  } finally {
    clearTimeout(hedgeTimer);
    clearTimeout(hardTimer);
    ctlMain.abort(); ctlBack.abort();
  }
}

function strip(r) { return { status: r.status, text: r.text, model: r.model }; }

module.exports = { generate, models, shouldFallback, cleanModel, DEFAULT_MODEL, DEFAULT_FALLBACK };
