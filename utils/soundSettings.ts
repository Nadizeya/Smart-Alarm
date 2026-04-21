/**
 * soundSettings.ts
 * ----------------
 * Persists the user's chosen alarm sound ID in AsyncStorage.
 * Key: `sound_<uid>`
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_SOUND_ID = "default";

function storageKey(uid: string): string {
  return `sound_${uid}`;
}

export async function loadSoundId(uid: string): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(storageKey(uid));
    return stored ?? DEFAULT_SOUND_ID;
  } catch {
    return DEFAULT_SOUND_ID;
  }
}

export async function saveSoundId(uid: string, soundId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(uid), soundId);
  } catch (error) {
    console.error("[soundSettings] saveSoundId failed:", error);
  }
}
