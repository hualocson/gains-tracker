import {
  date,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
} from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  targetWeightKg: doublePrecision("target_weight_kg").notNull(),
  currentWeightKg: doublePrecision("current_weight_kg").notNull(),
  heightCm: doublePrecision("height_cm"),
  weeklyWorkoutGoal: integer("weekly_workout_goal").notNull().default(3),
  surplusPref: text("surplus_pref"),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  ladderGroup: text("ladder_group").notNull(),
  level: integer("level").notNull(),
  repTargetSets: integer("rep_target_sets").notNull().default(3),
  repTargetReps: integer("rep_target_reps").notNull().default(12),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  note: text("note"),
});

export const workoutSets = pgTable("workout_sets", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  setIndex: integer("set_index").notNull(),
  reps: integer("reps").notNull(),
  addedWeightKg: doublePrecision("added_weight_kg"),
});

export const bodyweightLogs = pgTable("bodyweight_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  weightKg: doublePrecision("weight_kg").notNull(),
  note: text("note"),
});

export const badmintonSessions = pgTable("badminton_sessions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  durationMin: integer("duration_min").notNull(),
  intensity: text("intensity").notNull(),
});
