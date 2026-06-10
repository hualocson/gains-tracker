import { estimateBadmintonKcal } from "@/lib/domain/badminton";
import { describe, expect, it } from "vitest";

describe("estimateBadmintonKcal", () => {
  it("low intensity ~5 kcal/min", () => {
    expect(estimateBadmintonKcal(60, "low")).toBe(300);
  });
  it("med intensity ~7 kcal/min", () => {
    expect(estimateBadmintonKcal(60, "med")).toBe(420);
  });
  it("high intensity ~9 kcal/min", () => {
    expect(estimateBadmintonKcal(30, "high")).toBe(270);
  });
});
