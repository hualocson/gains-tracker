export type ExerciseTarget = {
  id: number;
  name: string;
  ladderGroup: string;
  level: number;
  repTargetSets: number;
  repTargetReps: number;
};
export type NextExercise = { id: number; name: string } | null;

export type Nudge = {
  shouldNudge: boolean;
  fromName?: string;
  toName?: string;
};

export function computeProgressionNudge(
  sets: { reps: number }[],
  exercise: ExerciseTarget,
  next: NextExercise
): Nudge {
  if (!next) {return { shouldNudge: false };}
  const qualifying = sets.filter(
    (s) => s.reps >= exercise.repTargetReps
  ).length;
  if (qualifying >= exercise.repTargetSets) {
    return { shouldNudge: true, fromName: exercise.name, toName: next.name };
  }
  return { shouldNudge: false };
}
