# To Do

Concrete, near-term, actionable items. Bigger open questions and direction live in `roadmap.md` — once something here is done, note it in `changelog.md`.

**When completing a task: move it from "To Do" to "Done" (not just checking it off), update `changelog.md`, and commit.**

## To Do

- Research monetization approaches
- Testing all the different yarn fibers
- Create reddit app and connect mcp
- Add pricing 
- Add the ability to click on the yarn and then pull up the ravelry page of that yarn
- add a section that allows for similar yarns as well -
- Don't have the startup every single time - only when needed 

## Done

- Find a name for the app and find a url 
- Improve the UI so it's clear that the loading will take some time 
- Add analytics to track users 
- fix Page 2 of 5 (more yarns available)
- Implement the ability to search by pattern category in the home screen. More details about this in spec.md under Filtering By Category header 
- Filter by gauge and needle size (backend support exists implicitly via matching; needs UI + API surface)
- Figure out a smart way to match not 100% fiber yarns
- Deploy app
- Figure out why serachign for "papyrus" comes up with this 
- implement pre-commit hook which includes linting and running uv lock and make sure that it works then push
- Add parameter sort=popularity to both yarn search and pattern search 
- Add filtering based on category filtered like this https://www.ravelry.com/patterns/library/riviera-bag
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

## Later
- Implement frontend filtering on various attributes for patterns - for example filter where paid/free, sort by most popular designer, etc
- have it work also for crocheting 
