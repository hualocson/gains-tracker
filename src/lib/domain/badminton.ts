import { weekStart } from "./streak";

export type Intensity = "low" | "med" | "high";

const KCAL_PER_MIN: Record<Intensity, number> = {
  low: 5,
  med: 7,
  high: 9,
};

export function estimateBadmintonKcal(
  durationMin: number,
  intensity: Intensity
): number {
  return durationMin * KCAL_PER_MIN[intensity];
}

export type BadmintonSession = {
  date: Date;
  durationMin: number;
  intensity: Intensity;
  kcal: number | null;
};

// Stored kcal when present, otherwise the duration × intensity estimate — so
// older rows logged before calories were persisted still report a sensible value.
export function effectiveKcal(s: BadmintonSession): number {
  return s.kcal ?? estimateBadmintonKcal(s.durationMin, s.intensity);
}

export type BadmintonWeekTotals = {
  sessions: number;
  minutes: number;
  kcal: number;
};

// Totals for the calendar week (Mon-based, matching the streak) containing `today`.
export function badmintonWeekTotals(
  sessions: BadmintonSession[],
  today: Date
): BadmintonWeekTotals {
  const target = weekStart(today);
  return sessions
    .filter((s) => weekStart(s.date) === target)
    .reduce<BadmintonWeekTotals>(
      (acc, s) => ({
        sessions: acc.sessions + 1,
        minutes: acc.minutes + s.durationMin,
        kcal: acc.kcal + effectiveKcal(s),
      }),
      { sessions: 0, minutes: 0, kcal: 0 }
    );
}
