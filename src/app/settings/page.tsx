"use client";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PageHeader } from "@/components/PageHeader";

export default function SettingsPage() {
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [goal, setGoal] = useState("3");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
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
    if (res.ok) {
      router.push("/");
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 pt-5 pb-10">
      <PageHeader title="Settings" eyebrow="Your targets" />
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="current">Current weight (kg)</Label>
          <Input
            id="current"
            type="number"
            step="0.1"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target">Target weight (kg)</Label>
          <Input
            id="target"
            type="number"
            step="0.1"
            required
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goal">Weekly workout goal</Label>
          <Input
            id="goal"
            type="number"
            inputMode="numeric"
            required
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </main>
  );
}
