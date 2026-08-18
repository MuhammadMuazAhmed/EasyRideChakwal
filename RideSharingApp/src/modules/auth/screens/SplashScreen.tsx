import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/shared/components/common/TopBar';
import { useTheme } from '@/shared/theme';
import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center">
        <Image
          source={require('@/assets/images/logo.jpeg')}
          style={{ width: 80, height: 80, borderRadius: 16 }}
          resizeMode="cover"
        />
        <Text style={{ color: theme.textPrimary }} className="mt-4 text-2xl font-black">
          Easy Ride
        </Text>
        <Text style={{ color: theme.textSecondary }} className="mt-1 text-sm">
          Chakwal
        </Text>
      </View>
    </ScreenContainer>
  );
}
