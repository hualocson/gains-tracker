import { computeProgressionNudge } from "@/lib/domain/progression";
import { describe, expect, it } from "vitest";

const exercise = {
  id: 2,
  name: "Push-up",
  ladderGroup: "horizontal_push",
  level: 2,
  repTargetSets: 3,
  repTargetReps: 12,
};
const nextExercise = {
  id: 3,
  name: "Diamond Push-up",
  ladderGroup: "horizontal_push",
  level: 3,
};

describe("computeProgressionNudge", () => {
  it("nudges up when target met (3 sets of >=12)", () => {
    const sets = [{ reps: 12 }, { reps: 13 }, { reps: 12 }];
    const r = computeProgressionNudge(sets, exercise, nextExercise);
    expect(r).toEqual({
      shouldNudge: true,
      fromName: "Push-up",
      toName: "Diamond Push-up",
    });
  });

  it("does not nudge when too few qualifying sets", () => {
    const sets = [{ reps: 12 }, { reps: 10 }, { reps: 12 }];
    expect(
      computeProgressionNudge(sets, exercise, nextExercise).shouldNudge
    ).toBe(false);
  });

  it("does not nudge when no next exercise exists (top of ladder)", () => {
    const sets = [{ reps: 20 }, { reps: 20 }, { reps: 20 }];
    expect(computeProgressionNudge(sets, exercise, null).shouldNudge).toBe(
      false
    );
  });
});
