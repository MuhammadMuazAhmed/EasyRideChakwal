import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <View className="h-20 w-20 items-center justify-center rounded-2xl bg-accent">
        <Text className="text-4xl font-black text-primary">E</Text>
      </View>
      <Text className="mt-4 text-2xl font-black text-white">Easy Ride</Text>
      <Text className="mt-1 text-sm text-white/60">Chakwal</Text>
    </View>
  );
}
