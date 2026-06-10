"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PageHeader } from "@/components/PageHeader";

type Result = { kcal: number; estimated: boolean };

export default function BadmintonPage() {
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<"low" | "med" | "high">("med");
  const [calories, setCalories] = useState("");
  const [result, setResult] = useState<Result | null>(null);
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
        kcal: calories.trim() ? parseFloat(calories) : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult({ kcal: data.kcal, estimated: data.estimated });
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 pt-5 pb-10">
      <PageHeader title="Badminton" eyebrow="Log today" />
      {result !== null ? (
        <Card>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="bg-chart-3/12 flex size-12 shrink-0 items-center justify-center rounded-xl">
                <Flame className="text-chart-3 size-6" aria-hidden="true" />
              </span>
              <div>
                <div className="text-3xl leading-none font-bold tabular-nums">
                  {result.estimated ? "~" : ""}
                  {result.kcal}
                </div>
                <div className="text-muted-foreground mt-1.5 text-sm">
                  kcal burned{result.estimated ? " (estimated)" : ""}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Add it back at the table — eat extra today to stay in surplus.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Done
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              inputMode="numeric"
              required
              autoFocus
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 60"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Intensity</Label>
            <div className="bg-muted/40 grid grid-cols-3 gap-1 rounded-xl p-1">
              {(["low", "med", "high"] as const).map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIntensity(i)}
                  aria-pressed={intensity === i}
                  className={cn(
                    "focus-visible:ring-ring/50 h-10 rounded-lg text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-[3px]",
                    intensity === i
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="calories">Calories burned (optional)</Label>
            <Input
              id="calories"
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Estimated from intensity if blank"
            />
          </div>
          <Button type="submit" className="w-full">
            Save session
          </Button>
        </form>
      )}
    </main>
  );
}
