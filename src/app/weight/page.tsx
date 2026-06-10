"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { todayISO } from "@/lib/date";

export default function WeightPage() {
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: todayISO(),
        weightKg: parseFloat(weight),
        note: note || null,
      }),
    });
    if (res.ok) router.push("/");
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-5">
      <h1 className="text-2xl font-bold">Log Weight</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="number" step="0.1" inputMode="decimal" required
          value={weight} onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)" className="w-full rounded border p-3 text-lg"
        />
        <input
          value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)" className="w-full rounded border p-3"
        />
        <button className="w-full rounded-xl bg-black p-4 font-semibold text-white">Save</button>
      </form>
    </main>
  );
}
