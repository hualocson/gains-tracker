import { getWeightLogs, getWorkoutDates, getSettings } from "@/lib/repos";
import { computeGainingVerdict } from "@/lib/domain/verdict";
import { computeWeeklyStreak } from "@/lib/domain/streak";
import Link from "next/link";
import { VerdictCard } from "@/components/VerdictCard";
import { ActionButton } from "@/components/ActionButton";
import { todayDate } from "@/lib/date";

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
    now,
  );
  const goal = settings?.weeklyWorkoutGoal ?? 3;
  const streak = computeWeeklyStreak(workoutDates, goal, now);
  const current = logs.length ? logs[logs.length - 1].weightKg : settings?.currentWeightKg ?? null;
  const target = settings?.targetWeightKg ?? null;

  return (
    <main className="mx-auto max-w-md space-y-5 p-5">
      <h1 className="text-2xl font-bold">Today</h1>
      <VerdictCard verdict={verdict} current={current} target={target} />
      <div className="rounded-2xl bg-gray-50 p-5 text-center">
        <div className="text-3xl font-bold">🔥 {streak}</div>
        <div className="text-sm text-gray-600">week streak (goal {goal}/wk)</div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <ActionButton href="/workout" label="Log Workout" />
        <ActionButton href="/weight" label="Log Weight" />
        <ActionButton href="/badminton" label="Log Badminton" />
      </div>
      <div className="text-center space-x-4">
        <Link href="/progress" className="text-sm text-gray-500 underline">View progress →</Link>
        <Link href="/settings" className="text-sm text-gray-500 underline">Settings</Link>
      </div>
    </main>
  );
}
