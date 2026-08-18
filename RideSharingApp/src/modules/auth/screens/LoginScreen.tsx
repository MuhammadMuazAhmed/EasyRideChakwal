import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/shared/components/common/TopBar';
import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

/**
 * Login — thin redirect layer. The actual login UI lives in PhoneNumberScreen.
 */
export function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    navigation.replace('PhoneNumber');
  }, [navigation]);

  return <ScreenContainer />;
}
