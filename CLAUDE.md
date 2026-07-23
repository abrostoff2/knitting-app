# Knitting App

Given a yarn, find patterns that will work with it. Backend: FastAPI + Pydantic + `uv`. Frontend: React + TypeScript + Vite. Ravelry is the only external data source.

Full context lives in `docs/` — read the relevant file before making non-trivial changes:
- @docs/spec.md — what the app does, the user flow, API surface, matching logic, domain reference (fiber/weight taxonomy)
- @docs/decisions.md — why things are built the way they are (read before re-architecting anything)
- @docs/roadmap.md — where this is headed
- @docs/todo.md — concrete next steps
- @docs/changelog.md — what's shipped, newest first
- @docs/feedback.md — dated feedback log

## Commands

- Backend: `uv run uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm run dev`
- Add a Python dependency: `uv add <package>`
- Backend tests: `uv run pytest`
- Backend lint: `uv run ruff check .`
- Frontend lint: `cd frontend && npm run lint`
- Frontend type-check: `cd frontend && npx tsc --noEmit`

## Key files

- `app/main.py` — FastAPI routes
- `app/ravelry_client.py` — all Ravelry API calls, each cached with a TTL (`app/cache.py`)
- `app/matching.py` — yarn-similarity matching, abstracted behind `YarnMatcher` so the algorithm can change without touching routes or the client
- `app/models.py` — Pydantic models mirroring Ravelry's response shapes (`extra="allow"` — don't tighten this without checking why)
- `frontend/src/components/` — `YarnSearchScreen` → `YarnConfirmScreen` → `PatternResultsScreen`
- `tests/` — backend tests; `matching.py` and `service.py` are the highest-value targets since they hold the actual logic (everything else mostly passes data through)

## Conventions

- Never let calling code (routes, `RavelryClient`) know *how* matching decides similarity — only `matching.py` should know that.
- The frontend UI is intentionally minimal; it exists to make the backend data flow testable, not to be a finished product (see `docs/spec.md`).
- When a scratch/brainstorming conversation (Cowork, claude.ai) converges on something real, distill it into the relevant `docs/` file — don't let the chat be the record.
- After any change that resolves a `todo.md` item, ships something notable, or reverses a past decision, update `docs/todo.md` / `docs/changelog.md` / `docs/decisions.md` accordingly.
- **Size work as one self-contained unit at a time** — one function, one endpoint, one component, one test file — rather than a sweeping multi-area change. Too small wastes time on coordination overhead; too large lets errors pile up before anyone checks in. If a task naturally spans several independent pieces, do them as separate implement-then-verify cycles.
- **Before implementing anything beyond a one-line change, state the plan** (which files, why) and let it be reviewed before touching files. Cheaper to redirect a plan than to undo an implementation.
- **New logic needs a test in the same change, not a follow-up.** New matching rules, new endpoints, new aggregation behavior — if it's not trivial, it goes in `tests/` alongside the code. A codebase with tests is one an agent (or you, later) can change with confidence instead of guessing whether something broke.
- **Run the relevant verify commands (tests + lint) before calling a change done.** Don't report success with a failing test or lint error, and don't loosen or delete a test just to make it pass — fix the code or, if the test's assumption was genuinely wrong, say so explicitly.
- **Commit in small, explainable steps.** Each commit should be something you could describe in one sentence and be willing to revert on its own. This is what makes it safe to undo a bad change without losing everything since the last good one.
- **When something goes sideways during a task** (files misidentified, a wrong assumption, a plan that needed real correction), fix the immediate problem *and* add a line to this file or the relevant `docs/` file so the same mistake doesn't recur next session. Treat CLAUDE.md as something that earns its keep by being updated, not just written once.
