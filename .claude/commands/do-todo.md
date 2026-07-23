---
description: Pick a todo item, do the work, verify it passes tests/linters, and mark it complete.
argument-hint: [item-name] (optional; e.g., "deploy" or "gauge filters" — if omitted, list todo items and ask which to pick)
---

Pick a concrete todo item from `docs/todo.md`, complete the work, verify it passes all tests/linters, and mark it done.

## Steps

1. **Identify the item.** If `$ARGUMENTS` names a specific todo item (e.g., "deploy" matches "[ ] Deploy app"), use that. Otherwise, list all unchecked items in `docs/todo.md` and ask the user which one to pick.

2. **Understand the scope.** Read the full item text and check `docs/priorities.md`, `docs/spec.md`, `docs/roadmap.md`, and `docs/decisions.md` to understand:
   - What does "done" look like for this item?
   - What code needs to change?
   - Are there design or user-flow implications?
   - Is this Tier 1 (ship to users) or later? If it's Tier 3+ and the user hasn't explicitly asked for it, confirm first before proceeding.

3. **Plan before implementing.** State in 2-3 sentences:
   - What code/files you're about to change and why.
   - Whether you'll need to add tests.
   - Whether this will require a database migration, config change, or deployment step.
   
   This is a cheap checkpoint — stop here and ask if the plan seems wrong.

4. **Do the work.** Implement the minimal changes needed to complete the item. Follow the project's conventions:
   - No refactoring or perfectionism — "good enough to ship" is the bar.
   - Don't add features beyond the stated scope.
   - If the item is about matching, hide the algorithm behind `YarnMatcher`.
   - If it's about the UI, remember the frontend is intentionally minimal — no design pass.
   - Prefer editing existing files to creating new ones.

5. **Verify.** Before marking anything done, run:
   - Backend: `uv run pytest` and `uv run ruff check .`
   - Frontend (if changed): `cd frontend && npm run lint` and `npx tsc --noEmit`
   
   If any check fails, fix it. Do not mark the item complete with known-broken checks.

6. **Update docs.** 
   - Mark the item done in `docs/todo.md` by changing `[ ]` to `[x]`.
   - Add a dated entry to `docs/changelog.md` describing what shipped and why.

7. **Commit.** Create a single commit summarizing the work and verification:
   ```
   [one-line summary of what shipped]
   
   Details of what changed and why.
   
   Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
   ```

8. **Report.** Tell the user:
   - What's now done.
   - Any edge cases or limitations that came up.
   - What's unblocked for next (e.g., "Deploy is done, now you can share the link in knitting communities").

## Notes

- This is for shipping small, concrete items — not for open-ended roadmap questions.
- If the item is vague (e.g., "improve matching quality"), ask the user to pick a more specific sub-item.
- If the item will take more than an hour or needs user input (e.g., "decide on monetization"), ask first rather than spending time on research.
- Your goal is speed and iteration, not perfect code. Embrace the "build and learn" mindset.
