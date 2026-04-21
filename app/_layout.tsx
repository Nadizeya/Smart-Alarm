import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import * as Notifications from "expo-notifications";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// Keep the native splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

// ─── Notification tap handler ─────────────────────────────────────────────────
// Must be registered outside of any component so it catches taps even when the
// app is launched cold from a notification.
function NotificationHandler() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Helper to navigate to ringing with notification data
  const navigateToRinging = (data: {
    alarmId?: string;
    theme?: string;
    difficulty?: string;
    mode?: string;
  }) => {
    router.push({
      pathname: "/ringing",
      params: {
        alarmId: data.alarmId ?? "",
        theme: data.theme ?? "Math",
        difficulty: data.difficulty ?? "Medium",
        mode: data.mode ?? "Dismiss",
      },
    });
  };

  // ── Cold-start handler ────────────────────────────────────────────────────
  // Fires when the app was completely killed and launched via a notification
  // (tap or fullScreenIntent). We must wait for auth to resolve first.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data as {
        alarmId?: string;
        theme?: string;
        difficulty?: string;
        mode?: string;
      };
      if (data?.alarmId) {
        navigateToRinging(data);
      }
    });
  }, [isAuthenticated, isLoading]);

  // ── Live listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    // Fired when the user taps a notification (app in background)
    const tapSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          alarmId?: string;
          theme?: string;
          difficulty?: string;
          mode?: string;
        };
        navigateToRinging(data);
      }
    );

    // Fired when a notification arrives while the app is in the FOREGROUND
    const fgSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as {
          alarmId?: string;
          theme?: string;
          difficulty?: string;
          mode?: string;
        };
        navigateToRinging(data);
      }
    );

    return () => {
      tapSub.remove();
      fgSub.remove();
    };
  }, []);

  return null;
}


// ─── Auth guard ───────────────────────────────────────────────────────────────
// Separated so it can use useAuth() which requires AuthProvider to be a parent
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inProtectedGroup =
      segments[0] === "(tabs)" ||
      segments[0] === "create-alarm" ||
      segments[0] === "ringing" ||
      segments[0] === "success";

    if (!isAuthenticated && inProtectedGroup) {
      router.replace("/login");
    } else if (isAuthenticated && segments[0] === "login") {
      router.replace("/(tabs)");
    } else if (!isAuthenticated && segments.length === 0) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

// ─── Splash controller ────────────────────────────────────────────────────────
// Must be inside AuthProvider so it can call useAuth()
function SplashController() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}

// ─── Root layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SplashController />
        <AuthGuard />
        <NotificationHandler />
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="create-alarm" options={{ headerShown: false }} />
          <Stack.Screen
            name="ringing"
            options={{
              headerShown: false,
              gestureEnabled: false,
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="success"
            options={{
              headerShown: false,
              gestureEnabled: false,
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

