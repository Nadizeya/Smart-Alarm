import { Colors } from "@/constants/colors";
import { Alarm } from "@/constants/types";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const getRepeatDaysText = () => {
    if (alarm.repeatDays.length === 7) return "Every day";
    if (alarm.repeatDays.length === 0) return "Once";
    return alarm.repeatDays.map((day) => DAYS[day]).join(", ");
  };

  return (
    <View style={[styles.container, !alarm.enabled && styles.disabled]}>
      <TouchableOpacity style={styles.content} onPress={() => onEdit(alarm.id)}>
        <View style={styles.leftSection}>
          <Text style={[styles.time, !alarm.enabled && styles.disabledText]}>
            {formatTime(alarm.time)}
          </Text>
          <Text style={[styles.details, !alarm.enabled && styles.disabledText]}>
            {getRepeatDaysText()} • {alarm.theme} • {alarm.difficulty}
          </Text>
          <Text style={[styles.mode, !alarm.enabled && styles.disabledText]}>
            {alarm.mode === "Snooze" ? "1 Question" : "3 Questions"}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Switch
            value={alarm.enabled}
            onValueChange={() => onToggle(alarm.id)}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={
              alarm.enabled ? Colors.primaryLight : Colors.textSecondary
            }
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(alarm.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
  },
  time: {
    fontSize: 32,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  mode: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  disabledText: {
    color: Colors.border,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "500",
  },
});
