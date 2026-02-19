import { AlarmCard } from "@/components/AlarmCard";
import { Colors } from "@/constants/colors";
import { Alarm } from "@/constants/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data
const MOCK_ALARMS: Alarm[] = [
  {
    id: "1",
    time: new Date(2026, 1, 20, 7, 0),
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
    theme: "Math",
    difficulty: "Medium",
    mode: "Dismiss",
    label: "Morning Alarm",
  },
  {
    id: "2",
    time: new Date(2026, 1, 20, 14, 30),
    enabled: false,
    repeatDays: [0, 6],
    theme: "English",
    difficulty: "Easy",
    mode: "Snooze",
    label: "Afternoon Nap",
  },
  {
    id: "3",
    time: new Date(2026, 1, 20, 22, 0),
    enabled: true,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    theme: "Logic",
    difficulty: "Hard",
    mode: "Dismiss",
    label: "Bedtime Reminder",
  },
];

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>(MOCK_ALARMS);
  const router = useRouter();

  const handleToggle = (id: string) => {
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm,
      ),
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Alarm", "Are you sure you want to delete this alarm?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setAlarms((prev) => prev.filter((alarm) => alarm.id !== id)),
      },
    ]);
  };

  const handleEdit = (id: string) => {
    router.push({
      pathname: "/create-alarm",
      params: { alarmId: id },
    });
  };

  const handleAddAlarm = () => {
    router.push("/create-alarm");
  };

  const handleTestRinging = () => {
    router.push({
      pathname: "/ringing",
      params: {
        theme: "Math",
        difficulty: "Medium",
        mode: "Dismiss",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Alarms</Text>
        <TouchableOpacity style={styles.testButton} onPress={handleTestRinging}>
          <Text style={styles.testButtonText}>Test 🔔</Text>
        </TouchableOpacity>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⏰</Text>
          <Text style={styles.emptyText}>No alarms yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to create your first alarm
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmCard
              alarm={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddAlarm}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },
  testButton: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: "300",
  },
});
