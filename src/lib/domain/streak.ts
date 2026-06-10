const DAY_MS = 86_400_000;

function weekStart(date: Date): number {
  const day = date.getUTCDay();
  const mondayOffset = (day + 6) % 7;
  const ms = date.getTime() - mondayOffset * DAY_MS;
  const m = new Date(ms);
  return Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), m.getUTCDate());
}

export function computeWeeklyStreak(
  workoutDates: Date[],
  goal: number,
  today: Date
): number {
  const counts = new Map<number, number>();
  for (const dt of workoutDates) {
    const ws = weekStart(dt);
    counts.set(ws, (counts.get(ws) ?? 0) + 1);
  }

  const currentWeek = weekStart(today);
  let streak = 0;
  let week = currentWeek;
  let isCurrent = true;

  while (true) {
    const count = counts.get(week) ?? 0;
    const hit = count >= goal;
    if (hit) {
      streak += 1;
    } else if (!isCurrent) {
      break;
    }
    week = week - 7 * DAY_MS;
    isCurrent = false;
    if (counts.size === 0) {
      break;
    }
    const earliest = Math.min(...counts.keys());
    if (week < earliest) {
      break;
    }
  }

  return streak;
}
