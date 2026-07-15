import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/shared/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

export function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-primary">
        <Text className="text-5xl">🚗</Text>
      </View>
      <Text className="mb-2 text-center text-2xl font-black text-text-primary">
        Easy Ride Chakwal
      </Text>
      <Text className="mb-8 text-center text-sm text-text-secondary">
        Apne shehar mein sab se safe aur fast ride service
      </Text>
      <Button
        title="Shuru Karein →"
        variant="yellow"
        onPress={() => navigation.navigate('PhoneNumber')}
      />
    </View>
  );
}
