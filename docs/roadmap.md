# Roadmap

Direction and open questions, roughly in order of when they matter. Not commitments — revisit and reorder as things get learned. When something here gets decided, log the "why" in `decisions.md` and move the concrete step to `todo.md`.

## Near-term

- **Deploy the app** so it's usable outside local dev.
- **Filter by gauge and needle size** in the UI — currently these are used implicitly in matching but not exposed as user-facing filters.
- **Decide how to handle to-dos / building in public** — roadmap, feature requests, and public visibility into progress. This file + `todo.md` are the first pass at that; revisit whether a public-facing version is worth maintaining separately.

## Matching quality

- Move `ExactAttributeMatcher` toward fuzzier matching — adjacent fiber types, adjacent weights, not just exact string matches.
- Handle multi-fiber-content yarns properly (currently only the first fiber is considered).
- Because matching is already isolated behind `YarnMatcher`, this should be additive — new matcher implementations, not a rewrite of routes/client code.

## Product

- Create a fuller product spec to guide UI decisions beyond the current bare-bones testing UI (`spec.md` is the start of this).
- Research monetization options.

## Explicitly not planned yet

- User accounts / auth.
- Saving/favoriting yarns or patterns across sessions.
