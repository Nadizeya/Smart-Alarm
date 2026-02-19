import { ProgressIndicator } from "@/components/ProgressIndicator";
import { QuestionCard } from "@/components/QuestionCard";
import { Colors } from "@/constants/colors";
import {
  AlarmMode,
  AlarmTheme,
  DifficultyLevel,
  Question,
} from "@/constants/types";
import { useMockQuestion } from "@/hooks/useMockQuestion";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RingingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const theme = (params.theme as AlarmTheme) || "Math";
  const difficulty = (params.difficulty as DifficultyLevel) || "Medium";
  const mode = (params.mode as AlarmMode) || "Dismiss";

  const questionsRequired = mode === "Snooze" ? 1 : 3;

  const { generateQuestion, checkAnswer } = useMockQuestion();

  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    generateQuestion(theme, difficulty),
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [shake, setShake] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulsing animation for time
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const triggerShake = () => {
    setShake(true);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => setShake(false));
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      Alert.alert("Empty Answer", "Please enter an answer");
      return;
    }

    const isCorrect = checkAnswer(userAnswer, currentQuestion.correctAnswer);

    if (isCorrect) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      setUserAnswer("");

      if (newCorrectCount >= questionsRequired) {
        // All questions answered correctly
        router.replace("/success");
      } else {
        // Generate next question
        setCurrentQuestion(generateQuestion(theme, difficulty));
      }
    } else {
      // Wrong answer - shake animation
      triggerShake();
      Alert.alert(
        "Incorrect Answer",
        `The correct answer was: ${currentQuestion.correctAnswer}`,
        [
          {
            text: "Try Again",
            onPress: () => {
              setUserAnswer("");
              setCurrentQuestion(generateQuestion(theme, difficulty));
            },
          },
        ],
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Animated Time Display */}
        <Animated.View
          style={[
            styles.timeContainer,
            { transform: [{ scale: pulseAnimation }] },
          ]}
        >
          <Text style={styles.alarmIcon}>⏰</Text>
          <Text style={styles.timeText}>{getCurrentTime()}</Text>
          <Text style={styles.wakeUpText}>Wake Up!</Text>
        </Animated.View>

        {/* Progress Indicator */}
        <ProgressIndicator current={correctCount} total={questionsRequired} />

        {/* Question Card */}
        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          <QuestionCard question={currentQuestion} shake={shake} />
        </Animated.View>

        {/* Answer Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your answer here..."
            placeholderTextColor="#999"
            value={userAnswer}
            onChangeText={setUserAnswer}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          {mode === "Snooze"
            ? "Answer correctly to snooze"
            : `Answer ${questionsRequired} questions to dismiss`}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.error,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  timeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  alarmIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 56,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 8,
  },
  wakeUpText: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: Colors.black,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.error,
  },
  infoText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.white,
    textAlign: "center",
    opacity: 0.9,
  },
});
