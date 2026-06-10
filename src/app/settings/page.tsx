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
