import { getAllExercises } from "@/lib/repos";

import { WorkoutForm } from "@/components/WorkoutForm";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
  const exercises = await getAllExercises();
  return (
    <main className="mx-auto max-w-md space-y-4 p-5">
      <h1 className="text-2xl font-bold">Log Workout</h1>
      <WorkoutForm
        exercises={exercises.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
        }))}
      />
    </main>
  );
}
