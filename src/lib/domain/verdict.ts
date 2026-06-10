export type WeightLog = { date: Date; weightKg: number };
export type VerdictState =
  | "insufficient_data"
  | "eat_more"
  | "on_track"
  | "too_fast";

export type Verdict = {
  state: VerdictState;
  kgPerWeek: number | null;
};

const WINDOW_DAYS = 21;
const MIN_LOGS = 3;
const LOWER = 0.2; // kg/week below this -> eat more
const UPPER = 0.7; // kg/week above this -> too fast

const DAY_MS = 86_400_000;

export function computeGainingVerdict(logs: WeightLog[], today: Date): Verdict {
  const cutoff = today.getTime() - WINDOW_DAYS * DAY_MS;
  const recent = logs
    .filter((l) => l.date.getTime() >= cutoff)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (recent.length < MIN_LOGS)
    {return { state: "insufficient_data", kgPerWeek: null };}

  const x = recent.map((l) => l.date.getTime() / DAY_MS);
  const y = recent.map((l) => l.weightKg);
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    den += (x[i] - mx) ** 2;
  }
  const slopePerDay = den === 0 ? 0 : num / den;
  const kgPerWeek = slopePerDay * 7;

  let state: VerdictState;
  if (kgPerWeek < LOWER) {state = "eat_more";}
  else if (kgPerWeek > UPPER) {state = "too_fast";}
  else {state = "on_track";}

  return { state, kgPerWeek };
}
