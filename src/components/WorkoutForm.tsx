"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { todayISO } from "@/lib/date";

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
      body: JSON.stringify({ date: todayISO(), note: null, sets }),
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
