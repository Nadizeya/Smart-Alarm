import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: "switch" | "button" | "info";
  value?: boolean;
  icon?: string;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        // AuthGuard in _layout.tsx detects isAuthenticated → false and
        // redirects to /login automatically. No manual navigation needed.
        onPress: () => logout(),
      },
    ]);
  };

  const handleResetStats = () => {
    Alert.alert(
      "Reset Statistics",
      "This will permanently delete all your alarm history and statistics. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Statistics have been reset");
          },
        },
      ],
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "Smart Alarm",
      "Version 1.0.0\n\nA brain-challenging alarm app that keeps you sharp!\n\nDeveloped with ❤️ using React Native & Expo",
      [{ text: "OK" }],
    );
  };

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
          onPress: () => setNotifications(!notifications),
        },
        {
          id: "sound",
          title: "Sound",
          subtitle: "Play alarm sound",
          type: "switch" as const,
          value: soundEnabled,
          onPress: () => setSoundEnabled(!soundEnabled),
        },
        {
          id: "vibration",
          title: "Vibration",
          subtitle: "Vibrate on alarm",
          type: "switch" as const,
          value: vibration,
          onPress: () => setVibration(!vibration),
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          id: "darkMode",
          title: "Dark Mode",
          subtitle: "Use dark blue theme",
          type: "switch" as const,
          value: darkMode,
          onPress: () => setDarkMode(!darkMode),
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          id: "email",
          title: "Email",
          subtitle: "user@smartalarm.com",
          type: "info" as const,
        },
        {
          id: "changePassword",
          title: "Change Password",
          type: "button" as const,
          icon: "🔑",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "Password change feature will be available soon",
            ),
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          id: "resetStats",
          title: "Reset Statistics",
          subtitle: "Clear all alarm history",
          type: "button" as const,
          icon: "🗑️",
          onPress: handleResetStats,
        },
        {
          id: "export",
          title: "Export Data",
          subtitle: "Download your alarm data",
          type: "button" as const,
          icon: "📥",
          onPress: () =>
            Alert.alert("Coming Soon", "Data export will be available soon"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help & FAQ",
          type: "button" as const,
          icon: "❓",
          onPress: () =>
            Alert.alert("Help", "Visit our website for FAQs and support"),
        },
        {
          id: "feedback",
          title: "Send Feedback",
          type: "button" as const,
          icon: "💬",
          onPress: () =>
            Alert.alert(
              "Feedback",
              "Thank you for your interest! Feedback form coming soon.",
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

  const renderSettingItem = (item: SettingItem) => {
    if (item.type === "switch") {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={item.value ? Colors.primaryLight : Colors.textSecondary}
          />
        </View>
      );
    }

    if (item.type === "info") {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingInfo}>
          <View style={styles.settingTitleRow}>
            {item.icon && <Text style={styles.settingIcon}>{item.icon}</Text>}
            <Text style={styles.settingTitle}>{item.title}</Text>
          </View>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.userName}>Smart User</Text>
          <Text style={styles.userEmail}>user@smartalarm.com</Text>
        </View>

        {/* Settings Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item) => renderSettingItem(item))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Smart Alarm v1.0.0</Text>
          <Text style={styles.footerText}>
            Made with ❤️ for better mornings
          </Text>
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
  content: {
    flex: 1,
  },
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
