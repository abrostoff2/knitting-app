# Current Priorities

**Right now:** January 2026 sprint focus. Updated 2026-07-23.

## Tier 1: Ship to real users (unblock monetization)
The app works locally. To actually learn from users and explore monetization, it needs to be live and discoverable.

1. **Deploy the app** — get it running somewhere people can access it (Vercel for frontend, Railway/Render for backend, or similar)
2. **Set up basic monitoring/error tracking** — you need to know when users hit problems
3. **Create a landing page** with a simple "try it" CTA (can be minimal — link to the deployed app)

Once deployed, you can:
- Share with knitting communities (Reddit, Discord, Ravelry forums) to get real users
- Collect feedback on what patterns/filters they actually want
- Test monetization ideas (early: maybe premium fiber/weight/gauge filters; donation button; etc.)

## Tier 2: Learn from users (feedback → next steps)
Once people are using it, you'll see what breaks and what they ask for.

- Set up a feedback channel (email form on the app, Discord server, or just Twitter/Reddit replies)
- Track requests in `feedback.md` with dates
- Every 1-2 weeks, review feedback and pick the highest-ROI fix/feature

**Examples of high-ROI early user asks:**
- "I searched for [yarn] and got no patterns" → you now know a user wants fuzzy matching
- "Can I filter by needle size?" → gauge/needle filters move from Tier 3 to Tier 2
- "Is there a phone app?" → now you know if web-only is a blocker

## Tier 3: Improve matching (when users tell you to)
- Fuzzy fiber/weight matching
- Multi-fiber support
- Gauge/needle filters in UI

**Only do this if users are asking for it.** Right now, exact matching is good enough to prove the idea.

## Tier 4: Do not do
- Redesign the UI (it's intentionally minimal for testing)
- Add user accounts/auth
- Refactor for "code quality"
- Monetize before you have users
