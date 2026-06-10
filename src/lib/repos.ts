import { db } from "@/db/client";
import {
  badmintonSessions,
  bodyweightLogs,
  exercises,
  settings,
  workoutSets,
  workouts,
} from "@/db/schema";
import { and, asc, desc, eq, gt } from "drizzle-orm";

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
  return db
    .select()
    .from(exercises)
    .orderBy(exercises.ladderGroup, exercises.level);
}

export async function getNextLadderExercise(
  ladderGroup: string,
  level: number
) {
  // next level UP the ladder; `gt` (not level+1) so a deleted mid-ladder
  // exercise doesn't dead-end progression at the gap
  const rows = await db
    .select()
    .from(exercises)
    .where(
      and(eq(exercises.ladderGroup, ladderGroup), gt(exercises.level, level))
    )
    .orderBy(asc(exercises.level))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLastSetsForExercise(exerciseId: number) {
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
  if (rows.length === 0) {
    return [];
  }
  const latestWorkoutId = rows[0].workoutId;
  return rows.filter((r) => r.workoutId === latestWorkoutId);
}

export async function createWorkout(
  date: string,
  note: string | null,
  sets: {
    exerciseId: number;
    setIndex: number;
    reps: number;
    addedWeightKg: number | null;
  }[]
) {
  const [w] = await db.insert(workouts).values({ date, note }).returning();
  if (sets.length) {
    await db
      .insert(workoutSets)
      .values(sets.map((s) => ({ ...s, workoutId: w.id })));
  }
  return w;
}

export async function getWorkoutDates() {
  const rows = await db.select({ date: workouts.date }).from(workouts);
  return rows.map((r) => new Date(r.date + "T00:00:00Z"));
}

export async function logWeight(
  date: string,
  weightKg: number,
  note: string | null
) {
  await db.insert(bodyweightLogs).values({ date, weightKg, note });
}

export async function getWeightLogs() {
  const rows = await db
    .select()
    .from(bodyweightLogs)
    .orderBy(bodyweightLogs.date);
  return rows.map((r) => ({
    date: new Date(r.date + "T00:00:00Z"),
    weightKg: r.weightKg,
    note: r.note,
  }));
}

export async function logBadminton(
  date: string,
  durationMin: number,
  intensity: string
) {
  await db.insert(badmintonSessions).values({ date, durationMin, intensity });
}

export async function getExerciseBests() {
  const rows = await db
    .select({ name: exercises.name, reps: workoutSets.reps })
    .from(workoutSets)
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id));
  const best = new Map<string, number>();
  for (const r of rows) {
    best.set(r.name, Math.max(best.get(r.name) ?? 0, r.reps));
  }
  return [...best.entries()]
    .map(([name, bestReps]) => ({ name, bestReps }))
    .sort((a, b) => b.bestReps - a.bestReps);
}
