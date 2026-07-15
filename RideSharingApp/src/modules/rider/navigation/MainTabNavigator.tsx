import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { HomeMapScreen } from '@/rider/screens/home/HomeMapScreen';
import { RideHistoryScreen } from '@/rider/screens/history/RideHistoryScreen';
import { ProfileScreen } from '@/rider/screens/profile/ProfileScreen';
import { useActiveRideSync } from '@/rider/hooks/useActiveRideSync';
import type { MainTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View className="items-center py-1">
      <Text className="text-base">{icon}</Text>
      <Text
        className={`text-[9px] ${focused ? 'font-semibold text-primary' : 'text-text-tertiary'}`}
      >
        {label}
      </Text>
      {focused ? <View className="mt-0.5 h-1 w-1 rounded-full bg-accent" /> : null}
    </View>
  );
}

export function MainTabNavigator() {
  // This hook must run inside MainTabNavigator — it is rendered as a screen
  // *within* the RiderNavigator stack, so useNavigation() here correctly resolves
  // to the RiderStack context (DriverTracking, ActiveTrip, TripCompleted, etc.).
  // It was previously in RiderNavigator itself (the creator of that stack),
  // where useNavigation() resolved to the parent root stack — causing all
  // navigation.navigate() calls to silently fail.
  useActiveRideSync();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
          height: 60,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeMapScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={RideHistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🕐" label="History" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
