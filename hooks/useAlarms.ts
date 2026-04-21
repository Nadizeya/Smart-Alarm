/**
 * useAlarms.ts
 * ------------
 * React hook that manages per-user alarm state (AsyncStorage) AND wires each
 * alarm to an OS-level local notification via expo-notifications.
 *
 * When an alarm is created/enabled  → scheduleAlarmNotification()
 * When an alarm is deleted/disabled → cancelAlarmNotification()
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  loadAlarms,
  saveAlarms,
  addAlarm as storageAddAlarm,
  deleteAlarm as storageDeleteAlarm,
} from "@/utils/alarmStorage";
import {
  scheduleAlarmNotification,
  cancelAlarmNotification,
  requestNotificationPermission,
} from "@/utils/alarmScheduler";
import { Alarm } from "@/constants/types";

export function useAlarms() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Request notification permission once when a user is present ──────────────
  useEffect(() => {
    if (uid) {
      requestNotificationPermission();
    }
  }, [uid]);

  // ── Fetch helper (reusable) ──────────────────────────────────────────────────
  const refreshAlarms = async () => {
    if (!uid) {
      setAlarms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await loadAlarms(uid);
      setAlarms(data);
    } finally {
      setLoading(false);
    }
  };

  // ── Load alarms whenever the signed-in user changes ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    if (!uid) {
      setAlarms([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    loadAlarms(uid).then((data) => {
      if (!cancelled) {
        setAlarms(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  // ── Mutations ────────────────────────────────────────────────────────────────

  const addAlarm = async (alarm: Omit<Alarm, "id">) => {
    if (!uid) throw new Error("No authenticated user");

    // 1. Persist first so the alarm gets an id
    const updated = await storageAddAlarm(uid, alarm);
    const newAlarm = updated[0]; // storageAddAlarm prepends

    // 2. Schedule OS notification if enabled
    if (newAlarm.enabled) {
      try {
        const notificationIds = await scheduleAlarmNotification(newAlarm);
        newAlarm.notificationIds = notificationIds;

        // Save the notificationIds back to storage
        await saveAlarms(uid, updated);
      } catch (e) {
        console.warn("[useAlarms] Failed to schedule notification:", e);
      }
    }

    setAlarms(updated);
  };

  const toggleAlarm = async (id: string, enabled: boolean) => {
    if (!uid) return;

    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;

    // Cancel old notifications regardless
    if (alarm.notificationIds?.length) {
      await cancelAlarmNotification(alarm.notificationIds);
    }

    let notificationIds: string[] = [];

    // Schedule new notifications if turning ON
    if (enabled) {
      try {
        notificationIds = await scheduleAlarmNotification({ ...alarm, enabled });
      } catch (e) {
        console.warn("[useAlarms] Failed to schedule notification:", e);
      }
    }

    const updated = alarms.map((a) =>
      a.id === id ? { ...a, enabled, notificationIds } : a
    );
    await saveAlarms(uid, updated);
    setAlarms(updated);
  };

  const deleteAlarm = async (id: string) => {
    if (!uid) return;

    const alarm = alarms.find((a) => a.id === id);

    // Cancel OS notification before deleting
    if (alarm?.notificationIds?.length) {
      await cancelAlarmNotification(alarm.notificationIds);
    }

    const updated = await storageDeleteAlarm(uid, id);
    setAlarms(updated);
  };

  const updateAlarm = async (id: string, updatedData: Omit<Alarm, "id">) => {
    if (!uid) return;

    const alarm = alarms.find((a) => a.id === id);

    // Cancel old notification
    if (alarm?.notificationIds?.length) {
      await cancelAlarmNotification(alarm.notificationIds);
    }

    let notificationIds: string[] = [];

    // Re-schedule if enabled
    if (updatedData.enabled) {
      try {
        notificationIds = await scheduleAlarmNotification({
          ...updatedData,
          id,
        });
      } catch (e) {
        console.warn("[useAlarms] Failed to re-schedule notification:", e);
      }
    }

    const updated = alarms.map((a) =>
      a.id === id ? { ...updatedData, id, notificationIds } : a
    );
    await saveAlarms(uid, updated);
    setAlarms(updated);
  };

  return { alarms, loading, addAlarm, toggleAlarm, deleteAlarm, updateAlarm, refreshAlarms };
}
