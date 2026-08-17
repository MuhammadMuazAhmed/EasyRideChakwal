import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/store/authStore";
import { syncFcmTokenWithBackend } from "@/shared/services/pushNotifications";
import "./global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#F5C400",
    background: "#F5F5F5",
    card: "#111111",
    text: "#FFFFFF",
    border: "#E5E5E5",
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

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer
            theme={navTheme}
            onReady={async () => {
              await SplashScreen.hideAsync();
            }}
          >
            <StatusBar style="light" />
            <PushNotificationBootstrap />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

