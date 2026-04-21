import { Colors } from "@/constants/colors";
import { useStats } from "@/hooks/useStats";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Stat card component ──────────────────────────────────────────────────────

interface StatCardProps {
  value: string | number;
  label: string;
  valueColor?: string;
  emoji: string;
}

function StatCard({ value, label, valueColor, emoji }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Row stat (for the summary section) ───────────────────────────────────────

interface StatRowProps {
  label: string;
  value: string | number;
  emoji: string;
}

function StatRow({ label, value, emoji }: StatRowProps) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function StatisticsScreen() {
  const { stats, loading, successRate, refreshStats } = useStats();

  // Reload stats every time this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [])
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  // ── No data yet ────────────────────────────────────────────────────────────
  const hasData =
    stats !== null &&
    (stats.alarmsCreated > 0 ||
      stats.alarmsCompleted > 0 ||
      stats.alarmsSnoozed > 0);

  if (!hasData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtext}>
            Create and complete alarms to start tracking your progress.
          </Text>
        </View>
      </View>
    );
  }

  // ── Real data ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Top stat grid ── */}
        <View style={styles.gridSection}>
          <StatCard
            emoji="⏰"
            value={stats!.alarmsCreated}
            label="Alarms Created"
          />
          <StatCard
            emoji="✅"
            value={stats!.alarmsCompleted}
            label="Completed"
            valueColor={Colors.success}
          />
          <StatCard
            emoji="😴"
            value={stats!.alarmsSnoozed}
            label="Snoozed"
            valueColor={Colors.warning}
          />
          <StatCard
            emoji="🎯"
            value={`${successRate}%`}
            label="Success Rate"
            valueColor={successRate >= 70 ? Colors.success : Colors.error}
          />
          <StatCard
            emoji="🔥"
            value={stats!.currentStreak}
            label="Current Streak"
            valueColor={Colors.warning}
          />
          <StatCard
            emoji="🏆"
            value={stats!.bestStreak}
            label="Best Streak"
          />
        </View>

        {/* ── Summary section ── */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.summaryCard}>
            <StatRow
              emoji="💡"
              label="Questions Correct"
              value={stats!.questionsCorrect}
            />
            <View style={styles.divider} />
            <StatRow
              emoji="📅"
              label="Last Completed"
              value={
                stats!.lastCompletedAt
                  ? new Date(stats!.lastCompletedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )
                  : "—"
              }
            />
            <View style={styles.divider} />
            <StatRow
              emoji="📈"
              label="Total Alarms Fired"
              value={stats!.alarmsCompleted + stats!.alarmsSnoozed}
            />
          </View>
        </View>

        {/* ── Success rate visual ── */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Success Rate</Text>
          <View style={styles.summaryCard}>
            <View style={styles.rateRow}>
              <Text style={styles.rateNumber}>{successRate}%</Text>
              <Text style={styles.rateLabel}>
                {successRate >= 80
                  ? "Excellent! 🌟"
                  : successRate >= 60
                  ? "Good job! 👍"
                  : successRate >= 40
                  ? "Keep going! 💪"
                  : "Just getting started! 🚀"}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${successRate}%`,
                    backgroundColor:
                      successRate >= 70 ? Colors.success : Colors.warning,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelText}>
                ✅ {stats!.alarmsCompleted} dismissed
              </Text>
              <Text style={styles.progressLabelText}>
                😴 {stats!.alarmsSnoozed} snoozed
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
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
  // Empty state
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  // Stat grid
  gridSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 10,
  },
  statCard: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primaryLight,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  // Summary section
  summarySection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  // Success rate bar
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  rateNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.primaryLight,
  },
  rateLabel: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressLabelText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
