import { getWeightLogs, getSettings, getExerciseBests } from "@/lib/repos";
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
    <main className="mx-auto max-w-md space-y-6 p-5">
      <h1 className="text-2xl font-bold">Progress</h1>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">Bodyweight</h2>
        {data.length === 0 ? (
          <p className="text-gray-500">No weight logged yet.</p>
        ) : (
          <WeightChart data={data} target={settings?.targetWeightKg ?? null} />
        )}
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">Exercise bests (max reps in a set)</h2>
        {bests.length === 0 ? (
          <p className="text-gray-500">No workouts logged yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {bests.map((b) => (
              <li key={b.name} className="flex justify-between p-3 text-sm">
                <span>{b.name}</span>
                <span className="font-semibold">{b.bestReps} reps</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <a href="/" className="block text-center text-sm text-gray-500 underline">← back</a>
    </main>
  );
}
