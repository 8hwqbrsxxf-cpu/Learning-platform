// SM-2 spaced repetition (the algorithm Anki is based on), simplified to four grades.

export type Grade = "again" | "hard" | "good" | "easy";

export interface CardSchedule {
  ease: number; // ease factor, starts at 2.5, floor 1.3
  interval_days: number;
  reps: number; // consecutive successful reviews
  lapses: number;
  due: string; // ISO timestamp
  last_reviewed: string;
}

const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };
const DAY = 86_400_000;

export function newSchedule(now = new Date()): CardSchedule {
  return { ease: 2.5, interval_days: 0, reps: 0, lapses: 0, due: now.toISOString(), last_reviewed: "" };
}

export function review(prev: CardSchedule, grade: Grade, now = new Date()): CardSchedule {
  const q = QUALITY[grade];
  let { ease, interval_days, reps, lapses } = prev;

  if (q < 3) {
    // Failed: relearn tomorrow, keep the ease penalty.
    reps = 0;
    lapses += 1;
    interval_days = 1;
  } else {
    reps += 1;
    if (reps === 1) interval_days = grade === "easy" ? 3 : 1;
    else if (reps === 2) interval_days = grade === "easy" ? 8 : 6;
    else interval_days = Math.round(interval_days * ease * (grade === "hard" ? 0.8 : grade === "easy" ? 1.3 : 1));
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  return {
    ease: Math.round(ease * 100) / 100,
    interval_days,
    reps,
    lapses,
    due: new Date(now.getTime() + interval_days * DAY).toISOString(),
    last_reviewed: now.toISOString(),
  };
}

export function isDue(s: CardSchedule | undefined, now = new Date()): boolean {
  return !s || new Date(s.due).getTime() <= now.getTime();
}

/** Review horizon used for the daily / weekly / monthly review buckets. */
export function bucket(s: CardSchedule | undefined, now = new Date()): "new" | "today" | "week" | "month" | "later" {
  if (!s) return "new";
  const diff = new Date(s.due).getTime() - now.getTime();
  if (diff <= DAY) return "today";
  if (diff <= 7 * DAY) return "week";
  if (diff <= 30 * DAY) return "month";
  return "later";
}
