# Granted — State Review (18 Nov 2026)

Granted is owned by Think! Design and Planning, LLC. Live at https://thinkgrant.app.

## What works
- Site loads (HTTP 200). Static UI, opportunity data, NOI wizard and PDF export are browser-side and don't depend on AI.
- Netlify functions are deployed and respond (`gemini`, `gemini-tts`, `send-email` reachable).

## What's broken
1. **All AI is down: the Gemini API key is invalid.** Live `/.netlify/functions/gemini` and `gemini-tts` both return Google's `400 API_KEY_INVALID`. Chat, TTS voice, Research Match, IRB drafts and avatar processing all fail. **Owner action:** create a new key in Google AI Studio and set `GEMINI_API_KEY` in Netlify (Site settings → Environment variables). It's never stored in code.
2. **Retired models in code.** Even with a valid key these would break:
   - `gemini-2.0-flash`: `netlify/functions/gemini.js:26`, `analyze-doc.js:72`, `generate-irb.js:256` (plus label/text references in `js/chat.js`, `js/workflow.js`, `js/mock-review.js`, `js/proposal-builder.js`)
   - `gemini-2.0-flash-exp`: `netlify/functions/process-avatar.js:30`
   - `gemini-2.5-flash-preview-tts`: `gemini-tts.js:26` (a preview model; needs checking against current TTS models)
   Step 2 fixes this with `GEMINI_MODEL` / `GEMINI_FALLBACK_MODEL`.
3. **`grants-gov` function returns 404 live.** `netlify/functions/grants-gov.js` exists only as an uncommitted local file, so it was never deployed.
4. **Node 18 runtime** (`netlify.toml`) is past end-of-life. It should move to Node 20 or 22.
5. **No checks or tests before deploys.** There's no `package.json` at the repo root (step 3).

## Not verified (needs the owner)
- **Google sign-in:** this requires a real Google login, so I couldn't test it here. Owner: sign in at thinkgrant.app and confirm the admin view appears. If sign-in fails, check that `thinkgrant.app` is listed in Firebase Auth → Authorized domains.
- **Resend email:** `send-email` is deployed (it answers 405 to non-POST requests). Sending a real email wasn't tested because it would email people. Owner: check the Resend dashboard for recent deliveries and confirm `RESEND_API_KEY` is still valid. `FROM_EMAIL` defaults to `onboarding@resend.dev`, which only delivers to the Resend account owner. A verified domain is needed for real PIs.
- **Deadline reminders:** a scheduled function using the Firebase Admin SDK. Check Netlify → Functions → deadline-reminder logs for daily runs and errors (for example an expired service-account key).

## Repo state note
The working tree has many uncommitted changes from earlier work (about 25 modified files plus new files such as `js/overview.js`, `js/learning-center.js`, `grants-gov.js` and `videos/`). The live site may not match local code. These were left untouched and not committed. The owner should decide whether to commit them before any deploy.

## Update — fixes made 18 Nov 2026 (not yet deployed)
- **Models:** all functions use `netlify/lib/gemini.js`. `GEMINI_MODEL` defaults to `gemini-3.8-flash` and `GEMINI_FALLBACK_MODEL` to `gemini-3.5-flash`. The fallback is used on 404, 410, 503, a retired-model 400, or a network error. If the main model hasn't answered in 14 s, the backup is asked too. The browser can't choose the model anymore. TTS and image models are configurable (`GEMINI_TTS_MODEL`, `GEMINI_IMAGE_MODEL`); their defaults are 2.5-era models, so check them in AI Studio.
- **Checks:** `npm run check` runs 246 offline checks and is now the Netlify build command, so a failure blocks the deploy. `npm run test:ai` runs 4 live tests and passed 4/4 on gemini-3.8-flash. `npm run deploy:prod` runs both before deploying.
- **IRB draft timing:** the live test took about 25 s. The site's `functions_timeout` is unset (the Netlify default). If production cuts it off, move IRB generation to a background function.
- **Mock review:** it called Gemini from the browser with a key kept in localStorage. It now goes through the proxy.
- **Accessibility:** axe (WCAG 2 A/AA) reports no violations on 8 screens at 375 px wide. Muted text contrast went from 3.0:1 to about 5.2:1. Clickable cards and scroll areas now work from the keyboard, and NOI form labels are linked to their fields.
- **Prefill link:** `/?opp=<Grants.gov number>&title=&agency=&close=&src=aggie-gateway` opens the NOI wizard prefilled.
- **Owner's May work** is now committed. `videos/` (234 MB) was left out of git, so the Learning Center videos won't exist on a GitHub-built deploy until they're hosted somewhere.
