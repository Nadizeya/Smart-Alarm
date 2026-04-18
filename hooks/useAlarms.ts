import { auth, db } from "@/config/firebase";
import { Alarm } from "@/constants/types";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

// Firestore stores times as Timestamps — convert back to Date for the app
function docToAlarm(id: string, data: Record<string, any>): Alarm {
  return {
    id,
    time: data.time instanceof Timestamp ? data.time.toDate() : new Date(data.time),
    enabled: data.enabled ?? true,
    repeatDays: data.repeatDays ?? [],
    theme: data.theme,
    difficulty: data.difficulty,
    mode: data.mode,
    label: data.label ?? "",
  };
}

function alarmsRef() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  return collection(db, "users", uid, "alarms");
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", uid, "alarms"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((d) => docToAlarm(d.id, d.data()));
      setAlarms(loaded);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Add a new alarm
  const addAlarm = async (alarm: Omit<Alarm, "id">) => {
    await addDoc(alarmsRef(), {
      time: Timestamp.fromDate(alarm.time),
      enabled: alarm.enabled,
      repeatDays: alarm.repeatDays,
      theme: alarm.theme,
      difficulty: alarm.difficulty,
      mode: alarm.mode,
      label: alarm.label ?? "",
      createdAt: serverTimestamp(),
    });
  };

  // Toggle enabled/disabled
  const toggleAlarm = async (id: string, enabled: boolean) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "alarms", id), { enabled });
  };

  // Delete an alarm
  const deleteAlarm = async (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "alarms", id));
  };

  // Update an existing alarm
  const updateAlarm = async (id: string, alarm: Omit<Alarm, "id">) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "alarms", id), {
      time: Timestamp.fromDate(alarm.time),
      enabled: alarm.enabled,
      repeatDays: alarm.repeatDays,
      theme: alarm.theme,
      difficulty: alarm.difficulty,
      mode: alarm.mode,
      label: alarm.label ?? "",
    });
  };

  return { alarms, loading, addAlarm, toggleAlarm, deleteAlarm, updateAlarm };
}
