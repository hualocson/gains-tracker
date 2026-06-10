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
