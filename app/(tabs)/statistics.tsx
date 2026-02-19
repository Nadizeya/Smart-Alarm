import { Colors } from "@/constants/colors";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const CARD_MARGIN = 15;

interface AlarmHistoryItem {
  id: string;
  date: string;
  time: string;
  theme: string;
  difficulty: string;
  questionsAnswered: number;
  totalQuestions: number;
  success: boolean;
}

// Mock history data
const HISTORY_DATA: AlarmHistoryItem[] = [
  {
    id: "1",
    date: "Today, Feb 19",
    time: "7:00 AM",
    theme: "Math",
    difficulty: "Medium",
    questionsAnswered: 3,
    totalQuestions: 3,
    success: true,
  },
  {
    id: "2",
    date: "Yesterday, Feb 18",
    time: "7:00 AM",
    theme: "Logic",
    difficulty: "Hard",
    questionsAnswered: 2,
    totalQuestions: 3,
    success: false,
  },
  {
    id: "3",
    date: "Feb 17",
    time: "7:00 AM",
    theme: "English",
    difficulty: "Easy",
    questionsAnswered: 3,
    totalQuestions: 3,
    success: true,
  },
  {
    id: "4",
    date: "Feb 16",
    time: "7:00 AM",
    theme: "Chinese",
    difficulty: "Medium",
    questionsAnswered: 3,
    totalQuestions: 3,
    success: true,
  },
  {
    id: "5",
    date: "Feb 15",
    time: "7:00 AM",
    theme: "Math",
    difficulty: "Hard",
    questionsAnswered: 1,
    totalQuestions: 3,
    success: false,
  },
];

// Stats data
const STATS = {
  totalAlarms: 47,
  successRate: 89,
  currentStreak: 5,
  bestStreak: 12,
  avgWakeTime: "7:15 AM",
  totalQuestions: 156,
};

export default function StatisticsScreen() {
  const [activeCard, setActiveCard] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

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

  const renderHistoryCard = (item: AlarmHistoryItem, index: number) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_MARGIN * 2),
      index * (CARD_WIDTH + CARD_MARGIN * 2),
      (index + 1) * (CARD_WIDTH + CARD_MARGIN * 2),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.historyCard,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardDate}>{item.date}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.success ? Colors.success : Colors.error },
            ]}
          >
            <Text style={styles.statusText}>
              {item.success ? "✓ Dismissed" : "✗ Snoozed"}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.themeRow}>
            <View
              style={[
                styles.themeBadge,
                { backgroundColor: getThemeColor(item.theme) },
              ]}
            >
              <Text style={styles.themeBadgeText}>{item.theme}</Text>
            </View>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Questions Answered</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(item.questionsAnswered / item.totalQuestions) * 100}%`,
                    backgroundColor: item.success
                      ? Colors.success
                      : Colors.error,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {item.questionsAnswered} / {item.totalQuestions}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{STATS.totalAlarms}</Text>
            <Text style={styles.statLabel}>Total Alarms</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {STATS.successRate}%
            </Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {STATS.currentStreak}
            </Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{STATS.bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{STATS.avgWakeTime}</Text>
            <Text style={styles.statLabel}>Avg Wake Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{STATS.totalQuestions}</Text>
            <Text style={styles.statLabel}>Total Questions</Text>
          </View>
        </View>

        {/* Carousel Section */}
        <View style={styles.carouselSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionSubtitle}>
            Swipe to see your alarm history
          </Text>

          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x /
                  (CARD_WIDTH + CARD_MARGIN * 2),
              );
              setActiveCard(index);
            }}
          >
            {HISTORY_DATA.map((item, index) => renderHistoryCard(item, index))}
          </Animated.ScrollView>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {HISTORY_DATA.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeCard === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Weekly Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyChart}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => {
                const height = [85, 100, 90, 100, 95, 70, 80][index];
                const success = [true, true, true, true, true, false, true][
                  index
                ];
                return (
                  <View key={day} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${height}%`,
                            backgroundColor: success
                              ? Colors.success
                              : Colors.error,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{day}</Text>
                  </View>
                );
              },
            )}
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
  },
  statCard: {
    width: "31%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primaryLight,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  carouselSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  carouselContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  historyCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: CARD_MARGIN,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  cardBody: {
    gap: 16,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  themeBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.white,
  },
  difficultyText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressSection: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: Colors.primaryLight,
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
    marginTop: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barContainer: {
    flex: 1,
    width: "70%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 20,
  },
  chartLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});
