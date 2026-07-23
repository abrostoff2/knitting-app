---
description: Diff docs against the last commit and implement only the code delta needed to match — not a full reimplementation.
argument-hint: [file] (optional, e.g. spec.md — defaults to CLAUDE.md + every file in docs/)
---

Compare the current working-tree state of the project's docs against what's committed, and implement in code only the delta needed to match. Never regenerate or rewrite code that already matches the docs.

## Steps

1. **Determine scope.** If `$ARGUMENTS` names a specific file (e.g. `spec.md`), scope to `docs/$ARGUMENTS`. Otherwise check `CLAUDE.md` and every file in `docs/`.
2. **Diff each file in scope** against its last committed version: `git diff HEAD -- <file>`, plus `git diff --staged -- <file>` if there are staged changes. If a file has no diff, say so and move on — don't invent work.
3. **Strip draft blocks before reading the diff.** Any content between `<!-- draft:start -->` and `<!-- draft:end -->` markers — whether the markers themselves are new, unchanged, or the content inside them changed — is off-limits. Do not implement it, and do not mention it as pending work; just note in your summary that a draft block was skipped and where. If a marker pair is incomplete (a `draft:start` with no matching `draft:end`, or vice versa), stop and ask rather than guessing the intended scope.
4. **Read the remaining diff.** Distinguish:
   - Wording/formatting-only edits (no code implication) — note them, don't touch code.
   - Substantive changes (user flow, screens, API surface, matching logic, data fields/models, non-goals reversed, etc.) — these need code changes.
5. **If a doc change is ambiguous** (e.g. it removes something without saying what replaces it, or conflicts with existing code in a way that isn't obviously resolved), stop and ask rather than guessing. Don't touch files until this is resolved.
6. **Plan before implementing.** For anything beyond a one-line change, state which files you're about to touch and why, in a sentence or two, before editing. This is a cheap checkpoint — it's much cheaper to redirect here than after files are changed.
7. **Implement exactly the substantive delta.** Find the corresponding code (`app/main.py`, `app/service.py`, `app/matching.py`, `app/models.py`, `frontend/src/components/`, `frontend/src/types.ts`) and change only what the diff requires. Do not refactor or touch surrounding code that already matches the docs. Keep the change scoped to one self-contained unit at a time (one function, one endpoint, one component) rather than a sweeping multi-area edit — if the delta genuinely spans several independent pieces, do them as separate implement-then-verify cycles, not one large batch.
8. **Verify.** Before calling anything done:
   - Backend changes: run `uv run pytest` and `uv run ruff check .`.
   - Frontend changes: run `cd frontend && npm run lint` and `npx tsc --noEmit`.
   - If a test or lint check fails, stop, report which one and why, and fix it before moving on — don't mark the sync complete with a known-broken check, and don't silently loosen or delete a test to make it pass.
   - If the delta should have a test and doesn't (e.g. new matching logic, a new endpoint, a new aggregation rule), add one under `tests/` as part of this step, not as a follow-up.
9. **Log it.** Add a dated entry to `docs/changelog.md` describing what changed in code and which doc/section drove it, plus a note that it passed verification. Don't log draft blocks that were skipped.
10. **Summarize** what changed and why, referencing the specific diff lines that drove each code change, plus a one-line note of any draft blocks skipped and the verification results.

## Notes

- This is for syncing code to *intentional* doc edits (e.g. you just changed the User Flow in `spec.md`) — not a full audit of code against the whole `docs/` tree.
- `docs/feedback.md` is a raw dated log, not a spec — don't treat edits there as something to implement.
- `docs/roadmap.md` and `docs/todo.md` describe future/planned work, not current behavior — don't implement items from them unless the user asks specifically.
- Draft markers (`<!-- draft:start -->` / `<!-- draft:end -->`) let you jot a not-ready-yet idea directly into a current-behavior doc like `spec.md` without triggering implementation. Remove the markers once the idea is ready to build, then run `/sync-docs` again to pick it up normally.
- If a verify command itself fails to run at all (missing dependency, broken environment) rather than failing its checks, say so plainly rather than treating the step as passed or skipping it silently.
