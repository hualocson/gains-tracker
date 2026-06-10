"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { todayISO } from "@/lib/date";

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
        date: todayISO(),
        durationMin: parseInt(duration, 10),
        intensity,
      }),
    });
    const data = await res.json();
    if (res.ok) {setKcal(data.kcal);}
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-5">
      <h1 className="text-2xl font-bold">Log Badminton</h1>
      {kcal !== null ? (
        <div className="rounded-2xl bg-amber-100 p-6 text-amber-900">
          <p className="font-bold">~{kcal} kcal burned 🏸</p>
          <p className="text-sm">Eat extra today to stay in surplus.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded bg-black px-4 py-2 text-white"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input
            type="number"
            inputMode="numeric"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (minutes)"
            className="w-full rounded border p-3 text-lg"
          />
          <div className="flex gap-2">
            {(["low", "med", "high"] as const).map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIntensity(i)}
                className={`flex-1 rounded-xl p-3 capitalize ${intensity === i ? "bg-black text-white" : "bg-gray-100"}`}
              >
                {i}
              </button>
            ))}
          </div>
          <button className="w-full rounded-xl bg-black p-4 font-semibold text-white">
            Save
          </button>
        </form>
      )}
    </main>
  );
}
