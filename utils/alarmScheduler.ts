/**
 * alarmScheduler.ts
 * -----------------
 * Wraps expo-notifications to schedule / cancel OS-level local notifications
 * for each alarm. Each alarm gets one notification identifier stored back on
 * the Alarm object as `notificationId`.
 *
 * Flow:
 *   scheduleAlarmNotification(alarm)  → registers with OS, returns notificationId
 *   cancelAlarmNotification(id)       → removes the OS notification
 *   requestNotificationPermission()   → must be called once at app start
 */

import * as Notifications from "expo-notifications";
import { Alarm } from "@/constants/types";

// ─── Notification behaviour while app is foregrounded ────────────────────────
// Show banner + play sound even when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Schedule a local notification for the given alarm.
 * Returns the notification identifier (store it to cancel later).
 *
 * For repeating alarms (repeatDays set) it schedules one notification per
 * selected weekday. For one-off alarms it schedules a single date trigger.
 */
export async function scheduleAlarmNotification(
  alarm: Alarm
): Promise<string[]> {
  const ids: string[] = [];

  const content: Notifications.NotificationContentInput = {
    title: "⏰ Wake Up!",
    body: alarm.label?.trim() ? alarm.label : "Time to wake up!",
    sound: "default.wav", // must match a filename declared in app.json plugins → sounds
    data: {
      alarmId: alarm.id,
      theme: alarm.theme,
      difficulty: alarm.difficulty,
      mode: alarm.mode,
    },
    // Keep notification alive until user taps it
    sticky: true,
    // ── Android: launch the app as a full-screen overlay over the lock screen ──
    // Requires USE_FULL_SCREEN_INTENT permission in app.json.
    // On Android 12+, the OS may show a heads-up banner instead, but the app
    // still launches immediately when the screen turns on.
    android: {
      fullScreenIntent: {
        // Launching to the app's main activity will trigger our
        // getLastNotificationResponseAsync cold-start handler in _layout.tsx
        channelId: "alarm",
      },
      priority: "max",
      sticky: true,
      vibrationPattern: [0, 500, 200, 500],
    },
  };

  const alarmTime = new Date(alarm.time);
  const hours = alarmTime.getHours();
  const minutes = alarmTime.getMinutes();

  if (alarm.repeatDays && alarm.repeatDays.length > 0) {
    // Schedule one repeating weekly notification per selected day
    for (const weekday of alarm.repeatDays) {
      // expo-notifications uses 1=Sunday … 7=Saturday
      const expoDayOfWeek = weekday + 1; // our 0-indexed Sun=0 → expo 1-indexed

      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: expoDayOfWeek,
          hour: hours,
          minute: minutes,
        },
      });
      ids.push(id);
    }
  } else {
    // One-time alarm — fire at the next occurrence of this time
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
    ids.push(id);
  }

  return ids;
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * Cancel one or more scheduled notification identifiers.
 */
export async function cancelAlarmNotification(
  notificationIds: string[]
): Promise<void> {
  await Promise.all(
    notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id)
    )
  );
}

/**
 * Cancel ALL scheduled notifications (e.g. on logout).
 */
export async function cancelAllAlarmNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
