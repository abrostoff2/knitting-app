# Changelog

Newest first. Reconstructed from git history at the time this file was created (2026-07-23); add new entries as they happen rather than backfilling from git going forward.

- **2026-07-23 — Add test suite, linters, and a Verify step to the dev workflow.** Added `tests/` (pytest) covering `matching.py`, `service.py`, `cache.py`, and the `extra="allow"` convention in `models.py`. Added ruff config for the backend and eslint config for the frontend. Updated `/sync-docs` to run tests + lint as a required Verify step before calling a change done, and added task-sizing/commit/plan-first conventions to `CLAUDE.md`. See `docs/decisions.md` for rationale and what was deliberately skipped.

  **Verified 2026-07-23**: dependencies installed and all tests/linters pass. Fixed Python import/line-length issues, frontend component prop cleanup, TypeScript config (moduleResolution), and added CSS module type declarations.
- **Add TTL caching to reduce Ravelry API calls** — in-memory TTL cache (`app/cache.py`) wrapping the Ravelry client's search/detail calls, with different TTLs per endpoint (10 min for name search, 24h for yarn detail, 30 min for attribute/pattern search).
- **Add designer favorites count to pattern cards** — surfaced `favorites_count` on pattern results.
- **Update settings and dependencies**
- **Add `GET /api/yarns/{yarn_id}` endpoint** — expose full yarn detail lookup.
- **Add production React + TypeScript frontend** — three-screen flow: `YarnSearchScreen`, `YarnConfirmScreen`, `PatternResultsScreen`, built with Vite.
- **Improve logging for pattern search debugging**
- **Add optional pattern search filter** — `pattern_query` param on the patterns-for-yarn endpoint.
- **Add needle size to yarn attribute query** — matching now considers min needle size in mm, where available.
- **Initial knitting app implementation** — FastAPI backend, Pydantic models mirroring Ravelry's API, `ExactAttributeMatcher` behind a `YarnMatcher` interface, basic HTML/JS UI for testing the data flow.
