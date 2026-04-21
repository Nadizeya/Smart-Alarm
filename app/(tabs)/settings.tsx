import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { saveStats, UserStats } from "@/utils/statsStorage";
import { loadSoundId, saveSoundId } from "@/utils/soundSettings";
import { ALARM_SOUNDS, SoundOption } from "@/utils/soundFiles";
import { Audio } from "expo-av";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── "Coming Soon" readonly text box ─────────────────────────────────────────

function ComingSoonBox({ label }: { label: string }) {
  return (
    <View style={styles.comingSoonBox}>
      <TextInput
        style={styles.comingSoonInput}
        value={`${label} — Coming soon in version 2`}
        editable={false}
        selectTextOnFocus={false}
      />
    </View>
  );
}

// ─── Sound Picker ─────────────────────────────────────────────────────────────

interface SoundPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

function SoundPicker({ selectedId, onSelect }: SoundPickerProps) {
  const previewRef = useRef<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Stop preview when component unmounts
  useEffect(() => {
    return () => {
      previewRef.current?.stopAsync().then(() => {
        previewRef.current?.unloadAsync();
      });
    };
  }, []);

  const stopPreview = async () => {
    if (previewRef.current) {
      await previewRef.current.stopAsync();
      await previewRef.current.unloadAsync();
      previewRef.current = null;
    }
    setPlayingId(null);
  };

  const handlePreview = async (sound: SoundOption) => {
    // If this sound is already playing, stop it
    if (playingId === sound.id) {
      await stopPreview();
      return;
    }

    // Stop any currently playing preview
    await stopPreview();

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: avSound } = await Audio.Sound.createAsync(
        sound.asset,
        { shouldPlay: true, volume: 0.8 }
      );
      previewRef.current = avSound;
      setPlayingId(sound.id);

      // Auto-stop after 5 seconds
      avSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          stopPreview();
        }
      });
      setTimeout(() => {
        if (previewRef.current) stopPreview();
      }, 5000);
    } catch (e) {
      console.warn("[SoundPicker] Preview failed:", e);
    }
  };

  const handleSelect = async (sound: SoundOption) => {
    await stopPreview();
    onSelect(sound.id);
  };

  return (
    <View style={styles.soundPickerContainer}>
      {ALARM_SOUNDS.map((sound) => {
        const isSelected = sound.id === selectedId;
        const isPlaying = sound.id === playingId;

        return (
          <View key={sound.id} style={styles.soundRow}>
            {/* Play / Stop preview button */}
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={() => handlePreview(sound)}
            >
              <Text style={styles.playButtonText}>{isPlaying ? "⏹" : "▶"}</Text>
            </TouchableOpacity>

            {/* Sound name — tap to select */}
            <TouchableOpacity
              style={styles.soundNameContainer}
              onPress={() => handleSelect(sound)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.soundName,
                  isSelected && styles.soundNameSelected,
                ]}
              >
                {sound.label}
              </Text>
              {isPlaying && (
                <Text style={styles.soundPlaying}>Playing preview…</Text>
              )}
            </TouchableOpacity>

            {/* Checkmark for selected */}
            {isSelected && (
              <Text style={styles.soundCheck}>✓</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { logout, user } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sound selection state
  const [selectedSoundId, setSelectedSoundId] = useState("default");

  // Load user's current sound preference
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      loadSoundId(user.uid).then(setSelectedSoundId);
    }, [user?.uid])
  );

  const handleSoundSelect = async (id: string) => {
    setSelectedSoundId(id);
    if (user?.uid) {
      await saveSoundId(user.uid, id);
    }
  };

  // ── Stat reset ───────────────────────────────────────────────────────────────
  const handleResetStats = () => {
    Alert.alert(
      "Reset Statistics",
      "This will permanently delete all your alarm history and statistics. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            if (!user?.uid) return;
            const blank: UserStats = {
              alarmsCreated: 0,
              alarmsCompleted: 0,
              alarmsSnoozed: 0,
              questionsCorrect: 0,
              currentStreak: 0,
              bestStreak: 0,
              lastCompletedAt: null,
            };
            await saveStats(user.uid, blank);
            Alert.alert("Done", "Statistics have been reset.");
          },
        },
      ],
    );
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  // ── About ─────────────────────────────────────────────────────────────────────
  const handleAbout = () => {
    Alert.alert(
      "Smart Alarm",
      "Version 1.0.0\n\nA brain-challenging alarm app that keeps you sharp!\n\nDeveloped with ❤️ using React Native & Expo",
      [{ text: "OK" }],
    );
  };

  // ── Sections ──────────────────────────────────────────────────────────────────

  const sections = [
    {
      title: "Alarm Settings",
      items: [
        {
          id: "notifications",
          title: "Notifications",
          subtitle: "Receive alarm notifications",
          type: "switch" as const,
          value: notifications,
          onPress: () => setNotifications((v) => !v),
        },
        {
          id: "sound",
          title: "Sound",
          subtitle: "Play alarm sound",
          type: "switch" as const,
          value: soundEnabled,
          onPress: () => setSoundEnabled((v) => !v),
        },
        {
          id: "vibration",
          title: "Vibration",
          subtitle: "Vibrate on alarm",
          type: "switch" as const,
          value: vibration,
          onPress: () => setVibration((v) => !v),
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          id: "email",
          title: "Email",
          subtitle: user?.email ?? "—",
          type: "info" as const,
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          id: "resetStats",
          title: "Reset Statistics",
          subtitle: "Clear all alarm history and stats",
          type: "button" as const,
          icon: "🗑️",
          onPress: handleResetStats,
          danger: true,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "privacy",
          title: "Privacy & Policy",
          type: "button" as const,
          icon: "🔒",
          onPress: () =>
            Alert.alert(
              "Privacy & Policy",
              "Smart Alarm collects only the data needed to provide alarm functionality.\n\nWe store your alarms and statistics locally on your device.\n\nFirebase Authentication is used for account management. No personal data is shared with third parties.\n\nFor questions, contact: privacy@smartalarm.app",
              [{ text: "OK" }],
            ),
        },
        {
          id: "about",
          title: "About",
          type: "button" as const,
          icon: "ℹ️",
          onPress: handleAbout,
        },
      ],
    },
  ];

  // ── Renderers ─────────────────────────────────────────────────────────────────

  const renderItem = (item: (typeof sections)[0]["items"][0]) => {
    if (item.type === "switch") {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {"subtitle" in item && item.subtitle ? (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            ) : null}
          </View>
          <Switch
            value={"value" in item ? item.value : false}
            onValueChange={item.onPress}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={
              "value" in item && item.value
                ? Colors.primaryLight
                : Colors.textSecondary
            }
          />
        </View>
      );
    }

    if (item.type === "info") {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {"subtitle" in item && item.subtitle ? (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            ) : null}
          </View>
        </View>
      );
    }

    const isDanger = "danger" in item && item.danger;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingInfo}>
          <View style={styles.settingTitleRow}>
            {"icon" in item && item.icon ? (
              <Text style={styles.settingIcon}>{item.icon}</Text>
            ) : null}
            <Text
              style={[styles.settingTitle, isDanger && { color: Colors.error }]}
            >
              {item.title}
            </Text>
          </View>
          {"subtitle" in item && item.subtitle ? (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          ) : null}
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* User Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>
            {user?.displayName ?? "Smart User"}
          </Text>
          <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
        </View>

        {/* Settings Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item) => renderItem(item))}
            </View>
          </View>
        ))}

        {/* ── Alarm Sound Picker ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alarm Sound</Text>
          <View style={styles.sectionContent}>
            <View style={styles.soundPickerWrapper}>
              <Text style={styles.soundPickerHint}>
                Tap ▶ to preview · Tap the name to select
              </Text>
              <SoundPicker
                selectedId={selectedSoundId}
                onSelect={handleSoundSelect}
              />
            </View>
          </View>
        </View>

        {/* ── Appearance — theme & password coming soon ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Theme</Text>
                <ComingSoonBox label="Theme customisation" />
              </View>
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <ComingSoonBox label="Password change" />
              </View>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Smart Alarm v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for better mornings</Text>
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
  content: {
    flex: 1,
  },
  // Profile
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: Colors.card,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  // Items
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 6,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: "300",
  },
  // Coming soon
  comingSoonBox: {
    marginTop: 4,
  },
  comingSoonInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  // Sound picker
  soundPickerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  soundPickerHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontStyle: "italic",
  },
  soundPickerContainer: {
    gap: 4,
  },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  playButtonText: {
    fontSize: 13,
    color: Colors.primaryLight,
  },
  soundNameContainer: {
    flex: 1,
  },
  soundName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  soundNameSelected: {
    color: Colors.primaryLight,
    fontWeight: "700",
  },
  soundPlaying: {
    fontSize: 11,
    color: Colors.primaryLight,
    marginTop: 2,
    fontStyle: "italic",
  },
  soundCheck: {
    fontSize: 18,
    color: Colors.primaryLight,
    fontWeight: "700",
  },
  // Logout
  logoutButton: {
    backgroundColor: Colors.error,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
