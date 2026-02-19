import { Colors } from "@/constants/colors";
import { Question } from "@/constants/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface QuestionCardProps {
  question: Question;
  shake?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  shake,
}) => {
  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "Math":
        return Colors.themeMath;
      case "Logic":
        return Colors.themeLogic;
      case "Chinese":
        return Colors.themeChinese;
      case "English":
        return Colors.themeEnglish;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, shake && styles.shake]}>
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            { backgroundColor: getThemeColor(question.theme) },
          ]}
        >
          <Text style={styles.badgeText}>{question.theme}</Text>
        </View>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{question.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.question}>{question.question}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shake: {
    // Animation would be handled in parent component
    backgroundColor: Colors.error,
    opacity: 0.3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.cardLight,
  },
  difficultyText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  question: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.text,
    lineHeight: 28,
  },
});
