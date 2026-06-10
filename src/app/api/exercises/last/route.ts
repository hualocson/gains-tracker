import { NextResponse } from "next/server";

import { getLastSetsForExercise } from "@/lib/repos";

export async function GET(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) {return NextResponse.json({ sets: [] });}
  const sets = await getLastSetsForExercise(id);
  return NextResponse.json({
    date: sets[0]?.date ?? null,
    sets: sets.map((s) => ({ reps: s.reps, addedWeightKg: s.addedWeightKg })),
  });
}
