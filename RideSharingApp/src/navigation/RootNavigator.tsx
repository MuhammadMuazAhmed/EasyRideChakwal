import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthNavigator } from "@/auth/navigation/AuthNavigator";
import { RiderNavigator } from "@/rider/navigation/RiderNavigator";
import { DriverNavigator } from "@/driver/navigation/DriverNavigator";
import { RoleSelectionScreen } from "@/auth/screens/RoleSelectionScreen";
import type { RootStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeRole = useAuthStore((s) => s.activeRole);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        activeRole === "rider" ? (
          <Stack.Screen name="Rider" component={RiderNavigator} />
        ) : activeRole === "driver" ? (
          <Stack.Screen name="Driver" component={DriverNavigator} />
        ) : (
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

