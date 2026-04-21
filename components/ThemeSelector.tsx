import { Colors } from "@/constants/colors";
import { AlarmTheme } from "@/constants/types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ThemeSelectorProps {
  selectedTheme: AlarmTheme;
  onSelect: (theme: AlarmTheme) => void;
}

const THEMES: AlarmTheme[] = ["Math", "Logic", "Chinese", "English"];

const THEME_COLORS: Record<AlarmTheme, string> = {
  Math: Colors.themeMath,
  Logic: Colors.themeLogic,
  Chinese: Colors.themeChinese,
  English: Colors.themeEnglish,
};

const THEME_ICONS: Record<AlarmTheme, string> = {
  Math: "∑",
  Logic: "◆",
  Chinese: "中",
  English: "A",
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Question Theme</Text>
      <View style={styles.options}>
        {THEMES.map((theme) => {
          const isSelected = theme === selectedTheme;
          return (
            <TouchableOpacity
              key={theme}
              style={[
                styles.option,
                isSelected && { backgroundColor: THEME_COLORS[theme] },
              ]}
              onPress={() => onSelect(theme)}
            >
              <Text style={[styles.icon, isSelected && styles.selectedText]}>
                {THEME_ICONS[theme]}
              </Text>
              <Text
                style={[styles.optionText, isSelected && styles.selectedText]}
              >
                {theme}
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  option: {
    flex: 1,
    minWidth: "45%",
    height: 100,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
    color: Colors.textSecondary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.white,
  },
});
