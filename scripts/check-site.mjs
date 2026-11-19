// Fast offline checks. Run before every deploy:   npm run check
// No network, no API key. Netlify also runs this as the build command, so a failing check blocks the deploy.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join, sep } from "node:path";

import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const fails = [];
let passed = 0;
const ok = (cond, msg) => { if (cond) passed++; else fails.push(msg); };
const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? (n === 'node_modules' ? [] : walk(p)) : [p]; });

// 1. Every JS file parses.
const jsFiles = [...walk(join(ROOT, 'js')), ...walk(join(ROOT, 'netlify'))].filter(f => /\.(m?js)$/.test(f));
for (const f of jsFiles) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); ok(true); }
  catch (e) { ok(false, `Syntax error in ${f}: ${e.stderr.toString().split('\n').slice(0, 4).join(' ')}`); }
}

// 2. index.html only loads local scripts that exist, and auth.js loads last among local scripts.
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const local = [...html.matchAll(/<script src="(?!https?:)([^"]+)"/g)].map(m => m[1]);
for (const s of local) ok(existsSync(join(ROOT, s)), `index.html loads missing file ${s}`);
ok(local.at(-1) === 'js/auth.js', 'js/auth.js must be the last local script in index.html');

// 3. No secrets or retired models in shipped code.
for (const f of jsFiles.concat(join(ROOT, 'index.html'))) {
  const src = readFileSync(f, 'utf8');
  const keys = src.match(/AIza[0-9A-Za-z_\-]{30,}/g) || [];
  // Firebase web config key is public by design; any other Google key is a leak.
  const rel = f.replaceAll(sep, '/');
  ok(keys.length === 0 || rel.endsWith('/js/firebase.js'), `Possible Google API key in ${f}`);
  ok(!/re_[A-Za-z0-9]{20,}/.test(src), `Possible Resend key in ${f}`);
  ok(!/gemini-(1\.|2\.0)/.test(src), `Retired Gemini model id in ${f}`);
  ok(!/generativelanguage\.googleapis\.com/.test(src) || rel.includes('/netlify/'),`Browser code calls Gemini directly (key would be exposed) in ${f}`);
}

// 4. Model fallback logic (mocked — no network).
const g = require(join(ROOT, 'netlify', 'lib', 'gemini.js'));
const fake = script => async (model) => { const s = script[model]; if (s.delay) await new Promise(r => setTimeout(r, s.delay)); if (s.throw) throw new Error('net'); return { status: s.status, text: s.text || '{}', model }; };
const M = { main: 'main-m', fallback: 'back-m' };
const run = (script, extra = {}) => g.generate({}, { apiKey: 'x', models: M, callOnce: fake(script), ...extra });
const cases = [
  ['main answers -> main used', { 'main-m': { status: 200 }, 'back-m': { status: 200 } }, 'main-m'],
  ['404 -> fallback', { 'main-m': { status: 404 }, 'back-m': { status: 200 } }, 'back-m'],
  ['410 -> fallback', { 'main-m': { status: 410 }, 'back-m': { status: 200 } }, 'back-m'],
  ['503 -> fallback', { 'main-m': { status: 503 }, 'back-m': { status: 200 } }, 'back-m'],
  ['retired-model 400 -> fallback', { 'main-m': { status: 400, text: 'models/x is no longer available' }, 'back-m': { status: 200 } }, 'back-m'],
  ['ordinary 400 -> no fallback', { 'main-m': { status: 400, text: 'bad request' }, 'back-m': { status: 200 } }, 'main-m'],
  ['network error -> fallback', { 'main-m': { throw: true }, 'back-m': { status: 200 } }, 'back-m'],
  ['slow main -> backup wins', { 'main-m': { status: 200, delay: 300 }, 'back-m': { status: 200 } }, 'back-m', { hedgeMs: 50 }],
  ['slow main, backup fails -> main', { 'main-m': { status: 200, delay: 150 }, 'back-m': { status: 503 } }, 'main-m', { hedgeMs: 50 }],
];
for (const [name, script, want, extra] of cases) {
  const r = await run(script, extra);
  ok(r.model === want, `Fallback: ${name} (got ${r.model} ${r.status})`);
}
ok(g.cleanModel('evil/../x', 'd') === 'd', 'Model names from env are validated');
delete process.env.GEMINI_MODEL; delete process.env.GEMINI_FALLBACK_MODEL;
ok(g.models().main === 'gemini-3.8-flash' && g.models().fallback === 'gemini-3.5-flash', 'Default models are gemini-3.8-flash / gemini-3.5-flash');

// 5. Prefill link parser (js/prefill.js) rejects junk and escapes nothing into HTML itself.
const prefillSrc = readFileSync(join(ROOT, 'js', 'prefill.js'), 'utf8');
const sandbox = {}; new Function('window', prefillSrc + '\nwindow.parseOppPrefill = parseOppPrefill;')(sandbox);
const P = q => sandbox.parseOppPrefill(q);
const good = P('?opp=USDA-NIFA-AFRI-010185&title=Soil%20Health%20%26%20Water&agency=USDA%20NIFA&close=2027-02-15&src=aggie-gateway');
ok(good && good.opp === 'USDA-NIFA-AFRI-010185' && good.title === 'Soil Health & Water' && good.close === '2027-02-15' && good.src === 'aggie-gateway', 'Prefill parses a good link');
ok(P('?opp=<script>alert(1)</script>') === null, 'Prefill rejects a bad opportunity number');
ok(P('?title=x') === null, 'Prefill needs opp');
const bad = P('?opp=ABC-1&close=next%20week&title=' + 'x'.repeat(900) + '&src=evil');
ok(bad && bad.close === '' && bad.title.length <= 300 && bad.src === '', 'Prefill drops bad date, trims long title, ignores unknown src');
ok(P('?opp=ABC-1&title=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E').title.indexOf('<') === -1, 'Prefill strips angle brackets');

// 6. Modular consolidation engines (compliance-engine + rubric-engine) pass offline tests & line limits.
const comp = require(join(ROOT, 'js', 'modules', 'compliance-engine.js'));
const rub  = require(join(ROOT, 'js', 'modules', 'rubric-engine.js'));
const ncChecks = comp.checkProposalCompliance('Executive Summary', 'Our Greensboro, North Carolina franchise startup has [INSERT NAME] and https://example.com', 'nc-idea');
ok(ncChecks.some(c => /Franchise/i.test(c.label) && !c.pass), 'Compliance flags NC IDEA franchise disqualifier');
ok(ncChecks.some(c => /placeholder/i.test(c.label) && !c.pass), 'Compliance flags unfilled placeholder');
const flags = comp.detectComplianceFlags('We will survey 100 farmers and collect livestock tissue using a UAV drone with 1:1 match.');
ok(flags.some(f => f.id === 'humanSubjects') && flags.some(f => f.id === 'animals') && flags.some(f => f.id === 'exportCtrl') && flags.some(f => f.id === 'costShare'), 'Auto-compliance detects IRB, IACUC, Export Control, and Cost Share');
const rScore = rub.scoreProposalAgainstRubric('nc-idea', 'Our full-time founder built and deployed a scalable AI SaaS platform in Greensboro, North Carolina with pilot customers, LOI traction, $50,000 milestones, and follow-on NSF STTR leverage.');
ok(rScore.overall >= 40 && rScore.overall <= 100 && rScore.criteria.length === 4, `Rubric scorer returns weighted NC IDEA score (got ${rScore.overall})`);
ok(rub.scoreProposalAgainstRubric('nc-idea', '').overall === 0, 'Empty draft scores 0 on rubric');
for (const modFile of ['js/modules/compliance-engine.js', 'js/modules/rubric-engine.js', 'js/modules/grant-studio.js']) {
  const lines = readFileSync(join(ROOT, modFile), 'utf8').split('\n').length;
  ok(lines <= 500, `Modular limit <=500 lines for ${modFile} (got ${lines})`);
}

console.log(`${passed} checks passed`);
if (fails.length) { console.error(`${fails.length} FAILED:\n - ` + fails.join('\n - ')); process.exit(1); }
