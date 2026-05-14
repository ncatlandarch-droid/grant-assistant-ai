# Grant Assistant AI — Project Intelligence

This file gives any AI assistant (or new developer) instant full context on this project.
Read this before making any changes.

---

## What This Is

A grant lifecycle management tool for NC A&T CAES (College of Agriculture & Environmental Sciences).
Researchers submit Notices of Intent (NOIs), track them through a 12-stage approval pipeline,
and receive AI-powered guidance from "Grant" — a Gemini-powered assistant with voice.

**Designed to be deployed at any university in ~30 minutes by swapping one config file.**

---

## Tech Stack (No Build Step)

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS, single HTML file, one CSS file |
| Database | Firebase Firestore (compat CDN) |
| Auth | Firebase Auth — Google Sign-In |
| AI Chat | Gemini 2.0 Flash via Netlify function proxy |
| AI Voice | Gemini 2.5 Flash Preview TTS — Charon voice |
| AI Analysis | Gemini 2.0 Flash multimodal (reads PDFs) |
| Email | Resend transactional email via Netlify function |
| PDF Export | jsPDF — runs entirely in browser, no server |
| Hosting | Netlify (auto-deploy from GitHub) |

---

## File Structure

```
index.html                          — Entry point. Script load order matters — do not reorder.
styles.css                          — All styles in one file.
CLAUDE.md                           — This file.

js/
  app.js                            — Global state (st{}), render(), setView(), initApp()
  auth.js                           — Google Sign-In, ADMIN_EMAILS whitelist, onAuthStateChanged
                                      MUST be loaded last in index.html (st must exist first)
  firebase.js                       — Firebase app init (config is public/safe for frontend)
  db.js                             — Firestore CRUD: saveSubmission, listenToSubmissions,
                                      updateSubmissionStage, deleteSubmission, addNote, sendEmail()
  header.js                         — 3-state auth header (signed-out / PI / admin)
  avatar.js                         — Grant avatar, voice badge
  chat.js                           — Gemini chat, proposal builder, formatMessage()
  tts.js                            — Gemini TTS, AudioContext singleton, Charon voice
  opportunities.js                  — Opportunities browser + filters
  pipeline.js                       — Kanban (admin/public), Table view (admin), My Proposals (PI),
                                      advanceSubmission, submitNote, exportSubmissionsCSV
  document-upload.js                — Research Match: PDF/text → Gemini → opportunity matching
  noi-wizard.js                     — 6-step NOI form → Firestore
  checklist.js                      — Right-column approval checklist
  knowledge-base.js                 — Local grant knowledge for offline/fallback AI responses
  pdf.js                            — exportNOIPdf() — jsPDF branded NOI document generation

  data/
    institution-config.js           — *** ALL institution-specific settings. Swap this for new college. ***
    opportunities-data.js           — Mock/historical opportunity data (OPPORTUNITIES_DATA array)
    process-ecosystem.js            — PIPELINE_STAGES, APPROVAL_CHAIN, OSP_ROLES, FUNDER_RULES

netlify/
  functions/
    gemini.js                       — Chat proxy — keeps GEMINI_API_KEY server-side
    gemini-tts.js                   — TTS proxy
    analyze-doc.js                  — Document analysis — PDF/text → Gemini → structured JSON
    generate-irb.js                 — IRB protocol draft generator — 13-section outline via Gemini
    send-email.js                   — Resend email: submission confirm, admin alert, stage advance
    deadline-reminder/
      index.js                      — Scheduled function (daily 2pm UTC) — 14/7-day deadline emails
      package.json                  — { firebase-admin: ^11.11.0 } — own package so nft can bundle it
netlify.toml                        — NODE_VERSION=18, node_bundler=nft, publish=".", schedule for deadline-reminder
```

---

## Global State Object (st)

```javascript
const st = {
  view:           'dashboard',       // current tab
  avatarMode:     'coach',           // chat persona
  messages:       [],                // chat history
  activeOpportunity: null,           // id of open detail card (pipeline + opp detail)
  oppSearch:      '',                // opportunity search string
  oppFilters:     {},                // opportunity filter state
  wizardStep:     0,                 // NOI wizard step (0-5)
  noiData:        {},                // accumulated NOI form data
  _greeting:      null,              // stored greeting (avoids re-speaking on re-render)
  submissions:    [],                // live Firestore submissions (from onSnapshot)
  currentUser:    null,              // Firebase auth user object
  isAdmin:        false,             // true if currentUser.email in ADMIN_EMAILS
  pipelineView:   'kanban',          // 'kanban' | 'table' (admin only)
  tableSort:      { col: 'submittedAt', dir: 'desc' },
  tableFilter:    { search: '', stage: '' }
};
```

---

## Auth — Three States

| State | Who | What they see |
|---|---|---|
| Not signed in | Anyone | Full kanban (live + mock), "Track My Submissions" + "Admin" buttons in header |
| PI signed in | Researcher (non-admin Google account) | "My Proposals" — filtered to their piEmail |
| Admin signed in | ncatlandarch@gmail.com | Full kanban + Table view + advance/delete + notes |

Admin emails are in `js/auth.js` → `ADMIN_EMAILS` array.
Auth loads last so `st` and `render()` exist when `onAuthStateChanged` fires.

---

## Firestore Data Model

### Collection: `submissions`
```
{
  submittedAt:      Timestamp,
  stage:            1–12,
  status:           string (STAGE_NAMES[stage]),
  piName, piEmail, piDept, piCollege, coPIs,
  sponsor, program, solicitation, deadline, type,
  title, summary,
  estimatedFunding: number,
  duration, subrec, subInst, costShare, costShareAmt,
  effort, budgetNotes, solicitation,
  compliance: { humanSubjects, animals, radioactive, biohazard, exportCtrl, coi },
  notes: [{ text, author, ts: ISO string }]  ← arrayUnion appended
}
```

---

## Key Patterns

### Adding a new nav tab
1. Add `{ id: 'my-view', label: '🔖 My View' }` to `navTabs` in `institution-config.js`
2. Add `case 'my-view': workspace.appendChild(renderMyView()); break;` in `app.js` switch
3. Create `js/my-view.js` with `function renderMyView() { ... }`
4. Add `<script src="js/my-view.js"></script>` before `auth.js` in `index.html`

### Adding a new Netlify function
1. Create `netlify/functions/my-function.js` with `exports.handler = async (event) => { ... }`
2. Call it from browser: `fetch('/.netlify/functions/my-function', { method: 'POST', ... })`
3. Access env vars with `process.env.MY_ENV_VAR` — set in Netlify dashboard

### Sending an email
```javascript
sendEmail('submission', { piEmail, title, sponsor, estimatedFunding, ... })  // PI confirm + admin alert
sendEmail('stage_advance', { piEmail, title, stage, sponsor, estimatedFunding }) // stage update
```
`sendEmail()` is in `db.js` and is always fire-and-forget (`.catch(console.error)` only).

### Adding to Firestore
```javascript
await saveSubmission(data);                          // new NOI
await updateSubmissionStage(id, newStage, actor);    // advance stage + appends stageHistory entry
await addNote(id, text, authorName);                 // append note (arrayUnion)
await saveIRBDraft(id, markdownText);                // save or clear IRB draft
await deleteSubmission(id);                          // remove document
```

---

## Netlify Environment Variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API — chat, TTS, document analysis, IRB generation |
| `RESEND_API_KEY` | Resend transactional email |
| `ADMIN_EMAIL` | Who receives new submission + 7-day deadline alerts (default: ncatlandarch@gmail.com) |
| `FROM_EMAIL` | Sender address (default: onboarding@resend.dev) |
| `FIREBASE_PROJECT_ID` | Firebase project ID — required for deadline-reminder scheduled function |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account client email — required for deadline-reminder |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key (with literal `\n`, Netlify stores as `\\n`) |

---

## SOP — Deploy to a New College in ~30 Minutes

1. **Fork** this repo on GitHub
2. **Edit** `js/data/institution-config.js`:
   - institution name, college, abbreviation, website
   - brand colors (primary, accent, caesGreen)
   - logo URL or path
   - assistant name, voice, greeting
   - grant office contact info
3. **Update** `js/auth.js` → `ADMIN_EMAILS` with new admin email
4. **Create Firebase project**:
   - Enable Firestore (start in production mode)
   - Enable Authentication → Google provider
   - Copy config into `js/firebase.js`
5. **Create Netlify site** from forked GitHub repo
6. **Set environment variables** in Netlify dashboard (7 vars — see table above)
7. **Add Netlify domain** to Firebase Auth → Settings → Authorized Domains
8. **For deadline reminders**: Firebase Console → Project Settings → Service Accounts → Generate new private key → use values for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
9. **Push** — auto-deploys in ~60 seconds

That's it. The new college has a fully working grant management AI.

---

## What's Been Built (Chronological)

1. Core UI — dashboard, opportunities browser, NOI wizard, pipeline kanban, chat, TTS voice
2. Firebase Firestore — live NOI submissions, real-time pipeline updates via onSnapshot
3. Admin login — Google Sign-In, stage advance, delete, admin controls on pipeline cards
4. Email notifications — PI confirmation, admin alert, stage-advance updates via Resend
5. PI portal — researchers sign in, see only their proposals, track progress
6. PDF export — browser-side jsPDF, branded NOI document
7. PI detail view — full submission details, compliance flags, OSP notes
8. Admin notes — OSP adds notes to submissions, PI sees them
9. Research Match — PDF/text upload → Gemini multimodal → opportunity matching → pre-filled NOI
10. Admin table view — sortable/filterable table, stats bar, CSV export
11. Deadline reminder emails — Netlify scheduled function (daily 2pm UTC), 14/7-day PI emails + 7-day admin alert, `remindersSent[]` prevents duplicates, Firebase Admin SDK for server-side Firestore
12. IRB draft generator — Gemini generates 13-section IRB protocol outline, markdown → styled HTML, copy / PDF / regenerate, saves to Firestore, auto-appears when `compliance.humanSubjects === true`
13. Stage history log — every `advanceSubmission()` call appends `{ stage, status, by, ts }` to `stageHistory[]` via arrayUnion; timeline card shows on all detail views

---

## Firestore — submissions document fields (complete)
```
submittedAt, stage, status, piName, piEmail, piDept, piCollege, coPIs,
sponsor, program, solicitation, deadline, type, title, summary,
estimatedFunding, duration, subrec, subInst, costShare, costShareAmt,
effort, budgetNotes,
compliance: { humanSubjects, animals, radioactive, biohazard, exportCtrl, coi },
notes: [{ text, author, ts }],           ← arrayUnion appended by addNote()
remindersSent: ['14day', '7day'],         ← arrayUnion appended by deadline-reminder
stageHistory: [{ stage, status, by, ts }], ← arrayUnion appended by updateSubmissionStage()
irbDraft: string | null                  ← set by saveIRBDraft()
```

---

## What's Next (Roadmap)

- **Better semantic search** — embeddings-based opportunity matching (beyond keyword overlap)
- **Interfolio / Banner integration** — connect to existing university systems
- **Auto-compliance detection** — detect IRB/IACUC flags automatically from abstract text
