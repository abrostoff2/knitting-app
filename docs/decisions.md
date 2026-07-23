# Decisions

Short log of "why X over Y" — not a design doc, just enough context that a future session (you or Claude) doesn't re-litigate a settled call. Newest first.

## Match on all fibers via `+`-joined `fiber-content`, not just the first fiber

Changed `ExactAttributeMatcher.build_attribute_query` to send all fibers (e.g. `fiber-content=silk+cotton`) joined with `+` instead of just the first. Ravelry's search supports AND semantics: when combined with `fiberc=2`, it constrains results to exactly that 2-fiber set, no more, no less.

Why not percentage-based matching at query time: Ravelry's search API has no percentage filter — percentage data only exists on full yarn details (`YarnDetail`), not on search results (`YarnSearchResult`). Percentage-based tolerance (e.g., ±10% per fiber) has to be checked client-side in `is_similar_enough()` after fetching each candidate's detail — that's Cycle 2. This split keeps the query layer (Ravelry API) doing what it's good at (exact-match filtering) and the client layer doing what it needs to do (detail-based fuzzy matching).

## Adopted tests, linters, and a Verify step; skipped Jira/multi-agent/devcontainer tooling

Reviewed a batch of mid-2026 write-ups on building projects with AI coding agents (Claude Code specifically) to see what applied here. Adopted: a pytest suite (`tests/`) covering the actual logic in `matching.py` and `service.py`, ruff for the backend and eslint for the frontend as automatic guardrails, and a required Verify step in `/sync-docs` (run tests + lint, don't call a change done if either fails) — implementing a lightweight Plan → Implement → Verify loop. Also added conventions to `CLAUDE.md`: size work as one self-contained unit at a time, plan before implementing non-trivial changes, commit in small explainable steps, and update `CLAUDE.md`/docs when something goes sideways rather than only at setup.

Explicitly skipped: Jira ticket generation, multi-agent "Lead/Teammate" setups, and devcontainer sandboxing. These solve coordination problems — multiple people, or multiple agents running in parallel — that don't exist in a solo, one-session-at-a-time project. They're overhead with no payoff here, not an oversight.

Why now rather than from the start: this project had zero tests and no linting until this point, which every source treated as the single biggest risk factor for agent-assisted code — an agent (or a future session) has no way to tell whether a change broke something without them. `matching.py` and `service.py` were prioritized since they hold the only real logic in the app; the rest is mostly data passthrough.

## Matching isolated behind a `YarnMatcher` interface

Matching started as an exact-attribute match (mirroring the original Postman prototype) and is known to need improvement (fuzzy fiber/weight matching, multi-fiber support). Rather than embed that logic in routes or the Ravelry client, it's abstracted behind `YarnMatcher.build_attribute_query()`. Callers only know they get query params back — they don't know or care how similarity is decided. This means the matching algorithm can be swapped later without touching `main.py` or `ravelry_client.py`.

## Exact-attribute matching first, fuzzy matching later

Chose to ship an exact match (weight + first fiber + fiber count + needle size) rather than delay for a smarter algorithm, since the abstraction above makes the upgrade low-cost later. Tradeoff: known gaps (single-fiber-only, no fuzzy matching) are accepted for now — see `spec.md` limitations.

## Cap similar-yarns at top 10 by rating before pattern search

Pattern search runs once per similar yarn. Uncapped, this could mean dozens of API calls per user search. Limiting to the top 10 by rating (with a concurrency cap of 2 concurrent pattern requests) bounds both API load and latency.

## TTL caching added to reduce Ravelry API calls

Ravelry's API has real limits and repeated searches (especially during dev/testing) were hitting it hard. Added a TTL cache (`app/cache.py`) rather than a more complex caching layer, since request patterns are simple (same query → same result within a short window).

## Backend: FastAPI + Pydantic, package-managed with `uv`

Pydantic models mirror Ravelry's response shape directly (`RavelryModel` base with `extra="allow"`), so parsing stays resilient to fields we haven't modeled rather than failing on unexpected data. `uv` chosen for package management over pip/poetry.

## Frontend: React + TypeScript + Vite, minimal UI

The UI's purpose is to make the backend data flow testable, not to be a polished product — hence three plain screens (search, confirm, results) rather than a fuller design pass. React + TS + Vite chosen as a standard, low-friction stack for that purpose.

## Docs live in `docs/` next to the code, not in a separate Obsidian vault

Previously: Obsidian vault + repo + chat history as three separate, drifting sources of truth. Moved planning docs into the repo (`docs/`) so Claude Code sees them automatically alongside the code, and so docs are git-versioned with the same history/rollback as code. Obsidian can still point at `docs/` as its vault for graph view/backlinks — no duplication.
