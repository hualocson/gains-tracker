import { config } from "dotenv";
config({ path: ".env.local" });

// Dynamic import AFTER env is loaded — ESM hoists static imports above the
// config() call, and ./client calls neon(DATABASE_URL) at module-eval time.
const { db } = await import("./client");
const { exercises } = await import("./schema");

const LADDERS: { group: string; category: string; names: string[] }[] = [
  { group: "horizontal_push", category: "push", names: ["Knee Push-up", "Push-up", "Diamond Push-up", "Archer Push-up", "One-arm Push-up"] },
  { group: "vertical_push", category: "push", names: ["Pike Push-up", "Elevated Pike Push-up", "Wall Handstand Push-up"] },
  { group: "horizontal_pull", category: "pull", names: ["Incline Row", "Inverted Row", "Wide Inverted Row"] },
  { group: "vertical_pull", category: "pull", names: ["Negative Pull-up", "Pull-up", "Archer Pull-up", "One-arm Pull-up Progression"] },
  { group: "squat", category: "legs", names: ["Bodyweight Squat", "Split Squat", "Bulgarian Split Squat", "Assisted Pistol Squat", "Pistol Squat"] },
  { group: "core", category: "core", names: ["Plank", "Leg Raises", "Hanging Knee Raise", "Hanging Leg Raise"] },
];

const rows = LADDERS.flatMap((l) =>
  l.names.map((name, i) => ({
    name,
    category: l.category,
    ladderGroup: l.group,
    level: i + 1,
    repTargetSets: 3,
    repTargetReps: 12,
  })),
);

await db.delete(exercises);
await db.insert(exercises).values(rows);
console.log(`Seeded ${rows.length} exercises`);
process.exit(0);
