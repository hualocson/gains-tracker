"use client";
import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { todayISO } from "@/lib/date";
import { History, Plus, Trophy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Exercise = { id: number; name: string; category: string };
// `id` is a stable client-side key so removing a row reconciles the controlled
// inputs correctly (index keys would shift values onto the wrong row).
type SetRow = { id: number; reps: string; addedWeightKg: string };
type LastInfo = {
  date: string | null;
  sets: { reps: number; addedWeightKg: number | null }[];
};

export function WorkoutForm({ exercises }: { exercises: Exercise[] }) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? 0);
  const [rows, setRows] = useState<SetRow[]>([
    { id: 0, reps: "", addedWeightKg: "" },
  ]);
  const nextId = useRef(1);
  const [nudges, setNudges] = useState<
    { fromName?: string; toName?: string }[]
  >([]);
  const [last, setLast] = useState<LastInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!exerciseId) {
      return;
    }
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
      if (data.nudges?.length) {
        setNudges(data.nudges);
      } else {
        router.push("/");
      }
    }
  }

  if (nudges.length) {
    return (
      <div className="space-y-4">
        {nudges.map((n, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-2">
              <Trophy
                className="text-chart-2 mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <span>
                You crushed {n.fromName}! Try <b>{n.toName}</b> next time.
              </span>
            </CardContent>
          </Card>
        ))}
        <Button onClick={() => router.push("/")} className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <Label>Exercise</Label>
        <Select
          value={String(exerciseId)}
          onValueChange={(v) => setExerciseId(parseInt(v, 10))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select exercise" />
          </SelectTrigger>
          <SelectContent>
            {exercises.map((ex) => (
              <SelectItem key={ex.id} value={String(ex.id)}>
                {ex.name} ({ex.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {last && last.sets.length > 0 && (
        <div className="bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg p-3 text-sm">
          <History className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="text-foreground font-medium">Last time:</span>{" "}
            {last.sets
              .map(
                (s) =>
                  s.reps + (s.addedWeightKg ? ` (+${s.addedWeightKg}kg)` : "")
              )
              .join(" · ")}{" "}
            — beat it.
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label>Sets</Label>
        {rows.map((r, i) => (
          <div key={r.id} className="flex items-center gap-2.5">
            <span className="text-muted-foreground w-7 shrink-0 text-sm tabular-nums">
              #{i + 1}
            </span>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="reps"
              value={r.reps}
              onChange={(e) =>
                setRows((rs) =>
                  rs.map((x) =>
                    x.id === r.id ? { ...x, reps: e.target.value } : x
                  )
                )
              }
              className="flex-1"
            />
            <Input
              type="number"
              step="0.5"
              inputMode="decimal"
              placeholder="+kg"
              value={r.addedWeightKg}
              onChange={(e) =>
                setRows((rs) =>
                  rs.map((x) =>
                    x.id === r.id ? { ...x, addedWeightKg: e.target.value } : x
                  )
                )
              }
              className="w-24"
            />
            {rows.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove set ${i + 1}`}
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() =>
            setRows((rs) => [
              ...rs,
              { id: nextId.current++, reps: "", addedWeightKg: "" },
            ])
          }
        >
          <Plus className="size-4" aria-hidden="true" />
          Add set
        </Button>
      </div>

      <Button type="submit" className="w-full">
        Save workout
      </Button>
    </form>
  );
}
