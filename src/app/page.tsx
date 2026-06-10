import Link from "next/link";

import { todayDate, todayLabel } from "@/lib/date";
import { computeWeeklyStreak } from "@/lib/domain/streak";
import { computeGainingVerdict } from "@/lib/domain/verdict";
import { getSettings, getWeightLogs, getWorkoutDates } from "@/lib/repos";
import {
  ChevronRight,
  Dumbbell,
  Flame,
  LineChart,
  Scale,
  Settings,
  Volleyball,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { QuickAction } from "@/components/QuickAction";
import { VerdictCard } from "@/components/VerdictCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = todayDate();
  const [logs, workoutDates, settings] = await Promise.all([
    getWeightLogs(),
    getWorkoutDates(),
    getSettings(),
  ]);

  const verdict = computeGainingVerdict(
    logs.map((l) => ({ date: l.date, weightKg: l.weightKg })),
    now
  );
  const goal = settings?.weeklyWorkoutGoal ?? 3;
  const streak = computeWeeklyStreak(workoutDates, goal, now);
  const current = logs.length
    ? logs[logs.length - 1].weightKg
    : (settings?.currentWeightKg ?? null);
  const target = settings?.targetWeightKg ?? null;

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 pt-5 pb-10">
      <header className="flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">Gains</span>
        <Button asChild variant="ghost" size="icon" aria-label="Settings">
          <Link href="/settings">
            <Settings className="size-5" aria-hidden="true" />
          </Link>
        </Button>
      </header>

      <VerdictCard
        verdict={verdict}
        current={current}
        target={target}
        dateLabel={todayLabel()}
      />

      <Card className="py-0">
        <CardContent className="flex items-center gap-4 py-4">
          <span className="bg-chart-3/12 flex size-12 shrink-0 items-center justify-center rounded-xl">
            <Flame className="text-chart-3 size-6" aria-hidden="true" />
          </span>
          <div>
            <div className="text-3xl leading-none font-bold tabular-nums">
              {streak}
            </div>
            <div className="text-muted-foreground mt-1.5 text-sm">
              week streak · goal {goal}/wk
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <p className="eyebrow text-muted-foreground px-1">Log today</p>
        <div className="space-y-2.5">
          <QuickAction
            href="/workout"
            label="Workout"
            hint="Reps, sets & overload"
            icon={Dumbbell}
            accent="sky"
          />
          <QuickAction
            href="/weight"
            label="Bodyweight"
            hint="Track the trend"
            icon={Scale}
            accent="purple"
          />
          <QuickAction
            href="/badminton"
            label="Badminton"
            hint="Log calories burned"
            icon={Volleyball}
            accent="green"
          />
        </div>
      </section>

      <Button
        asChild
        variant="outline"
        className="h-12 w-full justify-between px-4"
      >
        <Link href="/progress">
          <span className="flex items-center gap-2">
            <LineChart className="size-5" aria-hidden="true" />
            View progress
          </span>
          <ChevronRight className="size-5" aria-hidden="true" />
        </Link>
      </Button>
    </main>
  );
}
