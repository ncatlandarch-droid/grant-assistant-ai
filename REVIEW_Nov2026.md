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
