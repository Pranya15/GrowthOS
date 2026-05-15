import { ActivityRecord } from "@/lib/models";

function isActiveDay(entry: ActivityRecord) {
  return entry.completedTopics > 0 || entry.consistency > 50 || entry.productivity > 50;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function minusDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
}

export function calculateActivityStreak(activity: ActivityRecord[]) {
  const activeDates = Array.from(new Set(activity.filter(isActiveDay).map((entry) => entry.date))).sort((a, b) => b.localeCompare(a));

  if (activeDates.length === 0) {
    return 0;
  }

  const today = toDateKey(new Date());
  const yesterday = toDateKey(minusDays(new Date(), 1));
  const latestDate = activeDates[0];

  if (latestDate !== today && latestDate !== yesterday) {
    return 0;
  }

  let streak = 1;
  let cursor = parseDateKey(latestDate);

  for (let index = 1; index < activeDates.length; index += 1) {
    const expected = toDateKey(minusDays(cursor, 1));
    if (activeDates[index] !== expected) {
      break;
    }
    streak += 1;
    cursor = parseDateKey(activeDates[index]);
  }

  return streak;
}
