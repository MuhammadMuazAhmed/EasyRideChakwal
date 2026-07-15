import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen } from '@/auth/screens/SplashScreen';
import { OnboardingScreen } from '@/auth/screens/OnboardingScreen';
import { LoginScreen } from '@/auth/screens/LoginScreen';
import { PhoneNumberScreen } from '@/auth/screens/PhoneNumberScreen';
import { OtpVerificationScreen } from '@/auth/screens/OtpVerificationScreen';
import type { AuthStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
}
