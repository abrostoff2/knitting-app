# Knitting App

Given a yarn, find patterns that will work with it. Backend: FastAPI + Pydantic + `uv`. Frontend: React + TypeScript + Vite. Ravelry is the only external data source.

## Running locally

- Backend: `uv run uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm run dev`

## Tests & linting

- Backend tests: `uv run pytest`
- Backend lint: `uv run ruff check .`
- Frontend lint: `cd frontend && npm run lint`
- Frontend type-check: `cd frontend && npx tsc --noEmit`

`matching.py` and `service.py` carry the actual logic (attribute matching, similar-yarn ranking, pattern dedup/sort) so they're the highest-value places to add tests when you change something there. `/sync-docs` (below) runs all four of these automatically before calling a code change done.

## Docs

Project context — what the app does, why, decisions, roadmap — lives in `docs/`, referenced from `CLAUDE.md`:

- `docs/spec.md` — what the app does, user flow, screens, API surface, matching logic
- `docs/decisions.md` — why things are built the way they are
- `docs/roadmap.md` — where this is headed
- `docs/todo.md` — concrete next steps
- `docs/changelog.md` — what's shipped, newest first
- `docs/feedback.md` — dated feedback log

## Keeping code in sync with docs

When you edit something substantive in `docs/` (e.g. change the user flow in `spec.md`), run `/sync-docs` in a Claude Code session. It diffs the changed file against the last commit and implements only that delta in code — not a full reimplementation — then logs the change to `docs/changelog.md`.

Pass a filename to scope it, e.g. `/sync-docs spec.md`, or run it with no argument to check `CLAUDE.md` and everything in `docs/`.

`todo.md`, `roadmap.md`, and `feedback.md` are exempt — edits there are noted but never auto-implemented, since they describe future or logged work, not current behavior.

### Drafting an idea you're not ready to build

If you want to jot a not-ready idea directly into a current-behavior doc (like `spec.md`) without triggering implementation, wrap it in draft markers:

```
<!-- draft:start -->
## Some idea I'm not ready to build yet
...
<!-- draft:end -->
```

`/sync-docs` skips anything between these markers entirely — no implementation, no changelog entry, just a one-line note that a draft was skipped. Remove the markers once you're ready to build it, then run `/sync-docs` again to pick it up normally.
