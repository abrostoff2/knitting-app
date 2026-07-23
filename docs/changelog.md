# Changelog

Newest first. Reconstructed from git history at the time this file was created (2026-07-23); add new entries as they happen rather than backfilling from git going forward.

- **2026-07-23 — Add sort parameter to yarn and pattern search.** Backend now supports optional `sort` parameter on both `search_yarns()` and `search_patterns()` methods in `RavelryClient`, passed through to Ravelry API. Enables frontend to request popularity sorting (e.g., `sort=popularity`). All 11 tests pass.
- **2026-07-23 — Add lazy-fetching of similar yarns in pagination (Step 2).** Backend now fetches similar yarns in batches of 10 instead of all upfront. Added `page` parameter to `/api/yarns/{yarn_id}/patterns` endpoint and pagination metadata to response (`current_page`, `total_pages`, `has_more`). Frontend now lazy-loads next batch of similar yarns when user paginate past the current batch. All 11 tests pass; frontend lint/tsc pass.
- **2026-07-23 — Add pagination to pattern results (Step 1).** Frontend now shows 20 patterns per page with Previous/Next buttons in `PatternResultsScreen`. Page resets when filter changes. All 11 tests pass; frontend lint/tsc pass. Step 2 (lazy-fetch additional similar yarns when pagination reaches the end) pending.
- **2026-07-23 — Match on full fiber set, not just first fiber (Cycle 1).** Changed `ExactAttributeMatcher` to query with all fibers joined via `+` (e.g., `fiber-content=silk+cotton`) instead of just the first. Combined with `fiberc` (fiber count), this constrains results to yarns with exactly that fiber composition. Ravelry's search API has no percentage filter, so percentage-based tolerance will be checked client-side via `is_similar_enough()` in Cycle 2. Updated matching logic docs and test to reflect new behavior.
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
