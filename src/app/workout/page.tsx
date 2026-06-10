import { getAllExercises } from "@/lib/repos";

import { PageHeader } from "@/components/PageHeader";
import { WorkoutForm } from "@/components/WorkoutForm";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
  const exercises = await getAllExercises();
  return (
    <main className="mx-auto max-w-md space-y-6 px-5 pt-5 pb-10">
      <PageHeader title="Workout" eyebrow="Log today" />
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
