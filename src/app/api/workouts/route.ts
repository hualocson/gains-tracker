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
