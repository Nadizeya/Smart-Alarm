import { Colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {current} / {total}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(current / total) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index < current && styles.dotCompleted]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryLight,
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },
});
