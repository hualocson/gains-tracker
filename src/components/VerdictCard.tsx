import { Verdict } from "@/lib/domain/verdict";

const COPY: Record<string, { title: string; cls: string }> = {
  on_track: {
    title: "📈 On track — keep eating",
    cls: "bg-green-100 text-green-900",
  },
  eat_more: {
    title: "⚠️ Not gaining — eat more",
    cls: "bg-amber-100 text-amber-900",
  },
  too_fast: {
    title: "🐖 Gaining fast — ease off a bit",
    cls: "bg-orange-100 text-orange-900",
  },
  insufficient_data: {
    title: "Log your weight to see your trend",
    cls: "bg-gray-100 text-gray-700",
  },
};

export function VerdictCard({
  verdict,
  current,
  target,
}: {
  verdict: Verdict;
  current: number | null;
  target: number | null;
}) {
  const c = COPY[verdict.state];
  return (
    <div className={`rounded-2xl p-6 ${c.cls}`}>
      <div className="text-xl font-bold">{c.title}</div>
      {verdict.kgPerWeek !== null && (
        <div className="mt-1 text-sm">
          {verdict.kgPerWeek.toFixed(2)} kg/week
        </div>
      )}
      {current !== null && target !== null && (
        <div className="mt-2 text-sm">
          {current.toFixed(1)} → {target.toFixed(1)} kg (
          {(target - current).toFixed(1)} to go)
        </div>
      )}
    </div>
  );
}
