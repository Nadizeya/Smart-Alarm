/**
 * statsStorage.ts
 * ---------------
 * Stores per-user statistics in AsyncStorage under the key `stats_<uid>`.
 *
 * Tracked fields:
 *   alarmsCreated    – total alarms the user has ever created
 *   alarmsCompleted  – alarms dismissed by answering all questions correctly
 *   alarmsSnoozed    – alarms snoozed (answered 1 question in Snooze mode)
 *   questionsCorrect – cumulative correct answers across all alarms
 *   currentStreak    – consecutive days the alarm was completed
 *   bestStreak       – highest streak ever reached
 *   lastCompletedAt  – ISO date string of the last completion
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserStats {
  alarmsCreated: number;
  alarmsCompleted: number;
  alarmsSnoozed: number;
  questionsCorrect: number;
  currentStreak: number;
  bestStreak: number;
  lastCompletedAt: string | null; // ISO date string, e.g. "2026-04-22"
}

const DEFAULT_STATS: UserStats = {
  alarmsCreated: 0,
  alarmsCompleted: 0,
  alarmsSnoozed: 0,
  questionsCorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastCompletedAt: null,
};

// ─── Key helper ───────────────────────────────────────────────────────────────

function storageKey(uid: string): string {
  return `stats_${uid}`;
}

// ─── Load / Save ──────────────────────────────────────────────────────────────

/**
 * Load stats for the given user. Returns defaults if nothing stored yet.
 */
export async function loadStats(uid: string): Promise<UserStats> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(uid));
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch (error) {
    console.error("[statsStorage] loadStats failed:", error);
    return { ...DEFAULT_STATS };
  }
}

/**
 * Persist stats for the given user.
 */
export async function saveStats(uid: string, stats: UserStats): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(uid), JSON.stringify(stats));
  } catch (error) {
    console.error("[statsStorage] saveStats failed:", error);
  }
}

// ─── Updater helpers ──────────────────────────────────────────────────────────

/**
 * Generic helper: load → patch → save.
 */
async function updateStats(
  uid: string,
  patch: (current: UserStats) => Partial<UserStats>
): Promise<UserStats> {
  const current = await loadStats(uid);
  const updated = { ...current, ...patch(current) };
  await saveStats(uid, updated);
  return updated;
}

// ─── Domain events ────────────────────────────────────────────────────────────

/** Call when the user creates a new alarm. */
export async function recordAlarmCreated(uid: string): Promise<UserStats> {
  return updateStats(uid, (s) => ({
    alarmsCreated: s.alarmsCreated + 1,
  }));
}

/** Call when the user correctly answers all questions and dismisses the alarm. */
export async function recordAlarmCompleted(uid: string): Promise<UserStats> {
  return updateStats(uid, (s) => {
    const todayStr = toDateString(new Date());
    const lastStr = s.lastCompletedAt;

    let newStreak = s.currentStreak;

    if (lastStr === null) {
      // First ever completion
      newStreak = 1;
    } else if (lastStr === yesterdayStr()) {
      // Completed yesterday → extend streak
      newStreak = s.currentStreak + 1;
    } else if (lastStr === todayStr) {
      // Already completed today → don't double-count
      newStreak = s.currentStreak;
    } else {
      // Gap > 1 day → reset streak
      newStreak = 1;
    }

    return {
      alarmsCompleted: s.alarmsCompleted + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(s.bestStreak, newStreak),
      lastCompletedAt: todayStr,
    };
  });
}

/** Call when the user snoozes (answers 1 question in Snooze mode). */
export async function recordAlarmSnoozed(uid: string): Promise<UserStats> {
  return updateStats(uid, (s) => ({
    alarmsSnoozed: s.alarmsSnoozed + 1,
  }));
}

/** Call each time the user answers a question correctly. */
export async function recordCorrectAnswer(uid: string): Promise<UserStats> {
  return updateStats(uid, (s) => ({
    questionsCorrect: s.questionsCorrect + 1,
  }));
}

// ─── Derived calculations ─────────────────────────────────────────────────────

/**
 * Success rate = completed / (completed + snoozed) × 100.
 * Returns 0 when no alarms have fired yet.
 */
export function calcSuccessRate(stats: UserStats): number {
  const total = stats.alarmsCompleted + stats.alarmsSnoozed;
  if (total === 0) return 0;
  return Math.round((stats.alarmsCompleted / total) * 100);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateString(d);
}
