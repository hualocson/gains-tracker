# Gains Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user PWA that logs home calisthenics + badminton, nudges progression, and tells the owner each day whether they're gaining weight so they keep eating in a surplus.

**Architecture:** Next.js App Router front-and-back. Three *pure* domain functions (gaining verdict, progression nudge, weekly streak) live in `lib/domain/` with no DB dependency so they're unit-tested in isolation. Thin Drizzle repositories wrap Neon Postgres; thin API routes call repositories + domain logic; server components fetch and render. A single signed cookie set from one password (in `middleware.ts`) guards everything.

**Tech Stack:** Next.js 15 (App Router) + TypeScript, Tailwind CSS, Neon Postgres, Drizzle ORM (`drizzle-orm` + `@neondatabase/serverless`), Vitest for unit tests, deployed on Vercel. PWA via `next-pwa`.

**Key conventions decided here (so later tasks stay consistent):**
- Weights/heights stored as `doublePrecision` (come back as JS `number`, no string parsing). Reps/durations/levels as `integer`.
- Domain functions take an explicit `today: Date` / data arrays — they never read the clock or the DB, so tests are deterministic.
- Verdict states: `"insufficient_data" | "eat_more" | "on_track" | "too_fast"`.
- Money types passed around as plain `number` (kg, kcal, reps).

---

## File Structure

```
gains-tracker/
  drizzle.config.ts                 # Drizzle Kit config (migrations)
  vitest.config.ts                  # Vitest config
  .env.local                        # DATABASE_URL, APP_PASSWORD, AUTH_SECRET (gitignored)
  src/
    db/
      schema.ts                     # Drizzle table definitions (§Task 3)
      client.ts                     # Neon + Drizzle client singleton
      seed.ts                       # Seed exercises ladders (§Task 4)
    lib/
      domain/
        verdict.ts                  # computeGainingVerdict (§Task 5)
        progression.ts              # computeProgressionNudge (§Task 6)
        streak.ts                   # computeWeeklyStreak (§Task 7)
        badminton.ts                # estimateBadmintonKcal (§Task 8)
      auth.ts                       # cookie sign/verify helpers (§Task 9)
      repos.ts                      # thin DB query/insert functions (§Task 10)
    middleware.ts                   # password-gate all routes (§Task 9)
    app/
      login/page.tsx                # password form (§Task 9)
      api/auth/route.ts             # POST password -> set cookie (§Task 9)
      api/workouts/route.ts         # POST log workout (§Task 11)
      api/weight/route.ts           # POST log weight (§Task 11)
      api/badminton/route.ts        # POST log badminton (§Task 11)
      api/settings/route.ts         # GET/PUT settings (§Task 11)
      page.tsx                      # Home / Today (§Task 12)
      workout/page.tsx              # Log Workout (§Task 13)
      weight/page.tsx               # Log Weight (§Task 13)
      badminton/page.tsx            # Log Badminton (§Task 13)
      progress/page.tsx             # Progress charts (§Task 14)
      layout.tsx                    # shell + PWA meta
    components/                     # shared UI (buttons, cards, nav)
  tests/
    domain/
      verdict.test.ts
      progression.test.ts
      streak.test.ts
      badminton.test.ts
  public/
    manifest.webmanifest            # PWA manifest (§Task 15)
    icons/                          # PWA icons
```

---

## Task 1: Scaffold Next.js + Tailwind project

**Files:**
- Create: whole project tree via CLI
- Modify: `package.json`, `src/app/page.tsx`

- [ ] **Step 1: Create the Next.js app** (run from `gains-tracker/`'s parent, then keep the existing `docs/` folder)

```bash
cd /Users/son/workspace/personal
# Scaffold into a temp dir then move files in, to preserve existing docs/ + .git
npx create-next-app@latest gains-tracker-tmp \
  --typescript --tailwind --app --src-dir --eslint \
  --import-alias "@/*" --no-turbopack --use-npm
# Move generated files into the existing project (which already has docs/ + git)
rsync -a --exclude '.git' gains-tracker-tmp/ gains-tracker/
rm -rf gains-tracker-tmp
cd gains-tracker
```

- [ ] **Step 2: Verify it boots**

Run: `cd /Users/son/workspace/personal/gains-tracker && npm run dev`
Expected: dev server starts on `http://localhost:3000` with no errors. Stop it with Ctrl-C.

- [ ] **Step 3: Replace the default home page with a placeholder**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Gains Tracker</h1>
      <p className="text-gray-500">Coming together…</p>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Tailwind app"
```

---

## Task 2: Add Vitest, Drizzle, Neon deps + test config

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `drizzle.config.ts`, `.env.local`, `.gitignore` (append)

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/son/workspace/personal/gains-tracker
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit vitest @types/node
```

- [ ] **Step 2: Add test + db scripts to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:seed": "tsx src/db/seed.ts"
```

Then install the seed runner: `npm install -D tsx`

- [ ] **Step 3: Create `vitest.config.ts`** (the `resolve.alias` is required so tests can import `@/...`)

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

- [ ] **Step 4: Create `drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 5: Create `.env.local`** (fill in real values — Neon connection string + chosen password)

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
APP_PASSWORD="change-me-to-your-password"
AUTH_SECRET="a-long-random-string-for-signing-cookies"
```

- [ ] **Step 6: Ensure secrets are gitignored**

Append to `.gitignore` (create_next_app already ignores `.env*`, but confirm the line `*.env*` or `.env*` is present; if not, add):

```
.env*
```

- [ ] **Step 7: Verify Vitest runs (no tests yet)**

Run: `npm test`
Expected: Vitest reports "No test files found" (exit 0) — config is valid.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: add vitest, drizzle, neon tooling and config"
```

---

## Task 3: Define the Drizzle schema

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`

- [ ] **Step 1: Write `src/db/schema.ts`**

```ts
import {
  pgTable,
  serial,
  integer,
  text,
  date,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  targetWeightKg: doublePrecision("target_weight_kg").notNull(),
  currentWeightKg: doublePrecision("current_weight_kg").notNull(),
  heightCm: doublePrecision("height_cm"),
  weeklyWorkoutGoal: integer("weekly_workout_goal").notNull().default(3),
  surplusPref: text("surplus_pref"),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'push' | 'pull' | 'legs' | 'core'
  ladderGroup: text("ladder_group").notNull(),
  level: integer("level").notNull(),
  repTargetSets: integer("rep_target_sets").notNull().default(3),
  repTargetReps: integer("rep_target_reps").notNull().default(12),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  note: text("note"),
});

export const workoutSets = pgTable("workout_sets", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  setIndex: integer("set_index").notNull(),
  reps: integer("reps").notNull(),
  addedWeightKg: doublePrecision("added_weight_kg"),
});

export const bodyweightLogs = pgTable("bodyweight_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  weightKg: doublePrecision("weight_kg").notNull(),
  note: text("note"),
});

export const badmintonSessions = pgTable("badminton_sessions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  durationMin: integer("duration_min").notNull(),
  intensity: text("intensity").notNull(), // 'low' | 'med' | 'high'
});
```

- [ ] **Step 2: Write `src/db/client.ts`**

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 3: Generate and run the migration**

```bash
npm run db:generate   # writes SQL into ./drizzle
npm run db:migrate    # applies it to Neon
```

Expected: migration succeeds; tables exist in Neon (verify in Neon console or `\dt`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add drizzle schema and neon client"
```

---

## Task 4: Seed the exercise ladders

**Files:**
- Create: `src/db/seed.ts`

- [ ] **Step 1: Write `src/db/seed.ts`** with the starting ladders

```ts
import "dotenv/config";
import { db } from "./client";
import { exercises } from "./schema";

// ladder_group -> ordered list of variation names (level = index + 1)
const LADDERS: { group: string; category: string; names: string[] }[] = [
  { group: "horizontal_push", category: "push", names: ["Knee Push-up", "Push-up", "Diamond Push-up", "Archer Push-up", "One-arm Push-up"] },
  { group: "vertical_push", category: "push", names: ["Pike Push-up", "Elevated Pike Push-up", "Wall Handstand Push-up"] },
  { group: "horizontal_pull", category: "pull", names: ["Incline Row", "Inverted Row", "Wide Inverted Row"] },
  { group: "vertical_pull", category: "pull", names: ["Negative Pull-up", "Pull-up", "Archer Pull-up", "One-arm Pull-up Progression"] },
  { group: "squat", category: "legs", names: ["Bodyweight Squat", "Split Squat", "Bulgarian Split Squat", "Assisted Pistol Squat", "Pistol Squat"] },
  { group: "core", category: "core", names: ["Plank", "Leg Raises", "Hanging Knee Raise", "Hanging Leg Raise"] },
];

async function main() {
  const rows = LADDERS.flatMap((l) =>
    l.names.map((name, i) => ({
      name,
      category: l.category,
      ladderGroup: l.group,
      level: i + 1,
      repTargetSets: 3,
      repTargetReps: 12,
    })),
  );
  await db.insert(exercises).values(rows);
  console.log(`Seeded ${rows.length} exercises`);
}

main().then(() => process.exit(0));
```

- [ ] **Step 2: Install dotenv (for the seed script env load)**

```bash
npm install dotenv
```

- [ ] **Step 3: Run the seed**

Run: `npm run db:seed`
Expected: prints "Seeded 24 exercises" (5+3+3+4+5+4 = 24). Re-running duplicates rows — only run once.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: seed calisthenics exercise ladders"
```

---

## Task 5: Domain — gaining verdict (TDD)

**Files:**
- Create: `src/lib/domain/verdict.ts`, `tests/domain/verdict.test.ts`

The verdict fits a least-squares line to bodyweight over a trailing window and converts the slope to kg/week.

- [ ] **Step 1: Write the failing test** `tests/domain/verdict.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { computeGainingVerdict } from "@/lib/domain/verdict";

const d = (s: string) => new Date(s + "T00:00:00Z");

describe("computeGainingVerdict", () => {
  it("returns insufficient_data with too few logs", () => {
    const r = computeGainingVerdict(
      [{ date: d("2026-06-01"), weightKg: 70 }],
      d("2026-06-09"),
    );
    expect(r.state).toBe("insufficient_data");
  });

  it("returns on_track when gaining ~0.4 kg/week", () => {
    // +0.4kg/week over 21 days, sampled weekly
    const logs = [
      { date: d("2026-05-19"), weightKg: 70.0 },
      { date: d("2026-05-26"), weightKg: 70.4 },
      { date: d("2026-06-02"), weightKg: 70.8 },
      { date: d("2026-06-09"), weightKg: 71.2 },
    ];
    const r = computeGainingVerdict(logs, d("2026-06-09"));
    expect(r.state).toBe("on_track");
    expect(r.kgPerWeek).toBeGreaterThan(0.3);
    expect(r.kgPerWeek).toBeLessThan(0.5);
  });

  it("returns eat_more when flat", () => {
    const logs = [
      { date: d("2026-05-19"), weightKg: 70.0 },
      { date: d("2026-05-26"), weightKg: 70.0 },
      { date: d("2026-06-02"), weightKg: 69.9 },
      { date: d("2026-06-09"), weightKg: 70.0 },
    ];
    expect(computeGainingVerdict(logs, d("2026-06-09")).state).toBe("eat_more");
  });

  it("returns too_fast above 0.7 kg/week", () => {
    const logs = [
      { date: d("2026-05-19"), weightKg: 70.0 },
      { date: d("2026-05-26"), weightKg: 71.0 },
      { date: d("2026-06-02"), weightKg: 72.0 },
      { date: d("2026-06-09"), weightKg: 73.0 },
    ];
    expect(computeGainingVerdict(logs, d("2026-06-09")).state).toBe("too_fast");
  });

  it("ignores logs older than the 21-day window", () => {
    const logs = [
      { date: d("2026-01-01"), weightKg: 60 }, // far outside window
      { date: d("2026-05-26"), weightKg: 70.0 },
      { date: d("2026-06-02"), weightKg: 70.4 },
      { date: d("2026-06-09"), weightKg: 70.8 },
    ];
    const r = computeGainingVerdict(logs, d("2026-06-09"));
    expect(r.state).toBe("on_track");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- verdict`
Expected: FAIL — `computeGainingVerdict` not found.

- [ ] **Step 3: Write `src/lib/domain/verdict.ts`**

```ts
export type WeightLog = { date: Date; weightKg: number };
export type VerdictState =
  | "insufficient_data"
  | "eat_more"
  | "on_track"
  | "too_fast";

export type Verdict = {
  state: VerdictState;
  kgPerWeek: number | null;
};

const WINDOW_DAYS = 21;
const MIN_LOGS = 3;
const LOWER = 0.2; // kg/week below this -> eat more
const UPPER = 0.7; // kg/week above this -> too fast

const DAY_MS = 86_400_000;

export function computeGainingVerdict(
  logs: WeightLog[],
  today: Date,
): Verdict {
  const cutoff = today.getTime() - WINDOW_DAYS * DAY_MS;
  const recent = logs
    .filter((l) => l.date.getTime() >= cutoff)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (recent.length < MIN_LOGS) return { state: "insufficient_data", kgPerWeek: null };

  // least-squares slope of weight vs day-offset
  const x = recent.map((l) => l.date.getTime() / DAY_MS);
  const y = recent.map((l) => l.weightKg);
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    den += (x[i] - mx) ** 2;
  }
  const slopePerDay = den === 0 ? 0 : num / den;
  const kgPerWeek = slopePerDay * 7;

  let state: VerdictState;
  if (kgPerWeek < LOWER) state = "eat_more";
  else if (kgPerWeek > UPPER) state = "too_fast";
  else state = "on_track";

  return { state, kgPerWeek };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- verdict`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: gaining verdict domain logic"
```

---

## Task 6: Domain — progression nudge (TDD)

**Files:**
- Create: `src/lib/domain/progression.ts`, `tests/domain/progression.test.ts`

- [ ] **Step 1: Write the failing test** `tests/domain/progression.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { computeProgressionNudge } from "@/lib/domain/progression";

const exercise = {
  id: 2,
  name: "Push-up",
  ladderGroup: "horizontal_push",
  level: 2,
  repTargetSets: 3,
  repTargetReps: 12,
};
const nextExercise = {
  id: 3,
  name: "Diamond Push-up",
  ladderGroup: "horizontal_push",
  level: 3,
};

describe("computeProgressionNudge", () => {
  it("nudges up when target met (3 sets of >=12)", () => {
    const sets = [{ reps: 12 }, { reps: 13 }, { reps: 12 }];
    const r = computeProgressionNudge(sets, exercise, nextExercise);
    expect(r).toEqual({
      shouldNudge: true,
      fromName: "Push-up",
      toName: "Diamond Push-up",
    });
  });

  it("does not nudge when too few qualifying sets", () => {
    const sets = [{ reps: 12 }, { reps: 10 }, { reps: 12 }];
    expect(computeProgressionNudge(sets, exercise, nextExercise).shouldNudge).toBe(false);
  });

  it("does not nudge when no next exercise exists (top of ladder)", () => {
    const sets = [{ reps: 20 }, { reps: 20 }, { reps: 20 }];
    expect(computeProgressionNudge(sets, exercise, null).shouldNudge).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- progression`
Expected: FAIL — function not found.

- [ ] **Step 3: Write `src/lib/domain/progression.ts`**

```ts
export type ExerciseTarget = {
  id: number;
  name: string;
  ladderGroup: string;
  level: number;
  repTargetSets: number;
  repTargetReps: number;
};
export type NextExercise = { id: number; name: string } | null;

export type Nudge = {
  shouldNudge: boolean;
  fromName?: string;
  toName?: string;
};

export function computeProgressionNudge(
  sets: { reps: number }[],
  exercise: ExerciseTarget,
  next: NextExercise,
): Nudge {
  if (!next) return { shouldNudge: false };
  const qualifying = sets.filter((s) => s.reps >= exercise.repTargetReps).length;
  if (qualifying >= exercise.repTargetSets) {
    return { shouldNudge: true, fromName: exercise.name, toName: next.name };
  }
  return { shouldNudge: false };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- progression`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: progression nudge domain logic"
```

---

## Task 7: Domain — weekly streak (TDD)

**Files:**
- Create: `src/lib/domain/streak.ts`, `tests/domain/streak.test.ts`

Rule: a week (Mon–Sun) is "hit" when `workoutCount >= goal`. Streak counts consecutive hit weeks ending at the current week. The *current* (in-progress) week does not break the streak if not yet hit — it's skipped, and counting continues into prior completed weeks.

- [ ] **Step 1: Write the failing test** `tests/domain/streak.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { computeWeeklyStreak } from "@/lib/domain/streak";

const d = (s: string) => new Date(s + "T00:00:00Z");

describe("computeWeeklyStreak", () => {
  // 2026-06-09 is a Tuesday. Week = Mon 06-08 .. Sun 06-14.
  it("counts the current week when goal already met", () => {
    const dates = [d("2026-06-08"), d("2026-06-09"), d("2026-06-09")]; // 3 this week
    expect(computeWeeklyStreak(dates, 3, d("2026-06-09"))).toBe(1);
  });

  it("does not break streak when current week not yet met", () => {
    const dates = [
      d("2026-06-08"), // current week: only 1 (goal 3 not met yet)
      // previous week Mon 06-01..Sun 06-07: 3 workouts
      d("2026-06-01"), d("2026-06-03"), d("2026-06-05"),
    ];
    expect(computeWeeklyStreak(dates, 3, d("2026-06-09"))).toBe(1);
  });

  it("counts multiple consecutive completed weeks", () => {
    const dates = [
      // current week: met
      d("2026-06-08"), d("2026-06-09"), d("2026-06-09"),
      // prev week: met
      d("2026-06-01"), d("2026-06-03"), d("2026-06-05"),
      // 2 weeks ago Mon 05-25..Sun 05-31: met
      d("2026-05-25"), d("2026-05-27"), d("2026-05-29"),
    ];
    expect(computeWeeklyStreak(dates, 3, d("2026-06-09"))).toBe(3);
  });

  it("stops at the first completed week that missed the goal", () => {
    const dates = [
      d("2026-06-08"), d("2026-06-09"), d("2026-06-09"), // current met
      d("2026-06-01"), d("2026-06-03"),                   // prev week only 2 -> miss
      d("2026-05-25"), d("2026-05-27"), d("2026-05-29"),  // met but unreachable
    ];
    expect(computeWeeklyStreak(dates, 3, d("2026-06-09"))).toBe(1);
  });

  it("returns 0 when nothing logged", () => {
    expect(computeWeeklyStreak([], 3, d("2026-06-09"))).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- streak`
Expected: FAIL — function not found.

- [ ] **Step 3: Write `src/lib/domain/streak.ts`**

```ts
const DAY_MS = 86_400_000;

// Returns the Monday (UTC, midnight) of the week containing `date`.
function weekStart(date: Date): number {
  const day = date.getUTCDay(); // 0=Sun..6=Sat
  const mondayOffset = (day + 6) % 7; // days since Monday
  const ms = date.getTime() - mondayOffset * DAY_MS;
  const m = new Date(ms);
  return Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), m.getUTCDate());
}

export function computeWeeklyStreak(
  workoutDates: Date[],
  goal: number,
  today: Date,
): number {
  // count workouts per week-start
  const counts = new Map<number, number>();
  for (const dt of workoutDates) {
    const ws = weekStart(dt);
    counts.set(ws, (counts.get(ws) ?? 0) + 1);
  }

  const currentWeek = weekStart(today);
  let streak = 0;
  let week = currentWeek;
  let isCurrent = true;

  // walk backwards week by week
  // stop after a completed (past) week that missed the goal
  // allow many empty past weeks? No — a missed past week breaks it.
  while (true) {
    const count = counts.get(week) ?? 0;
    const hit = count >= goal;
    if (hit) {
      streak += 1;
    } else if (!isCurrent) {
      break; // a completed week that missed -> streak ends
    }
    // move to previous week
    week = week - 7 * DAY_MS;
    isCurrent = false;
    // safety: stop if we've gone far past any logged data
    if (counts.size === 0) break;
    const earliest = Math.min(...counts.keys());
    if (week < earliest) break;
  }

  return streak;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- streak`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: weekly streak domain logic"
```

---

## Task 8: Domain — badminton calorie tax (TDD)

**Files:**
- Create: `src/lib/domain/badminton.ts`, `tests/domain/badminton.test.ts`

- [ ] **Step 1: Write the failing test** `tests/domain/badminton.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { estimateBadmintonKcal } from "@/lib/domain/badminton";

describe("estimateBadmintonKcal", () => {
  it("low intensity ~5 kcal/min", () => {
    expect(estimateBadmintonKcal(60, "low")).toBe(300);
  });
  it("med intensity ~7 kcal/min", () => {
    expect(estimateBadmintonKcal(60, "med")).toBe(420);
  });
  it("high intensity ~9 kcal/min", () => {
    expect(estimateBadmintonKcal(30, "high")).toBe(270);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- badminton`
Expected: FAIL — function not found.

- [ ] **Step 3: Write `src/lib/domain/badminton.ts`**

```ts
export type Intensity = "low" | "med" | "high";

const KCAL_PER_MIN: Record<Intensity, number> = {
  low: 5,
  med: 7,
  high: 9,
};

// Rough estimate only — used to nudge "eat extra today", not for precision.
export function estimateBadmintonKcal(
  durationMin: number,
  intensity: Intensity,
): number {
  return durationMin * KCAL_PER_MIN[intensity];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- badminton`
Expected: PASS (3 tests). Run full suite `npm test` — all domain tests green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: badminton calorie-tax estimate"
```

---

## Task 9: Single-password auth (cookie + middleware + login)

**Files:**
- Create: `src/lib/auth.ts`, `src/middleware.ts`, `src/app/login/page.tsx`, `src/app/api/auth/route.ts`

Approach: login form POSTs password to `/api/auth`. If it equals `APP_PASSWORD`, set a signed, HTTP-only cookie `gt_session` whose value is an HMAC of a fixed payload using `AUTH_SECRET`. Middleware verifies the HMAC on every request except `/login` and `/api/auth` and static assets.

- [ ] **Step 1: Write `src/lib/auth.ts`** (HMAC sign/verify using Web Crypto, edge-compatible)

```ts
const PAYLOAD = "gains-tracker-authed-v1";

async function hmac(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(PAYLOAD),
  );
  // edge-runtime safe hex encoding (no Node Buffer in middleware)
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function makeSessionToken(secret: string): Promise<string> {
  return hmac(secret);
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const expected = await hmac(secret);
  // constant-time-ish compare
  return token.length === expected.length && token === expected;
}

export const SESSION_COOKIE = "gt_session";
```

- [ ] **Step 2: Write `src/app/api/auth/route.ts`**

```ts
import { NextResponse } from "next/server";
import { makeSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const token = await makeSessionToken(process.env.AUTH_SECRET!);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // localhost dev is http
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}
```

- [ ] **Step 3: Write `src/middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token, process.env.AUTH_SECRET!);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // protect everything except login page, auth API, and static assets
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons).*)"],
};
```

- [ ] **Step 4: Write `src/app/login/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push("/");
    else setError(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-xs space-y-4">
        <h1 className="text-xl font-bold">Gains Tracker</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded border p-3"
        />
        {error && <p className="text-sm text-red-600">Wrong password</p>}
        <button className="w-full rounded bg-black p-3 text-white">Enter</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: Write a test for the auth helpers** `tests/auth.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { makeSessionToken, verifySessionToken } from "@/lib/auth";

describe("auth helpers", () => {
  it("verifies a token it just made", async () => {
    const t = await makeSessionToken("secret-a");
    expect(await verifySessionToken(t, "secret-a")).toBe(true);
  });
  it("rejects a token signed with a different secret", async () => {
    const t = await makeSessionToken("secret-a");
    expect(await verifySessionToken(t, "secret-b")).toBe(false);
  });
  it("rejects an undefined token", async () => {
    expect(await verifySessionToken(undefined, "secret-a")).toBe(false);
  });
});
```

Run: `npm test -- auth`
Expected: PASS (3 tests). (Resolves the auth-test requirement in spec §10.)

- [ ] **Step 6: Manually verify the gate**

Run: `npm run dev`. Visit `http://localhost:3000` → should redirect to `/login`. Enter wrong password → "Wrong password". Enter correct `APP_PASSWORD` → redirected to home. Stop server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: single-password auth with signed cookie and middleware"
```

---

## Task 10: Repositories (thin DB access)

**Files:**
- Create: `src/lib/repos.ts`

- [ ] **Step 1: Write `src/lib/repos.ts`**

```ts
import { db } from "@/db/client";
import {
  settings,
  exercises,
  workouts,
  workoutSets,
  bodyweightLogs,
  badmintonSessions,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getSettings() {
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  return rows[0] ?? null;
}

export async function upsertSettings(data: {
  targetWeightKg: number;
  currentWeightKg: number;
  heightCm?: number | null;
  weeklyWorkoutGoal: number;
  surplusPref?: string | null;
}) {
  const existing = await getSettings();
  if (existing) {
    await db.update(settings).set(data).where(eq(settings.id, 1));
  } else {
    await db.insert(settings).values({ id: 1, ...data });
  }
}

export async function getAllExercises() {
  return db.select().from(exercises).orderBy(exercises.ladderGroup, exercises.level);
}

export async function getNextLadderExercise(ladderGroup: string, level: number) {
  const rows = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.ladderGroup, ladderGroup), eq(exercises.level, level + 1)));
  return rows[0] ?? null;
}

export async function getLastSetsForExercise(exerciseId: number) {
  // most recent workout that included this exercise
  const rows = await db
    .select({
      reps: workoutSets.reps,
      addedWeightKg: workoutSets.addedWeightKg,
      date: workouts.date,
      workoutId: workoutSets.workoutId,
    })
    .from(workoutSets)
    .innerJoin(workouts, eq(workoutSets.workoutId, workouts.id))
    .where(eq(workoutSets.exerciseId, exerciseId))
    .orderBy(desc(workouts.date), desc(workoutSets.setIndex));
  if (rows.length === 0) return [];
  const latestWorkoutId = rows[0].workoutId;
  return rows.filter((r) => r.workoutId === latestWorkoutId);
}

export async function createWorkout(
  date: string,
  note: string | null,
  sets: { exerciseId: number; setIndex: number; reps: number; addedWeightKg: number | null }[],
) {
  const [w] = await db.insert(workouts).values({ date, note }).returning();
  if (sets.length) {
    await db.insert(workoutSets).values(sets.map((s) => ({ ...s, workoutId: w.id })));
  }
  return w;
}

export async function getWorkoutDates() {
  const rows = await db.select({ date: workouts.date }).from(workouts);
  return rows.map((r) => new Date(r.date + "T00:00:00Z"));
}

export async function logWeight(date: string, weightKg: number, note: string | null) {
  await db.insert(bodyweightLogs).values({ date, weightKg, note });
}

export async function getWeightLogs() {
  const rows = await db.select().from(bodyweightLogs).orderBy(bodyweightLogs.date);
  return rows.map((r) => ({ date: new Date(r.date + "T00:00:00Z"), weightKg: r.weightKg, note: r.note }));
}

export async function logBadminton(date: string, durationMin: number, intensity: string) {
  await db.insert(badmintonSessions).values({ date, durationMin, intensity });
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no type errors. (If `tsx`/types complain about Drizzle insert shapes, align field names with `schema.ts`.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: data-access repositories"
```

---

## Task 11: API routes (workouts, weight, badminton, settings)

**Files:**
- Create: `src/app/api/workouts/route.ts`, `src/app/api/weight/route.ts`, `src/app/api/badminton/route.ts`, `src/app/api/settings/route.ts`

- [ ] **Step 1: Write `src/app/api/weight/route.ts`**

```ts
import { NextResponse } from "next/server";
import { logWeight } from "@/lib/repos";

export async function POST(req: Request) {
  const { date, weightKg, note } = await req.json();
  if (typeof weightKg !== "number" || weightKg <= 0 || weightKg > 400) {
    return NextResponse.json({ ok: false, error: "invalid weight" }, { status: 400 });
  }
  await logWeight(date, weightKg, note ?? null);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Write `src/app/api/badminton/route.ts`**

```ts
import { NextResponse } from "next/server";
import { logBadminton } from "@/lib/repos";
import { estimateBadmintonKcal, Intensity } from "@/lib/domain/badminton";

export async function POST(req: Request) {
  const { date, durationMin, intensity } = await req.json();
  if (typeof durationMin !== "number" || durationMin <= 0 || durationMin > 600) {
    return NextResponse.json({ ok: false, error: "invalid duration" }, { status: 400 });
  }
  if (!["low", "med", "high"].includes(intensity)) {
    return NextResponse.json({ ok: false, error: "invalid intensity" }, { status: 400 });
  }
  await logBadminton(date, durationMin, intensity);
  const kcal = estimateBadmintonKcal(durationMin, intensity as Intensity);
  return NextResponse.json({ ok: true, kcal });
}
```

- [ ] **Step 3: Write `src/app/api/workouts/route.ts`**

```ts
import { NextResponse } from "next/server";
import {
  createWorkout,
  getAllExercises,
  getNextLadderExercise,
} from "@/lib/repos";
import { computeProgressionNudge } from "@/lib/domain/progression";

type SetInput = { exerciseId: number; reps: number; addedWeightKg: number | null };

export async function POST(req: Request) {
  const { date, note, sets } = (await req.json()) as {
    date: string;
    note: string | null;
    sets: SetInput[];
  };
  if (!Array.isArray(sets) || sets.length === 0) {
    return NextResponse.json({ ok: false, error: "no sets" }, { status: 400 });
  }
  for (const s of sets) {
    if (typeof s.reps !== "number" || s.reps <= 0 || s.reps > 1000) {
      return NextResponse.json({ ok: false, error: "invalid reps" }, { status: 400 });
    }
  }

  await createWorkout(
    date,
    note ?? null,
    sets.map((s, i) => ({
      exerciseId: s.exerciseId,
      setIndex: i,
      reps: s.reps,
      addedWeightKg: s.addedWeightKg ?? null,
    })),
  );

  // compute nudges per distinct exercise in this workout
  const all = await getAllExercises();
  const byId = new Map(all.map((e) => [e.id, e]));
  const nudges = [];
  const exerciseIds = [...new Set(sets.map((s) => s.exerciseId))];
  for (const exId of exerciseIds) {
    const ex = byId.get(exId);
    if (!ex) continue;
    const exSets = sets.filter((s) => s.exerciseId === exId).map((s) => ({ reps: s.reps }));
    const next = await getNextLadderExercise(ex.ladderGroup, ex.level);
    const nudge = computeProgressionNudge(exSets, ex, next ? { id: next.id, name: next.name } : null);
    if (nudge.shouldNudge) nudges.push(nudge);
  }

  return NextResponse.json({ ok: true, nudges });
}
```

- [ ] **Step 4: Write `src/app/api/settings/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getSettings, upsertSettings } from "@/lib/repos";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { targetWeightKg, currentWeightKg, weeklyWorkoutGoal } = body;
  if (
    typeof targetWeightKg !== "number" ||
    typeof currentWeightKg !== "number" ||
    typeof weeklyWorkoutGoal !== "number"
  ) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  await upsertSettings({
    targetWeightKg,
    currentWeightKg,
    heightCm: body.heightCm ?? null,
    weeklyWorkoutGoal,
    surplusPref: body.surplusPref ?? null,
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: api routes for workouts, weight, badminton, settings"
```

---

## Task 12: Home / Today screen

**Files:**
- Create: `src/components/VerdictCard.tsx`, `src/components/ActionButton.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write `src/components/ActionButton.tsx`**

```tsx
import Link from "next/link";

export function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-xl bg-black p-5 text-lg font-semibold text-white active:scale-95 transition"
    >
      {label}
    </Link>
  );
}
```

- [ ] **Step 2: Write `src/components/VerdictCard.tsx`**

```tsx
import { Verdict } from "@/lib/domain/verdict";

const COPY: Record<string, { title: string; cls: string }> = {
  on_track: { title: "📈 On track — keep eating", cls: "bg-green-100 text-green-900" },
  eat_more: { title: "⚠️ Not gaining — eat more", cls: "bg-amber-100 text-amber-900" },
  too_fast: { title: "🐖 Gaining fast — ease off a bit", cls: "bg-orange-100 text-orange-900" },
  insufficient_data: { title: "Log your weight to see your trend", cls: "bg-gray-100 text-gray-700" },
};

export function VerdictCard({
  verdict,
  current,
  target,
}: {
  verdict: Verdict;
  current: number | null;
  target: number | null;
}) {
  const c = COPY[verdict.state];
  return (
    <div className={`rounded-2xl p-6 ${c.cls}`}>
      <div className="text-xl font-bold">{c.title}</div>
      {verdict.kgPerWeek !== null && (
        <div className="mt-1 text-sm">{verdict.kgPerWeek.toFixed(2)} kg/week</div>
      )}
      {current !== null && target !== null && (
        <div className="mt-2 text-sm">
          {current.toFixed(1)} → {target.toFixed(1)} kg ({(target - current).toFixed(1)} to go)
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write `src/app/page.tsx`** (server component — fetches + computes)

```tsx
import { getWeightLogs, getWorkoutDates, getSettings } from "@/lib/repos";
import { computeGainingVerdict } from "@/lib/domain/verdict";
import { computeWeeklyStreak } from "@/lib/domain/streak";
import { VerdictCard } from "@/components/VerdictCard";
import { ActionButton } from "@/components/ActionButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const [logs, workoutDates, settings] = await Promise.all([
    getWeightLogs(),
    getWorkoutDates(),
    getSettings(),
  ]);

  const verdict = computeGainingVerdict(
    logs.map((l) => ({ date: l.date, weightKg: l.weightKg })),
    now,
  );
  const goal = settings?.weeklyWorkoutGoal ?? 3;
  const streak = computeWeeklyStreak(workoutDates, goal, now);
  const current = logs.length ? logs[logs.length - 1].weightKg : settings?.currentWeightKg ?? null;
  const target = settings?.targetWeightKg ?? null;

  return (
    <main className="mx-auto max-w-md space-y-5 p-5">
      <h1 className="text-2xl font-bold">Today</h1>
      <VerdictCard verdict={verdict} current={current} target={target} />
      <div className="rounded-2xl bg-gray-50 p-5 text-center">
        <div className="text-3xl font-bold">🔥 {streak}</div>
        <div className="text-sm text-gray-600">week streak (goal {goal}/wk)</div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <ActionButton href="/workout" label="Log Workout" />
        <ActionButton href="/weight" label="Log Weight" />
        <ActionButton href="/badminton" label="Log Badminton" />
      </div>
      <div className="text-center">
        <a href="/progress" className="text-sm text-gray-500 underline">View progress →</a>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Manually verify**

Run `npm run dev`, log in, view home. With no data → "Log your weight" verdict + streak 0. No crash.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: home/today screen with verdict and streak"
```

---

## Task 13: Logging screens (workout, weight, badminton)

**Files:**
- Create: `src/app/weight/page.tsx`, `src/app/badminton/page.tsx`, `src/app/workout/page.tsx`

For brevity these are client components that POST to the APIs from Task 11. Use today's date as default (`new Date().toISOString().slice(0,10)`).

- [ ] **Step 1: Write `src/app/weight/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WeightPage() {
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        weightKg: parseFloat(weight),
        note: note || null,
      }),
    });
    if (res.ok) router.push("/");
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-5">
      <h1 className="text-2xl font-bold">Log Weight</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="number" step="0.1" inputMode="decimal" required
          value={weight} onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)" className="w-full rounded border p-3 text-lg"
        />
        <input
          value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)" className="w-full rounded border p-3"
        />
        <button className="w-full rounded-xl bg-black p-4 font-semibold text-white">Save</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Write `src/app/badminton/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BadmintonPage() {
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<"low" | "med" | "high">("med");
  const [kcal, setKcal] = useState<number | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/badminton", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        durationMin: parseInt(duration, 10),
        intensity,
      }),
    });
    const data = await res.json();
    if (res.ok) setKcal(data.kcal);
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-5">
      <h1 className="text-2xl font-bold">Log Badminton</h1>
      {kcal !== null ? (
        <div className="rounded-2xl bg-amber-100 p-6 text-amber-900">
          <p className="font-bold">~{kcal} kcal burned 🏸</p>
          <p className="text-sm">Eat extra today to stay in surplus.</p>
          <button onClick={() => router.push("/")} className="mt-4 rounded bg-black px-4 py-2 text-white">Done</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input
            type="number" inputMode="numeric" required
            value={duration} onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (minutes)" className="w-full rounded border p-3 text-lg"
          />
          <div className="flex gap-2">
            {(["low", "med", "high"] as const).map((i) => (
              <button
                type="button" key={i} onClick={() => setIntensity(i)}
                className={`flex-1 rounded-xl p-3 capitalize ${intensity === i ? "bg-black text-white" : "bg-gray-100"}`}
              >{i}</button>
            ))}
          </div>
          <button className="w-full rounded-xl bg-black p-4 font-semibold text-white">Save</button>
        </form>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Write `src/app/workout/page.tsx`** (server component fetches exercises, hands to a client form)

First add a small API route so the form can look up the last session for an exercise. Create `src/app/api/exercises/last/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getLastSetsForExercise } from "@/lib/repos";

export async function GET(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ sets: [] });
  const sets = await getLastSetsForExercise(id);
  return NextResponse.json({
    date: sets[0]?.date ?? null,
    sets: sets.map((s) => ({ reps: s.reps, addedWeightKg: s.addedWeightKg })),
  });
}
```

Then create `src/components/WorkoutForm.tsx` (note the `useEffect` that loads "last time" whenever the selected exercise changes):

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Exercise = { id: number; name: string; category: string };
type SetRow = { reps: string; addedWeightKg: string };
type LastInfo = { date: string | null; sets: { reps: number; addedWeightKg: number | null }[] };

export function WorkoutForm({ exercises }: { exercises: Exercise[] }) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? 0);
  const [rows, setRows] = useState<SetRow[]>([{ reps: "", addedWeightKg: "" }]);
  const [nudges, setNudges] = useState<{ fromName?: string; toName?: string }[]>([]);
  const [last, setLast] = useState<LastInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!exerciseId) return;
    fetch(`/api/exercises/last?id=${exerciseId}`)
      .then((r) => r.json())
      .then(setLast);
  }, [exerciseId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sets = rows
      .filter((r) => r.reps)
      .map((r) => ({
        exerciseId,
        reps: parseInt(r.reps, 10),
        addedWeightKg: r.addedWeightKg ? parseFloat(r.addedWeightKg) : null,
      }));
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: new Date().toISOString().slice(0, 10), note: null, sets }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.nudges?.length) setNudges(data.nudges);
      else router.push("/");
    }
  }

  if (nudges.length) {
    return (
      <div className="space-y-4">
        {nudges.map((n, i) => (
          <div key={i} className="rounded-2xl bg-green-100 p-6 text-green-900">
            💪 You crushed {n.fromName}! Try <b>{n.toName}</b> next time.
          </div>
        ))}
        <button onClick={() => router.push("/")} className="w-full rounded-xl bg-black p-4 text-white">Done</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <select
        value={exerciseId} onChange={(e) => setExerciseId(parseInt(e.target.value, 10))}
        className="w-full rounded border p-3"
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>
        ))}
      </select>
      {last && last.sets.length > 0 && (
        <p className="text-sm text-gray-500">
          Last time: {last.sets.map((s) => s.reps + (s.addedWeightKg ? `(+${s.addedWeightKg}kg)` : "")).join(" · ")} — beat it!
        </p>
      )}
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="number" inputMode="numeric" placeholder="reps"
            value={r.reps}
            onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, reps: e.target.value } : x)))}
            className="flex-1 rounded border p-3"
          />
          <input
            type="number" step="0.5" inputMode="decimal" placeholder="+kg"
            value={r.addedWeightKg}
            onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, addedWeightKg: e.target.value } : x)))}
            className="w-24 rounded border p-3"
          />
        </div>
      ))}
      <button type="button" onClick={() => setRows([...rows, { reps: "", addedWeightKg: "" }])} className="text-sm text-gray-600 underline">
        + add set
      </button>
      <button className="w-full rounded-xl bg-black p-4 font-semibold text-white">Save workout</button>
    </form>
  );
}
```

Then `src/app/workout/page.tsx`:

```tsx
import { getAllExercises } from "@/lib/repos";
import { WorkoutForm } from "@/components/WorkoutForm";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
  const exercises = await getAllExercises();
  return (
    <main className="mx-auto max-w-md space-y-4 p-5">
      <h1 className="text-2xl font-bold">Log Workout</h1>
      <WorkoutForm exercises={exercises.map((e) => ({ id: e.id, name: e.name, category: e.category }))} />
    </main>
  );
}
```

- [ ] **Step 4: Manually verify each form** end-to-end against the DB (log a weight, a badminton session — see kcal nudge, a workout with 3×12 push-ups — see progression nudge). Confirm rows appear in Neon.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: workout, weight, badminton logging screens"
```

---

## Task 14: Progress screen (weight chart + per-exercise history)

**Files:**
- Create: `src/app/progress/page.tsx`, `src/components/WeightChart.tsx`
- Modify: `package.json` (add chart lib)

- [ ] **Step 1: Install a lightweight chart lib**

```bash
npm install recharts
```

- [ ] **Step 2: Write `src/components/WeightChart.tsx`** (client component)

```tsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

export function WeightChart({
  data,
  target,
}: {
  data: { date: string; weightKg: number }[];
  target: number | null;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10 }} />
        <Tooltip />
        {target !== null && <ReferenceLine y={target} stroke="#16a34a" strokeDasharray="4 4" />}
        <Line type="monotone" dataKey="weightKg" stroke="#000" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 3: Add a per-exercise bests repo to `src/lib/repos.ts`** (append)

```ts
export async function getExerciseBests() {
  const rows = await db
    .select({ name: exercises.name, reps: workoutSets.reps })
    .from(workoutSets)
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id));
  const best = new Map<string, number>();
  for (const r of rows) best.set(r.name, Math.max(best.get(r.name) ?? 0, r.reps));
  return [...best.entries()]
    .map(([name, bestReps]) => ({ name, bestReps }))
    .sort((a, b) => b.bestReps - a.bestReps);
}
```

- [ ] **Step 4: Write `src/app/progress/page.tsx`**

```tsx
import { getWeightLogs, getSettings, getExerciseBests } from "@/lib/repos";
import { WeightChart } from "@/components/WeightChart";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const [logs, settings, bests] = await Promise.all([
    getWeightLogs(),
    getSettings(),
    getExerciseBests(),
  ]);
  const data = logs.map((l) => ({
    date: l.date.toISOString().slice(5, 10),
    weightKg: l.weightKg,
  }));

  return (
    <main className="mx-auto max-w-md space-y-6 p-5">
      <h1 className="text-2xl font-bold">Progress</h1>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">Bodyweight</h2>
        {data.length === 0 ? (
          <p className="text-gray-500">No weight logged yet.</p>
        ) : (
          <WeightChart data={data} target={settings?.targetWeightKg ?? null} />
        )}
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">Exercise bests (max reps in a set)</h2>
        {bests.length === 0 ? (
          <p className="text-gray-500">No workouts logged yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {bests.map((b) => (
              <li key={b.name} className="flex justify-between p-3 text-sm">
                <span>{b.name}</span>
                <span className="font-semibold">{b.bestReps} reps</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <a href="/" className="block text-center text-sm text-gray-500 underline">← back</a>
    </main>
  );
}
```

- [ ] **Step 5: Manually verify** the chart renders with logged weights + dashed target line, and the exercise bests list shows your top reps per movement.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: progress screen with weight chart"
```

---

## Task 15: PWA (manifest + service worker) + settings bootstrap

**Files:**
- Modify: `next.config.ts`, `src/app/layout.tsx`
- Create: `public/manifest.webmanifest`, `public/icons/` (192 + 512 png), `src/app/settings/page.tsx`

- [ ] **Step 1: Install `next-pwa`**

```bash
npm install next-pwa
```

- [ ] **Step 2: Wrap `next.config.ts`**

```ts
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

export default withPWA({});
```

- [ ] **Step 3: Create `public/manifest.webmanifest`**

```json
{
  "name": "Gains Tracker",
  "short_name": "Gains",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 4: Add icons** — place any 192×192 and 512×512 PNG at `public/icons/icon-192.png` and `public/icons/icon-512.png` (a plain colored square with "G" is fine for v1).

- [ ] **Step 5: Reference manifest in `src/app/layout.tsx`** — add to the exported `metadata`:

```ts
export const metadata = {
  title: "Gains Tracker",
  manifest: "/manifest.webmanifest",
  themeColor: "#000000",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Gains" },
};
```

- [ ] **Step 6: Create `src/app/settings/page.tsx`** (so target/current weight + weekly goal can be set — required before the verdict is meaningful)

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [goal, setGoal] = useState("3");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((s) => {
      if (s) {
        setTarget(String(s.targetWeightKg));
        setCurrent(String(s.currentWeightKg));
        setGoal(String(s.weeklyWorkoutGoal));
      }
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetWeightKg: parseFloat(target),
        currentWeightKg: parseFloat(current),
        weeklyWorkoutGoal: parseInt(goal, 10),
      }),
    });
    if (res.ok) router.push("/");
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-5">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">Current weight (kg)
          <input type="number" step="0.1" required value={current} onChange={(e) => setCurrent(e.target.value)} className="mt-1 w-full rounded border p-3" />
        </label>
        <label className="block text-sm">Target weight (kg)
          <input type="number" step="0.1" required value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 w-full rounded border p-3" />
        </label>
        <label className="block text-sm">Weekly workout goal
          <input type="number" inputMode="numeric" required value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 w-full rounded border p-3" />
        </label>
        <button className="w-full rounded-xl bg-black p-4 font-semibold text-white">Save</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 7: Add a Settings link** to `src/app/page.tsx` footer (next to the progress link):

```tsx
<a href="/settings" className="block text-center text-sm text-gray-500 underline">Settings</a>
```

- [ ] **Step 8: Build + verify PWA**

Run: `npm run build && npm start`
Expected: build succeeds, no type errors. Visit on phone (or Chrome devtools → Application → Manifest) → installable, "Add to Home Screen" works.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: PWA manifest/service worker and settings screen"
```

---

## Task 16: Final verification

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass (verdict 5, progression 3, streak 5, badminton 3, auth 3 = 19).

- [ ] **Step 2: Type-check + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all clean.

- [ ] **Step 3: End-to-end smoke on a real phone**

Open the deployed/dev URL on your phone, log in, set settings (current + target weight), log a weight, log a workout (hit a progression nudge), log a badminton session (see kcal tax), check the home verdict + streak update, view the progress chart. Add to home screen.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: final verification fixes"
```

---

## Notes for the implementer

- **Deploy:** push to GitHub, import into Vercel, set `DATABASE_URL`, `APP_PASSWORD`, `AUTH_SECRET` env vars. Run `db:migrate` + `db:seed` once against the production Neon branch.
- **Drizzle numeric gotcha:** weights use `doublePrecision` deliberately so they return as JS numbers (no string parsing). Keep it that way.
- **Date handling:** dates are stored as `date` (no time). Repos parse them as UTC midnight (`+ "T00:00:00Z"`) so domain math is timezone-stable. Don't switch to local-time parsing or the streak/verdict windows drift.
- **Single-user assumption:** `settings.id` is always 1. If multi-user is ever needed, that's a new spec.
```
