import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { AuthNavigator } from "@/auth/navigation/AuthNavigator";
import { RiderNavigator } from "@/rider/navigation/RiderNavigator";
import { DriverNavigator } from "@/driver/navigation/DriverNavigator";
import { RoleSelectionScreen } from "@/auth/screens/RoleSelectionScreen";
import type { RootStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
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

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeRole = useAuthStore((s) => s.activeRole);

  const renderAuthenticatedStack = () => {
    if (activeRole === "rider") {
      return <Stack.Screen name="Rider" component={RiderNavigator} />;
    }
    if (activeRole === "driver") {
      return <Stack.Screen name="Driver" component={DriverNavigator} />;
    }
    // Authenticated but no role selected → show role selection
    return <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />;
  };

  return (
    <NavigationContainer
      theme={navTheme}
      onReady={async () => {
        await SplashScreen.hideAsync();
      }}
    >
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          renderAuthenticatedStack()
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
