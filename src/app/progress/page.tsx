import { getExerciseBests, getSettings, getWeightLogs } from "@/lib/repos";

import { Card, CardContent } from "@/components/ui/card";

import { PageHeader } from "@/components/PageHeader";
import { WeightChart } from "@/components/WeightChart";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const [logs, settings, bests] = await Promise.all([
    getWeightLogs(),
    getSettings(),
    getExerciseBests(),
  ]);
  const data = logs.map((l) => ({
    date: l.date.toISOString().slice(5, 10),
    weightKg: l.weightKg,
  }));

  return (
    <main className="mx-auto max-w-md space-y-7 px-5 pt-5 pb-10">
      <PageHeader title="Progress" eyebrow="Over time" />

      <section className="space-y-3">
        <h2 className="eyebrow text-muted-foreground px-1">Bodyweight</h2>
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              No weight logged yet.
            </CardContent>
          </Card>
        ) : (
          <Card className="py-4">
            <CardContent className="px-2">
              <WeightChart
                data={data}
                target={settings?.targetWeightKg ?? null}
              />
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="eyebrow text-muted-foreground px-1">
          Exercise bests · max reps in a set
        </h2>
        {bests.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              No workouts logged yet.
            </CardContent>
          </Card>
        ) : (
          <Card className="py-0">
            <CardContent className="divide-border divide-y px-0">
              {bests.map((b) => (
                <div
                  key={b.name}
                  className="flex items-center justify-between px-4 py-3.5 text-sm"
                >
                  <span>{b.name}</span>
                  <span className="font-semibold tabular-nums">
                    {b.bestReps} reps
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
