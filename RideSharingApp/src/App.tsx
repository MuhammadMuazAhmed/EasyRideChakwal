import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme, DarkTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/store/authStore";
import { useActiveTheme } from "@/store/themeStore";
import { syncFcmTokenWithBackend } from "@/shared/services/pushNotifications";
import "./global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export const lightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#F5C400",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#111111",
    border: "#E5E7EB",
    notification: "#F5C400",
  },
};

export const darkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#F5C400",
    background: "#111111",
    card: "#181818",
    text: "#FFFFFF",
    border: "#2E2E2E",
    notification: "#F5C400",
  },
};

function PushNotificationBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeRole = useAuthStore((s) => s.activeRole);

  useEffect(() => {
    if (!isAuthenticated || !activeRole) return;
    void syncFcmTokenWithBackend();
  }, [isAuthenticated, activeRole]);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ['currentRide'] });
      void queryClient.invalidateQueries({ queryKey: ['incomingRequests'], exact: false });
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ['currentRide'] });
      void queryClient.invalidateQueries({ queryKey: ['incomingRequests'], exact: false });
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  return null;
}

function AppContent() {
  const activeTheme = useActiveTheme();
  const isDark = activeTheme === "dark";

  return (
    <NavigationContainer
      theme={isDark ? darkNavTheme : lightNavTheme}
      onReady={async () => {
        await SplashScreen.hideAsync();
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <PushNotificationBootstrap />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


