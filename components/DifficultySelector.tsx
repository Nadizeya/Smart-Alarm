import { Colors } from "@/constants/colors";
import { DifficultyLevel } from "@/constants/types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel;
  onSelect: (difficulty: DifficultyLevel) => void;
}

const DIFFICULTIES: DifficultyLevel[] = ["Easy", "Medium", "Hard"];

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  Easy: Colors.difficultyEasy,
  Medium: Colors.difficultyMedium,
  Hard: Colors.difficultyHard,
};

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Difficulty Level</Text>
      <View style={styles.options}>
        {DIFFICULTIES.map((difficulty) => {
          const isSelected = difficulty === selectedDifficulty;
          return (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.option,
                isSelected && {
                  backgroundColor: DIFFICULTY_COLORS[difficulty],
                  borderColor: DIFFICULTY_COLORS[difficulty],
                },
              ]}
              onPress={() => onSelect(difficulty)}
            >
              <Text
                style={[styles.optionText, isSelected && styles.selectedText]}
              >
                {difficulty}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  options: {
    flexDirection: "row",
    gap: 12,
  },
  option: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.white,
  },
});
