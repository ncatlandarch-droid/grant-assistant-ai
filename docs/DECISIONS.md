# Granted — Architectural & Product Decisions

## 2026-11-19: Consolidate `2-SBIR SRTT Grants` into `Grant Assistant AI` (`thinkgrant.app`)
- **Decision:** Owner confirmed consolidating `2-SBIR SRTT Grants` (`granted-intelligence.netlify.app`) into `Grant Assistant AI` (`thinkgrant.app`) as a single unified **Granted** platform rather than maintaining two separate apps sharing Firebase project `grant-assistant-ai`.
- **Immediate Impact:** Unified `firestore.rules` deployed to `grant-assistant-ai` covering both apps' collections so neither app breaks during consolidation.

## 2026-11-19: Host Learning Center Videos in Firebase Storage
- **Decision:** Owner selected Firebase Storage (`grant-assistant-ai.firebasestorage.app`) to host the 234 MB of Learning Center explainer videos (`videos/*.mp4`) plus ADA Title II `.vtt` closed captions and transcripts, keeping large binaries out of Git.
- **Prerequisite:** Enable Firebase Storage in Firebase Console (`Get Started`), then deploy `storage.rules` and upload compressed MP4 + `.vtt` assets.

## 2026-11-19: Commercial Branding Boundary (`pricing.html`)
- **Decision:** Replaced `SFRIC ERD Studio` references in `pricing.html` with `Think! Design and Planning, LLC` to maintain a clean IP/entity boundary between NC A&T employment units and Think!'s commercial SaaS offering.
