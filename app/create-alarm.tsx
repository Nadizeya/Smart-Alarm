import { DifficultySelector } from "@/components/DifficultySelector";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Colors } from "@/constants/colors";
import { AlarmMode, AlarmTheme, DifficultyLevel } from "@/constants/types";
import { useAlarms } from "@/hooks/useAlarms";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CreateAlarmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEdit = !!params.alarmId;
  const { addAlarm } = useAlarms();

  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [theme, setTheme] = useState<AlarmTheme>("Math");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [mode, setMode] = useState<AlarmMode>("Dismiss");
  const [saving, setSaving] = useState(false);

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((day) => day !== dayIndex)
        : [...prev, dayIndex].sort(),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await addAlarm({
        time,
        enabled: true,
        repeatDays: selectedDays,
        theme,
        difficulty,
        mode,
        label: "",
      });
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save alarm. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  const formatTime = () => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={saving}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Alarm" : "New Alarm"}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primaryLight} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Alarm Time</Text>
          <TouchableOpacity
            style={styles.timePicker}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime()}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Repeat Days */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Repeat</Text>
          <View style={styles.daysContainer}>
            {DAYS.map((day, index) => {
              const isSelected = selectedDays.includes(index);
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonSelected,
                  ]}
                  onPress={() => handleDayToggle(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Theme Selector */}
        <View style={styles.section}>
          <ThemeSelector selectedTheme={theme} onSelect={setTheme} />
        </View>

        {/* Difficulty Selector */}
        <View style={styles.section}>
          <DifficultySelector
            selectedDifficulty={difficulty}
            onSelect={setDifficulty}
          />
        </View>

        {/* Mode Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Alarm Mode</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "Snooze" && styles.modeButtonSelected,
              ]}
              onPress={() => setMode("Snooze")}
            >
              <Text style={styles.modeEmoji}>😴</Text>
              <Text
                style={[
                  styles.modeTitle,
                  mode === "Snooze" && styles.modeTextSelected,
                ]}
              >
                Snooze
              </Text>
              <Text
                style={[
                  styles.modeSubtitle,
                  mode === "Snooze" && styles.modeTextSelected,
                ]}
              >
                Answer 1 question
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "Dismiss" && styles.modeButtonSelected,
              ]}
              onPress={() => setMode("Dismiss")}
            >
              <Text style={styles.modeEmoji}>🔥</Text>
              <Text
                style={[
                  styles.modeTitle,
                  mode === "Dismiss" && styles.modeTextSelected,
                ]}
              >
                Dismiss
              </Text>
              <Text
                style={[
                  styles.modeSubtitle,
                  mode === "Dismiss" && styles.modeTextSelected,
                ]}
              >
                Answer 3 questions
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    color: Colors.primaryLight,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  timePicker: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    fontSize: 48,
    fontWeight: "300",
    color: Colors.primaryLight,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  dayButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: Colors.white,
  },
  modeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  modeButtonSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  modeEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modeTextSelected: {
    color: Colors.white,
  },
});
