# Gains Tracker — Design Spec

**Date:** 2026-06-09
**Status:** Approved design, pending spec review

## 1. Purpose

A small personal PWA that helps the owner **gain weight and muscle** through home
calisthenics + badminton. It is deliberately _not_ a full fitness platform. Its job
is to answer one question every day:

> **"Am I gaining, and what do I do today?"**

Every feature exists to serve that question or to keep the owner motivated.

### Goal context (why this shape)

Weight/muscle gain depends, in order, on: (1) a calorie surplus, (2) progressive
overload, (3) recovery. The app cannot eat or train for the owner — it is a
**feedback loop**. The single highest-value loop is the weekly bodyweight trend:
_if weight isn't trending up, eat more._ Badminton burns calories and therefore acts
as a "tax" against the surplus, so the app surfaces that explicitly.

Detailed meal/calorie logging is intentionally **out of scope** (too tedious to
sustain). The app infers "eat more / on track" from the bodyweight trend instead.

## 2. Non-goals (explicit YAGNI)

- No per-meal calorie/macro logging.
- No social features, sharing, or multi-user accounts.
- No fancy analytics beyond a weight chart + per-exercise history.
- No native app — PWA only.

## 3. Users & access

- **Single user** (the owner).
- **Single-password auth**: one password stored as an env secret. A correct password
  sets a signed HTTP-only cookie; Next.js middleware guards all app routes and API
  routes. No registration, no email.

## 4. Tech stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** for styling, mobile-first
- **Neon Postgres** (serverless) + **Drizzle ORM** (Neon serverless driver)
- **PWA**: web manifest + service worker for "Add to Home Screen" and basic offline
  shell. (Implementation detail: `next-pwa` or a hand-rolled SW — decided at plan time.)
- **Deploy:** Vercel

## 5. Screens (5, mobile-first)

### 5.1 Home / Today (the money screen)

- **Verdict card** — derived from bodyweight trend (see §7.2):
  - "📈 On track — keep eating" (gaining at a healthy rate)
  - "⚠️ Flat/down — eat more" (not gaining over the window)
  - "Log your weight to see your trend" (insufficient data)
  - Also shows **progress toward target weight** (current → target).
- **Weekly streak** — consecutive weeks the workout goal was met (see §7.3).
- **Three primary actions**: Log Workout · Log Weight · Log Badminton.

### 5.2 Log Workout

- Pick an exercise from the seeded ladders.
- Enter sets: reps + optional `added_weight_kg` (for weighted calisthenics, e.g. a
  loaded backpack or dip belt).
- Shows **"last time: 3×10"** for that exercise so the owner can beat it.
- On save: if the rep target is met, show a **progression nudge** (see §7.1).

### 5.3 Log Weight

- Single number entry (kg), optional note.
- Encouraged as a (near-)daily habit since it powers the verdict.

### 5.4 Log Badminton

- Duration (minutes) + intensity (low / med / high).
- Shows a **calorie-tax nudge**: rough estimate of calories burned →
  "eat ~X extra today to stay in surplus." Estimate is intentionally rough.

### 5.5 Progress

- Bodyweight chart with a rolling-average trend line + target line.
- Per-exercise history: best reps / current ladder level over time.

## 6. Data model (Neon / Drizzle)

```
settings            (single row)
  id                pk (fixed, e.g. 1)
  target_weight_kg  numeric
  current_weight_kg numeric        -- seeded starting weight; latest log is source of truth thereafter
  height_cm         numeric, nullable
  weekly_workout_goal int default 3
  surplus_pref      text, nullable -- e.g. 'lean' | 'standard' (informational)

exercises           (seeded; editable later)
  id                pk
  name              text
  category          text           -- 'push' | 'pull' | 'legs' | 'core'
  ladder_group      text           -- e.g. 'horizontal_push'
  level             int            -- order within the ladder (1 = easiest)
  rep_target_sets   int default 3  -- per-exercise progression threshold
  rep_target_reps   int default 12

workouts
  id                pk
  date              date
  note              text, nullable

workout_sets
  id                pk
  workout_id        fk -> workouts
  exercise_id       fk -> exercises
  set_index         int
  reps              int
  added_weight_kg   numeric, nullable

bodyweight_logs
  id                pk
  date              date
  weight_kg         numeric
  note              text, nullable

badminton_sessions
  id                pk
  date              date
  duration_min      int
  intensity         text           -- 'low' | 'med' | 'high'
```

### Seeded ladders (starting set)

Standard calisthenics progressions across push/pull/legs/core. Example
`horizontal_push` ladder:
knee push-up (1) → push-up (2) → diamond push-up (3) → archer push-up (4) →
one-arm push-up (5).
Comparable ladders seeded for: vertical/horizontal pull (rows → pull-ups →
archer → one-arm), legs (squat → split squat → pistol progressions), core
(plank → leg raises → hanging variations). Exact seed list finalized at plan time.

## 7. The two "brains"

### 7.1 Progression nudge

- Each exercise has a target (`rep_target_sets` × `rep_target_reps`, default 3×12).
- When a logged workout meets that target for an exercise, the app suggests the next
  `level` in the same `ladder_group`.
- Example: hit 3×12 push-ups → "Try diamond push-ups next."
- Nudge is a suggestion only; the owner chooses what to log next time.

### 7.2 Gaining verdict

- Compute a rolling 7-day average of `bodyweight_logs`.
- Look at the slope over a ~2–3 week window.
- Healthy bulk rate ≈ **+0.25–0.5 kg/week**.
  - Trending up within/above this range → "on track — keep eating."
  - Flat or down → "eat more."
  - Fewer than N data points in window → "keep logging."
- Also display absolute progress: current weight → target weight.

### 7.3 Weekly streak

- A **week** counts as "hit" when the number of logged `workouts` in that week ≥
  `settings.weekly_workout_goal` (default 3).
- Streak = number of consecutive completed weeks that were hit, up to the current week.
- Badminton sessions do **not** count toward the workout goal (they're cardio/skill,
  not the strength training the goal targets) — but this is revisitable.

### 7.4 Badminton calorie tax

- Rough estimate: `intensity_factor × duration_min` → approx kcal
  (e.g. low ≈ 5, med ≈ 7, high ≈ 9 kcal/min — tuned at plan time).
- Surfaced as a nudge ("you burned ~X today, eat extra"), never as a hard number to
  optimize.

## 8. Architecture & boundaries

- **Data layer**: Drizzle schema + a thin repository module per table (query/insert).
- **Domain logic** (`lib/`): three pure, independently testable functions —
  `computeGainingVerdict(logs, settings)`, `computeProgressionNudge(sets, exercise)`,
  `computeWeeklyStreak(workouts, goal)`. Pure functions (no DB) so they're easy to
  unit test.
- **API routes** (`app/api/...`): thin handlers that call repositories + domain logic.
- **UI** (`app/...`): server components fetch data; client components for forms.
- **Auth**: middleware checks the signed cookie before any app/API route.

This keeps the "brains" isolated from storage and UI: each can be understood, tested,
and changed without touching the others.

## 9. Error handling

- Form inputs validated client- and server-side (positive reps, sane weight range).
- Domain functions handle the "not enough data" case explicitly (verdict returns a
  distinct "insufficient data" state rather than guessing).
- API errors surface as friendly inline messages; no silent failures.

## 10. Testing

- Unit tests for the three pure domain functions (the highest-value, trickiest logic).
- Light integration test for auth middleware (rejects without cookie, accepts with).
- Manual/PWA smoke test on a phone before relying on it.

## 11. Open items deferred to implementation plan

- Final seeded exercise list + per-exercise rep targets.
- Exact PWA service-worker approach.
- Calorie-tax intensity factors.
- Chart library choice for the Progress screen.
