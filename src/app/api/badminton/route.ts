import { NextResponse } from "next/server";

import { Intensity, estimateBadmintonKcal } from "@/lib/domain/badminton";
import { logBadminton } from "@/lib/repos";

export async function POST(req: Request) {
  const { date, durationMin, intensity, kcal: manualKcal } = await req.json();
  if (
    typeof durationMin !== "number" ||
    durationMin <= 0 ||
    durationMin > 600
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid duration" },
      { status: 400 }
    );
  }
  if (!["low", "med", "high"].includes(intensity)) {
    return NextResponse.json(
      { ok: false, error: "invalid intensity" },
      { status: 400 }
    );
  }
  // Calories are optional: a manual entry (e.g. from a watch) overrides the
  // duration × intensity estimate. When omitted we fall back to the estimate.
  let kcal: number;
  let estimated: boolean;
  if (manualKcal === null || manualKcal === undefined || manualKcal === "") {
    kcal = estimateBadmintonKcal(durationMin, intensity as Intensity);
    estimated = true;
  } else if (
    typeof manualKcal !== "number" ||
    !Number.isFinite(manualKcal) ||
    manualKcal <= 0 ||
    manualKcal > 5000
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid calories" },
      { status: 400 }
    );
  } else {
    kcal = Math.round(manualKcal);
    estimated = false;
  }
  await logBadminton(date, durationMin, intensity, kcal);
  return NextResponse.json({ ok: true, kcal, estimated });
}
