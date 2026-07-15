import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PersonalDetailsScreen } from '../screens/registration/PersonalDetailsScreen';
import { SelfieScreen } from '../screens/registration/SelfieScreen';
import { CnicScreen } from '../screens/registration/CnicScreen';
import { LicenseScreen } from '../screens/registration/LicenseScreen';
import { VehicleDetailsScreen } from '../screens/registration/VehicleDetailsScreen';
import { VehicleRegScreen } from '../screens/registration/VehicleRegScreen';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<DriverRegistrationStackParamList>();

export function DriverRegistrationNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
      <Stack.Screen name="Selfie" component={SelfieScreen} />
      <Stack.Screen name="Cnic" component={CnicScreen} />
      <Stack.Screen name="License" component={LicenseScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="VehicleReg" component={VehicleRegScreen} />
    </Stack.Navigator>
  );
}
