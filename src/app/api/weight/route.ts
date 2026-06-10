import { NextResponse } from "next/server";

import { logWeight } from "@/lib/repos";

export async function POST(req: Request) {
  const { date, weightKg, note } = await req.json();
  if (typeof weightKg !== "number" || weightKg <= 0 || weightKg > 400) {
    return NextResponse.json(
      { ok: false, error: "invalid weight" },
      { status: 400 }
    );
  }
  await logWeight(date, weightKg, note ?? null);
  return NextResponse.json({ ok: true });
}
