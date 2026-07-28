# To Do

Concrete, near-term, actionable items. Bigger open questions and direction live in `roadmap.md` — once something here is done, note it in `changelog.md`.

**When completing a task: move it from "To Do" to "Done" (not just checking it off), update `changelog.md`, and commit.**

## To Do

- Implement frontend filtering on various attributes for patterns - for example filter where paid/free, sort by most popular designer, etc
- [ ] Deploy app
- [ ] Figure out a smart way to match not 100% fiber yarns
- [ ] Filter by gauge and needle size (backend support exists implicitly via matching; needs UI + API surface)
- Add analytics to track users 
- [ ] Research monetization approaches
- [ ] Expand product spec to guide UI beyond the current minimal testing screens

## Done

- Add loading splash screen during app startup to indicate the app is responding (not frozen during cold starts on Render)
- implement pre-commit hook which includes linting and running uv lock and make sure that it works then push
- Add parameter sort=popularity to both yarn search and pattern search 
- Add filtering based on category filtered like this 
    - example pc=clothing
    - start with just these
        - clothing
        - accessories
        - Home
        - Medical
        - Pet 
        - Components 
- Add patterns for the exact source yarn (not just similar yarns) — tag each result as exact vs. similar match, exact-match group ranked first (see `spec.md` "Pattern match types")
- Decide on to-do/roadmap/feedback process for building in public
