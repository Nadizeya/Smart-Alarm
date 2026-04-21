/**
 * soundFiles.ts
 * -------------
 * Central registry of all available alarm sounds.
 *
 * IMPORTANT: Metro bundler requires require() calls to be STATIC (no dynamic
 * strings). All sound files must be listed here with a literal require().
 * When you add a new .wav/.mp3 to assets/sounds/, add an entry here.
 */

export interface SoundOption {
  id: string;       // unique key stored in AsyncStorage
  label: string;    // display name shown in settings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asset: any;       // the result of require()
}

export const ALARM_SOUNDS: SoundOption[] = [
  {
    id: "default",
    label: "Default",
    asset: require("../assets/sounds/alarm.wav"),
  },
  {
    id: "digital",
    label: "Digital",
    asset: require("../assets/sounds/digital.wav"),
  },
  {
    id: "rooster",
    label: "Rooster",
    asset: require("../assets/sounds/rooster.wav"),
  },
  {
    id: "casino",
    label: "Casino",
    asset: require("../assets/sounds/casino_sound.wav"),
  },
];

/** Returns the SoundOption for the given id, falling back to the first entry. */
export function getSoundById(id: string): SoundOption {
  return ALARM_SOUNDS.find((s) => s.id === id) ?? ALARM_SOUNDS[0];
}
