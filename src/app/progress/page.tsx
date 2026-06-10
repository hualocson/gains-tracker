import { formatDayLabel, todayDate } from "@/lib/date";
import { badmintonWeekTotals, effectiveKcal } from "@/lib/domain/badminton";
import {
  getBadmintonSessions,
  getExerciseBests,
  getSettings,
  getWeightLogs,
} from "@/lib/repos";
import { Flame } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { PageHeader } from "@/components/PageHeader";
import { WeightChart } from "@/components/WeightChart";

export const dynamic = "force-dynamic";

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl border p-3 text-center">
      <div className="text-2xl leading-none font-bold tabular-nums">
        {value}
      </div>
      <div className="text-muted-foreground mt-1.5 text-xs">{label}</div>
    </div>
  );
}

export default async function ProgressPage() {
  const [logs, settings, bests, badminton] = await Promise.all([
    getWeightLogs(),
    getSettings(),
    getExerciseBests(),
    getBadmintonSessions(),
  ]);
  const data = logs.map((l) => ({
    date: l.date.toISOString().slice(5, 10),
    weightKg: l.weightKg,
  }));
  const week = badmintonWeekTotals(badminton, todayDate());

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

      <section className="space-y-3">
        <h2 className="eyebrow text-muted-foreground px-1">Badminton</h2>
        {badminton.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              No badminton logged yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground px-1 text-xs">This week</p>
              <div className="grid grid-cols-3 gap-3">
                <StatTile label="Sessions" value={week.sessions} />
                <StatTile label="Minutes" value={week.minutes} />
                <StatTile label="Calories" value={week.kcal} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground px-1 text-xs">
                Recent sessions
              </p>
              <Card className="py-0">
                <CardContent className="divide-border divide-y px-0">
                  {badminton.slice(0, 8).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <div>
                        <div className="font-medium">
                          {formatDayLabel(s.date)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          <span className="capitalize">{s.intensity}</span> ·{" "}
                          {s.durationMin} min
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 font-medium tabular-nums">
                        <Flame
                          className="text-chart-3 size-4"
                          aria-hidden="true"
                        />
                        {effectiveKcal(s)} kcal
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
