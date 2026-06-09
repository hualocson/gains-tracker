export type Intensity = "low" | "med" | "high";

const KCAL_PER_MIN: Record<Intensity, number> = {
  low: 5,
  med: 7,
  high: 9,
};

export function estimateBadmintonKcal(
  durationMin: number,
  intensity: Intensity,
): number {
  return durationMin * KCAL_PER_MIN[intensity];
}
