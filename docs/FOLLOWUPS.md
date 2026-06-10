# Follow-ups

Non-blocking items from the final code review (2026-06-10). The app is fully
functional without these; they're latent traps worth addressing if/when the
relevant feature is touched.

## Fixed in the MVP

- ✅ **UTC date drift** — logs and "today" now use the owner's timezone
  (`src/lib/date.ts`, `APP_TIMEZONE = "Asia/Ho_Chi_Minh"`). Morning weigh-ins
  record on the correct local day. Also makes the verdict window midnight-aligned.
- ✅ **Ladder gap** — `getNextLadderExercise` now selects the next level _above_
  the current one (`gt` + order/limit), so deleting a mid-ladder exercise no
  longer dead-ends progression.

## Open (deferred)

1. **Settings partial-update wipes unused columns.** The settings form sends only
   `targetWeightKg`, `currentWeightKg`, `weeklyWorkoutGoal`; the PUT handler
   defaults the unsent `heightCm` / `surplusPref` to `null`, so saving overwrites
   them. Harmless today (those fields aren't surfaced in the UI). Fix when/if you
   add them: preserve existing values when the field is absent from the request.
   Files: `src/app/settings/page.tsx`, `src/app/api/settings/route.ts`.
2. **No server-side `date` validation.** Weight/badminton/workout routes validate
   numbers/enums but pass `date` straight to the DB. A malformed date would surface
   as a DB error instead of a clean 400. Single trusted user → low priority.
3. **Re-seed uses delete+insert.** `src/db/seed.mts` deletes all exercises then
   re-inserts. The FK from `workout_sets` (ON DELETE no action) means a re-seed
   after logging workouts will be _rejected_ by the DB (safe), but an
   upsert-by-`(ladder_group, level)` would remove the footgun entirely.
4. **Auth matcher uses prefix lookaheads.** `src/proxy.ts` excludes `login`,
   `icons`, `sw.js` as unanchored prefixes (e.g. `/loginX` would also be excluded).
   No real route exploits this; anchoring the patterns would tighten precision.
