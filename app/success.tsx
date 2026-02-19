import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MOTIVATIONAL_MESSAGES = [
  "Great job! You're now fully awake! 🌟",
  "Brain activated! Ready to conquer the day! 💪",
  "Well done! Your mind is sharp! 🧠",
  "Success! Time to make today amazing! ✨",
  "Excellent work! You're unstoppable! 🚀",
  "Awesome! Your brain is firing on all cylinders! 🔥",
  "Perfect! You've proven you're awake! 🎯",
  "Outstanding! Now go achieve great things! 🏆",
];

export default function SuccessScreen() {
  const router = useRouter();

  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  const randomMessage =
    MOTIVATIONAL_MESSAGES[
      Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
    ];

  useEffect(() => {
    // Checkmark scale animation
    Animated.spring(scaleAnimation, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Fade in text
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const handleGoHome = () => {
    router.replace("/");
  };

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnimation }] },
          ]}
        >
          <Text style={styles.checkmark}>✓</Text>
        </Animated.View>

        {/* Success Text */}
        <Animated.View style={{ opacity: fadeAnimation }}>
          <Text style={styles.title}>Alarm Dismissed!</Text>
          <Text style={styles.message}>{randomMessage}</Text>
        </Animated.View>

        {/* Spinning Stars Decoration */}
        <View style={styles.starsContainer}>
          <Animated.Text
            style={[
              styles.star,
              { transform: [{ rotate: spin }] },
              { left: 30, top: 20 },
            ]}
          >
            ⭐
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { transform: [{ rotate: spin }] },
              { right: 30, top: 40 },
            ]}
          >
            ✨
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { transform: [{ rotate: spin }] },
              { left: 50, bottom: 30 },
            ]}
          >
            💫
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { transform: [{ rotate: spin }] },
              { right: 50, bottom: 50 },
            ]}
          >
            ⭐
          </Animated.Text>
        </View>

        {/* Stats Card */}
        <Animated.View style={[styles.statsCard, { opacity: fadeAnimation }]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>Today's Date</Text>
          </View>
        </Animated.View>
      </View>

      {/* Return Home Button */}
      <Animated.View
        style={[styles.buttonContainer, { opacity: fadeAnimation }]}
      >
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.success,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  checkmark: {
    fontSize: 72,
    color: Colors.success,
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: Colors.white,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
  },
  starsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: "absolute",
    fontSize: 24,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginTop: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 20,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  homeButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.success,
  },
});
