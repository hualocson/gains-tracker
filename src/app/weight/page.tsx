"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { todayISO } from "@/lib/date";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PageHeader } from "@/components/PageHeader";

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
    if (res.ok) {
      router.push("/");
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 pt-5 pb-10">
      <PageHeader title="Bodyweight" eyebrow="Log today" />
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            inputMode="decimal"
            required
            autoFocus
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 72.4"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Note (optional)</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Morning, after coffee…"
          />
        </div>
        <Button type="submit" className="w-full">
          Save weigh-in
        </Button>
      </form>
    </main>
  );
}
