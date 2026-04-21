/**
 * useAlarms.ts
 * ------------
 * React hook that provides per-user alarm state backed by AsyncStorage.
 *
 * Relies on useAuth() for the current user's uid so it always has the correct
 * uid even while Firebase Auth is still restoring its session on native.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  loadAlarms,
  saveAlarms,
  addAlarm as storageAddAlarm,
  deleteAlarm as storageDeleteAlarm,
} from "@/utils/alarmStorage";
import { Alarm } from "@/constants/types";

export function useAlarms() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

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

    const updated = await storageAddAlarm(uid, alarm);
    setAlarms(updated);
  };

  const toggleAlarm = async (id: string, enabled: boolean) => {
    if (!uid) return;

    const updated = alarms.map((a) => (a.id === id ? { ...a, enabled } : a));
    await saveAlarms(uid, updated);
    setAlarms(updated);
  };

  const deleteAlarm = async (id: string) => {
    if (!uid) return;

    const updated = await storageDeleteAlarm(uid, id);
    setAlarms(updated);
  };

  const updateAlarm = async (id: string, updatedData: Omit<Alarm, "id">) => {
    if (!uid) return;

    const updated = alarms.map((a) =>
      a.id === id ? { ...updatedData, id } : a
    );
    await saveAlarms(uid, updated);
    setAlarms(updated);
  };

  return { alarms, loading, addAlarm, toggleAlarm, deleteAlarm, updateAlarm, refreshAlarms };
}
