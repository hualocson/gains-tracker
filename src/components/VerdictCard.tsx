import { Verdict } from "@/lib/domain/verdict";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Info,
  type LucideIcon,
  Rabbit,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

// Each verdict state keeps a short coaching headline and a sticker-palette tint
// for its icon — the one spot of status colour against the deep-night indigo.
const COPY: Record<string, { title: string; icon: LucideIcon; tint: string }> =
  {
    on_track: {
      title: "On track — keep eating",
      icon: TrendingUp,
      tint: "text-chart-2",
    },
    eat_more: {
      title: "Not gaining — eat more",
      icon: TriangleAlert,
      tint: "text-chart-3",
    },
    too_fast: {
      title: "Gaining fast — ease off a bit",
      icon: Rabbit,
      tint: "text-chart-5",
    },
    insufficient_data: {
      title: "Log your weight to see your trend",
      icon: Info,
      tint: "text-chart-1",
    },
  };

// The signature surface: DESIGN.md's saturated indigo {colors.secondary} "deep
// night" band, used here for its single intended hero moment — the daily verdict.
export function VerdictCard({
  verdict,
  current,
  target,
  dateLabel,
}: {
  verdict: Verdict;
  current: number | null;
  target: number | null;
  dateLabel?: string;
}) {
  const c = COPY[verdict.state];
  const Icon = c.icon;
  const hasMetrics =
    verdict.kgPerWeek !== null || (current !== null && target !== null);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/10 px-5 py-6 text-white"
      style={{ backgroundColor: "#213183" }}
    >
      {/* soft night-glow — the "lit night scene" cue, not a hard shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 size-60 rounded-full opacity-70 blur-2xl"
        style={{
          background: "radial-gradient(circle, #4055c9 0%, transparent 70%)",
        }}
      />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          {dateLabel && <p className="eyebrow text-white/55">{dateLabel}</p>}
          <span className="eyebrow text-white/45">Today</span>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Icon className={cn("size-5", c.tint)} aria-hidden="true" />
          </span>
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance">
            {c.title}
          </h1>
        </div>

        {hasMetrics && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pl-12">
            {verdict.kgPerWeek !== null && (
              <span className="inline-flex items-baseline gap-1 rounded-full bg-white/10 px-2.5 py-1 text-sm">
                <span className="font-semibold tabular-nums">
                  {verdict.kgPerWeek.toFixed(2)}
                </span>
                <span className="text-white/60">kg/wk</span>
              </span>
            )}
            {current !== null && target !== null && (
              <span className="inline-flex items-center gap-1.5 text-sm text-white/70 tabular-nums">
                {current.toFixed(1)}
                <ArrowRight
                  className="size-3.5 text-white/45"
                  aria-hidden="true"
                />
                {target.toFixed(1)} kg
                <span className="text-white/45">
                  · {(target - current).toFixed(1)} to go
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
