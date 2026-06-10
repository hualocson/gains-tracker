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
