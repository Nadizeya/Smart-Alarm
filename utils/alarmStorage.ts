/**
 * alarmStorage.ts
 * ----------------
 * Standalone AsyncStorage helpers for per-user alarm persistence.
 * Storage key format: `alarms_<uid>`
 *
 * Each alarm object shape:
 *   { id: string, time: string (ISO), label: string, enabled: boolean, ... }
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alarm } from "@/constants/types";

// ─── Key helper ───────────────────────────────────────────────────────────────

function storageKey(uid: string): string {
  return `alarms_${uid}`;
}

// ─── Core CRUD ────────────────────────────────────────────────────────────────

/**
 * Load all alarms for a given user.
 * Returns an empty array when nothing is stored yet.
 */
export async function loadAlarms(uid: string): Promise<Alarm[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(uid));
    if (!raw) return [];

    const parsed: any[] = JSON.parse(raw);

    // Rehydrate `time` strings → Date objects
    return parsed.map((a) => ({ ...a, time: new Date(a.time) }));
  } catch (error) {
    console.error("[alarmStorage] loadAlarms failed:", error);
    return [];
  }
}

/**
 * Persist an array of alarms for a given user (full overwrite).
 */
export async function saveAlarms(uid: string, alarms: Alarm[]): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(uid), JSON.stringify(alarms));
  } catch (error) {
    console.error("[alarmStorage] saveAlarms failed:", error);
    throw error; // bubble up so callers can show error UI
  }
}

/**
 * Append a new alarm (auto-generates `id`).
 * Returns the updated alarm list.
 */
export async function addAlarm(
  uid: string,
  alarm: Omit<Alarm, "id">
): Promise<Alarm[]> {
  const current = await loadAlarms(uid);

  const newAlarm: Alarm = {
    ...alarm,
    id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
  };

  const updated = [newAlarm, ...current];
  await saveAlarms(uid, updated);
  return updated;
}

/**
 * Delete an alarm by id.
 * Returns the updated alarm list.
 */
export async function deleteAlarm(
  uid: string,
  alarmId: string
): Promise<Alarm[]> {
  const current = await loadAlarms(uid);
  const updated = current.filter((a) => a.id !== alarmId);
  await saveAlarms(uid, updated);
  return updated;
}
