import { describe, it, expect } from "vitest";
import { computeWeeklyStreak } from "@/lib/domain/streak";

const d = (s: string) => new Date(s + "T00:00:00Z");

describe("computeWeeklyStreak", () => {
  it("counts the current week when goal already met", () => {
    const dates = [d("2026-06-08"), d("2026-06-09"), d("2026-06-09")];
    expect(computeWeeklyStreak(dates, 3, d("2026-06-09"))).toBe(1);
  });

  it("does not break streak when current week not yet met", () => {
    const dates = [
      d("2026-06-08"),
      d("2026-06-01"), d("2026-06-03"), d("2026-06-05"),
    ];
    expect(computeWeeklyStreak(dates, 3, d("2026-06-09"))).toBe(1);
  });

  it("counts multiple consecutive completed weeks", () => {
    const dates = [
      d("2026-06-08"), d("2026-06-09"), d("2026-06-09"),
      d("2026-06-01"), d("2026-06-03"), d("2026-06-05"),
      d("2026-05-25"), d("2026-05-27"), d("2026-05-29"),
    ];
    expect(computeWeeklyStreak(dates, 3, d("2026-06-09"))).toBe(3);
  });

  it("stops at the first completed week that missed the goal", () => {
    const dates = [
      d("2026-06-08"), d("2026-06-09"), d("2026-06-09"),
      d("2026-06-01"), d("2026-06-03"),
      d("2026-05-25"), d("2026-05-27"), d("2026-05-29"),
    ];
    expect(computeWeeklyStreak(dates, 3, d("2026-06-09"))).toBe(1);
  });

  it("returns 0 when nothing logged", () => {
    expect(computeWeeklyStreak([], 3, d("2026-06-09"))).toBe(0);
  });
});
