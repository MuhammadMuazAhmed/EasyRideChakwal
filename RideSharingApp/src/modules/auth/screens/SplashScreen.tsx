import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
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
      <Image
        source={require('@/assets/images/logo.jpeg')}
        style={{ width: 80, height: 80, borderRadius: 16 }}
        resizeMode="cover"
      />
      <Text className="mt-4 text-2xl font-black text-white">Easy Ride</Text>
      <Text className="mt-1 text-sm text-white/60">Chakwal</Text>
    </View>
  );
}
