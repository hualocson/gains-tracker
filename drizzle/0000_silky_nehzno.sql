CREATE TABLE "badminton_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"duration_min" integer NOT NULL,
	"intensity" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bodyweight_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"weight_kg" double precision NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"ladder_group" text NOT NULL,
	"level" integer NOT NULL,
	"rep_target_sets" integer DEFAULT 3 NOT NULL,
	"rep_target_reps" integer DEFAULT 12 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"target_weight_kg" double precision NOT NULL,
	"current_weight_kg" double precision NOT NULL,
	"height_cm" double precision,
	"weekly_workout_goal" integer DEFAULT 3 NOT NULL,
	"surplus_pref" text
);
--> statement-breakpoint
CREATE TABLE "workout_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"set_index" integer NOT NULL,
	"reps" integer NOT NULL,
	"added_weight_kg" double precision
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;