import { computeGainingVerdict } from "@/lib/domain/verdict";
import { describe, expect, it } from "vitest";

const d = (s: string) => new Date(s + "T00:00:00Z");

describe("computeGainingVerdict", () => {
  it("returns insufficient_data with too few logs", () => {
    const r = computeGainingVerdict(
      [{ date: d("2026-06-01"), weightKg: 70 }],
      d("2026-06-09")
    );
    expect(r.state).toBe("insufficient_data");
  });

  it("returns on_track when gaining ~0.4 kg/week", () => {
    const logs = [
      { date: d("2026-05-19"), weightKg: 70.0 },
      { date: d("2026-05-26"), weightKg: 70.4 },
      { date: d("2026-06-02"), weightKg: 70.8 },
      { date: d("2026-06-09"), weightKg: 71.2 },
    ];
    const r = computeGainingVerdict(logs, d("2026-06-09"));
    expect(r.state).toBe("on_track");
    expect(r.kgPerWeek).toBeGreaterThan(0.3);
    expect(r.kgPerWeek).toBeLessThan(0.5);
  });

  it("returns eat_more when flat", () => {
    const logs = [
      { date: d("2026-05-19"), weightKg: 70.0 },
      { date: d("2026-05-26"), weightKg: 70.0 },
      { date: d("2026-06-02"), weightKg: 69.9 },
      { date: d("2026-06-09"), weightKg: 70.0 },
    ];
    expect(computeGainingVerdict(logs, d("2026-06-09")).state).toBe("eat_more");
  });

  it("returns too_fast above 0.7 kg/week", () => {
    const logs = [
      { date: d("2026-05-19"), weightKg: 70.0 },
      { date: d("2026-05-26"), weightKg: 71.0 },
      { date: d("2026-06-02"), weightKg: 72.0 },
      { date: d("2026-06-09"), weightKg: 73.0 },
    ];
    expect(computeGainingVerdict(logs, d("2026-06-09")).state).toBe("too_fast");
  });

  it("ignores logs older than the 21-day window", () => {
    const logs = [
      { date: d("2026-01-01"), weightKg: 60 },
      { date: d("2026-05-26"), weightKg: 70.0 },
      { date: d("2026-06-02"), weightKg: 70.4 },
      { date: d("2026-06-09"), weightKg: 70.8 },
    ];
    const r = computeGainingVerdict(logs, d("2026-06-09"));
    expect(r.state).toBe("on_track");
  });
});
