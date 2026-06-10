// All calendar dates in the app are interpreted in the owner's timezone, so a
// morning weigh-in records on the correct local day (not the previous UTC day).
// Stored dates are `YYYY-MM-DD` and parsed elsewhere as UTC midnight, so the
// domain "today" is represented the same way for consistent week/window math.
export const APP_TIMEZONE = "Asia/Ho_Chi_Minh"; // UTC+7 — change here if you move

// YYYY-MM-DD calendar date in the app timezone. Use for the `date` field when
// logging weights, workouts, and badminton sessions.
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// The same calendar date as a Date at UTC midnight — matches how stored dates
// are parsed in repos.ts, so pass this as `today` to the domain functions.
export function todayDate(now: Date = new Date()): Date {
  return new Date(todayISO(now) + "T00:00:00Z");
}
