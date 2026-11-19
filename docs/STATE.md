# Granted (`thinkgrant.app`) — Current State

**Last Updated:** 2026-11-19  
**Owner:** Think! Design and Planning, LLC (William "Chris" Harrison)  
**Live URL:** https://thinkgrant.app (Netlify site ID `1b8687f0-f44c-4544-a599-f3717fc83a2f`)  
**Firebase Project:** `grant-assistant-ai` (`318925419656`, owned by `ncatlandarch@gmail.com`)

## Working & Verified
- **AI Backend (`netlify/lib/gemini.js`):** Configured for `gemini-3.8-flash` with automatic fallback to `gemini-3.5-flash`, 14 s hedging, server-only model selection, and valid `GEMINI_API_KEY` in Netlify across all contexts/functions.
- **Firestore Security Rules (`firestore.rules`):** Deployed live to `grant-assistant-ai` on 2026-11-19. Fail-closed role-based rules covering `submissions`, `users`, plus all 5 consolidated `2-SBIR SRTT Grants` collections (`scraped_grants`, `grant_tracker`, `user_settings`, `draft_grants`, `grant_sections`).
- **Auth-Scoped Submissions Listener (`js/auth.js`, `js/db.js`, `js/app.js`):** Listener starts only after sign-in, scoped to `piEmail` for PIs and all submissions for allowlisted admins.
- **Automated Checks:** `npm run check` (246 checks) wired as Netlify build command; `npm run test:ai` (4 live tests).
- **Commercial Branding:** `pricing.html` updated from `SFRIC ERD Studio` to `Think! Design and Planning, LLC`.

## Open Owner / Next-Session Actions
1. **Resend Email Key Rotation (Owner):** Delete the misnamed Resend env var in Netlify, rotate the exposed Resend key in Resend dashboard, recreate as `RESEND_API_KEY`, verify domain for `FROM_EMAIL`, and add `ADMIN_EMAIL`.
2. **Firebase Storage Setup (Owner 1-click):** Visit `https://console.firebase.google.com/project/grant-assistant-ai/storage` and click **Get Started**, then deploy `storage.rules` and upload the 6 Learning Center videos (`videos/*.mp4`) + ADA Title II `.vtt` captions/transcripts.
3. **Consolidation from `2-SBIR SRTT Grants`:** Port `compliance.js`, `evaluation-rubrics.js`, `team-bio-generator.js`, and `orcid-proxy` into Granted as an SBIR/Startup track alongside the University OSP track.
4. **Function Auth Hardening:** Require verified Firebase ID tokens on `send-email`, `generate-irb`, `analyze-doc`, `process-avatar`, and `gemini`, and issue a dedicated Granted Gemini API key with budget cap.
5. **Opportunities Default:** Switch default Opportunities view to live Grants.gov (`netlify/functions/grants-gov.js`) and move 2025 historical NC A&T NOIs into a "Historical Awards" tab.
