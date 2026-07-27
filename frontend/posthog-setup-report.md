# PostHog post-wizard report

The wizard has completed a full PostHog integration for the Yarn Pattern Matcher frontend. `posthog-js` and `@posthog/react` were installed, PostHog was initialized in `src/main.tsx` behind environment variable guards (silently disabled in production when unconfigured, loud warning in dev), and the app was wrapped with `PostHogProvider`. Twelve custom events were added across four components covering the complete user journey: searching for yarn, confirming a yarn, filtering and sorting patterns, paginating results, and clicking through to Ravelry. Dead code (`PATTERN_CATEGORIES` in `PatternResultsScreen.tsx`) was removed as part of the lint pass.

| Event name | Description | File |
|---|---|---|
| `yarn_searched` | User submits a yarn search query from the search screen | `src/components/YarnSearchScreen.tsx` |
| `yarn_search_no_results` | Yarn search returns zero results for the given query | `src/components/YarnSearchScreen.tsx` |
| `yarn_search_failed` | Yarn search API call fails with a network or server error | `src/components/YarnSearchScreen.tsx` |
| `yarn_selected` | User confirms a specific yarn from the search results list | `src/App.tsx` |
| `pattern_filter_applied` | User submits a pattern text filter to narrow pattern results | `src/components/PatternResultsScreen.tsx` |
| `pattern_filter_cleared` | User clears the active pattern text filter to show all patterns | `src/components/PatternResultsScreen.tsx` |
| `pattern_source_toggled` | User switches between exact-match and similar-yarn patterns | `src/components/PatternResultsScreen.tsx` |
| `pattern_clicked` | User clicks a pattern card to open it on Ravelry | `src/components/PatternResultsScreen.tsx` |
| `sort_changed` | User changes the pattern sort order | `src/components/PatternResultsScreen.tsx` |
| `patterns_paginated` | User navigates to the next or previous page of pattern results | `src/components/PatternResultsScreen.tsx` |
| `category_filter_applied` | User applies a category filter selection from the filter panel | `src/components/FilterPanel.tsx` |
| `category_filter_cleared` | User clears all selected category filters at once | `src/components/FilterPanel.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/530070/dashboard/1910048)
- [Yarn search-to-confirm funnel (wizard)](https://us.posthog.com/project/530070/insights/r9ILDe02)
- [Yarn searches over time (wizard)](https://us.posthog.com/project/530070/insights/CCiojyBO)
- [Pattern clicks by type (wizard)](https://us.posthog.com/project/530070/insights/nvxvLMW3)
- [Pattern source preference (wizard)](https://us.posthog.com/project/530070/insights/5mhZkqBt)
- [Category filters applied (wizard)](https://us.posthog.com/project/530070/insights/AlRvp2WD)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
