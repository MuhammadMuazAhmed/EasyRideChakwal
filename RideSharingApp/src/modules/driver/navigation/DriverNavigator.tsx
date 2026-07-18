import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import { Text, View } from 'react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { IncomingRequestOverlay } from '../screens/IncomingRequestOverlay';
import { ActiveTripScreen } from '../screens/ActiveTripScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { VerificationScreen } from '../screens/VerificationScreen';
import { TripCompletedScreen } from '../screens/TripCompletedScreen';
import { RateRiderScreen } from '../screens/RateRiderScreen';
import { VehicleDetailsScreen } from '../screens/VehicleDetailsScreen';
import { DriverSettingsScreen } from '../screens/DriverSettingsScreen';
import { DriverSupportScreen } from '../screens/DriverSupportScreen';
import { useDriverActiveRideSync } from '../hooks/useDriverActiveRideSync';
import { useIncomingRidesPoller } from '../hooks/useIncomingRidesPoller';
import { useDriverLocationSync } from '../hooks/useDriverLocationSync';
import { DriverRegistrationNavigator } from './DriverRegistrationNavigator';
import { DriverPendingScreen } from '../screens/registration/DriverPendingScreen';

import type { DriverStackParamList, DriverTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<DriverTabParamList>();
const Stack = createNativeStackNavigator<DriverStackParamList>();

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

function DriverTabNavigator() {
  // These hooks must run inside DriverTabNavigator — it is rendered as a screen
  // *within* the DriverStackNavigator, so useNavigation() here correctly resolves
  // to the DriverStack context that contains IncomingRequest, ActiveTrip, etc.
  // Placing them in DriverStackNavigator itself (the creator of the stack) caused
  // useNavigation() to resolve to the parent navigator, which had no such screens.
  useDriverActiveRideSync();
  useIncomingRidesPoller();
  useDriverLocationSync();

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
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Dashboard" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💵" label="Earnings" focused={focused} />
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

function DriverStackNavigator() {
  const driverId = useAuthStore(s => s.driverId);

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={driverId ? 'DriverTabs' : 'DriverRegistrationNavigator'}
    >
      <Stack.Screen name="DriverTabs" component={DriverTabNavigator} />
      <Stack.Screen name="IncomingRequest" component={IncomingRequestOverlay} />
      <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="TripCompleted" component={TripCompletedScreen} />
      <Stack.Screen name="RateRider" component={RateRiderScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="Settings" component={DriverSettingsScreen} />
      <Stack.Screen name="Support" component={DriverSupportScreen} />
      <Stack.Screen name="DriverRegistrationNavigator" component={DriverRegistrationNavigator} />
      <Stack.Screen name="DriverPending" component={DriverPendingScreen} />
    </Stack.Navigator>
  );
}

export function DriverNavigator() {
  return <DriverStackNavigator />;
}
