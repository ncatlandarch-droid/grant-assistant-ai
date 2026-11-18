// Live AI checks. Run before every production deploy:   npm run test:ai
// Calls Granted's real Netlify function handlers locally with the real key (from `netlify env:get`),
// so it catches retired models, broken prompts and bad JSON. Costs a few cents per run.
//
//   npm run test:ai                          -> local handlers, models from env/defaults
//   GEMINI_MODEL=gemini-x npm run test:ai    -> try a new model before switching
//   SITE=https://thinkgrant.app npm run test:ai -> test a live or preview site instead
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = new URL('..', import.meta.url);
const getEnv = k => { try { return execSync(`npx netlify env:get ${k}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split('\n').pop(); } catch { return ''; } };
const SITE = process.env.SITE;
if (!SITE) {
  for (const k of ['GEMINI_API_KEY', 'GEMINI_MODEL', 'GEMINI_FALLBACK_MODEL']) if (!process.env[k]) { const v = getEnv(k); if (v) process.env[k] = v; }
  if (!process.env.GEMINI_API_KEY) { console.error('No GEMINI_API_KEY (run `npx netlify login` and `npx netlify link` first).'); process.exit(2); }
}

async function call(fn, body) {
  const t = Date.now();
  let status, raw, model = '';
  if (SITE) {
    const res = await fetch(`${SITE}/.netlify/functions/${fn}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    status = res.status; raw = await res.text(); model = res.headers.get('x-gemini-model') || '';
  } else {
    const r = await require(`../netlify/functions/${fn}.js`).handler({ httpMethod: 'POST', body: JSON.stringify(body), headers: {} });
    status = r.statusCode; raw = r.body; model = r.headers?.['X-Gemini-Model'] || '';
  }
  let json = {}; try { json = JSON.parse(raw); } catch {}
  return { status, ms: Date.now() - t, json, model };
}

const results = [];
async function test(name, fn) {
  try { const note = await fn(); results.push({ name, ok: true, note: note || '' }); }
  catch (e) { results.push({ name, ok: false, note: e.message }); }
}
const must = (cond, msg) => { if (!cond) throw new Error(msg); };
const textOf = j => j.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';

await test('Chat proxy answers a grant question', async () => {
  const r = await call('gemini', { payload: { contents: [{ role: 'user', parts: [{ text: 'In one sentence: what is a Notice of Intent (NOI) in grant administration?' }] }] } });
  must(r.status === 200, `status ${r.status}: ${JSON.stringify(r.json).slice(0, 200)}`);
  must(/intent|propos|sponsor|submit/i.test(textOf(r.json)), 'answer does not mention intent/proposal');
  return `${r.ms} ms ${r.model}`;
});

await test('Chat proxy ignores a model name sent by the browser', async () => {
  const r = await call('gemini', { model: 'gemini-2.0-flash', payload: { contents: [{ role: 'user', parts: [{ text: 'Say OK.' }] }] } });
  must(r.status === 200, `status ${r.status} — browser model may have been used`);
  return r.model;
});

await test('Research Match returns the JSON schema', async () => {
  const r = await call('analyze-doc', { text: 'We study cover crops and soil microbial communities to improve nitrogen retention on small farms in North Carolina, with on-farm trials and grower workshops.' });
  must(r.status === 200, `status ${r.status}: ${JSON.stringify(r.json).slice(0, 200)}`);
  const d = r.json.analysis || r.json;
  must(Array.isArray(d.keywords) && d.keywords.length >= 3, 'no keywords array');
  must(typeof d.suggestedTitle === 'string' && d.suggestedTitle.length > 5, 'no suggestedTitle');
  return `${r.ms} ms`;
});

await test('IRB draft generator writes a protocol outline', async () => {
  const r = await call('generate-irb', { submission: { title: 'Farmer Survey on Cover Crop Adoption', piName: 'Test PI', piEmail: 'test@example.edu', piDept: 'Test Dept', sponsor: 'USDA NIFA', summary: 'An online survey of 200 NC farmers about cover crop use.' } });
  must(r.status === 200, `status ${r.status}: ${JSON.stringify(r.json).slice(0, 200)}`);
  must(/consent/i.test(r.json.draft || ''), 'draft does not mention consent');
  return `${r.ms} ms`;
});

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.note ? '  — ' + r.note : ''}`);
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} AI tests passed`);
process.exit(failed ? 1 : 0);
