import React from 'react';
import { Alert, Linking, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer, TopBar } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'DriverPending'>;

export function DriverPendingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const logout = useAuthStore((s) => s.logout);

  const handleWhatsApp = async () => {
    const url = 'https://wa.me/923100570499';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp application nahi mil saki. Please manual message karein: +92 310 0570499');
      }
    } catch {
      Alert.alert('Error', 'WhatsApp open karne mein masla aaya.');
    }
  };

  

  return (
    <ScreenContainer className="bg-primary justify-between py-6">
      <TopBar title="Account Status" />

      <View className="flex-1 items-center justify-center px-6">
        {/* Large Yellow Success Checkmark */}
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-accent/15 border-2 border-accent">
          <Text className="text-5xl text-accent">✓</Text>
        </View>

        <Text className="mb-3 text-center text-2xl font-black text-white">
          Documents Jama Ho Gaye!
        </Text>
        
        <Text className="mb-8 text-center text-sm text-neutral-400 leading-6 px-3">
          Admin 24-48 ghante mein verify karega. WhatsApp par notification{' '}
          milegi jab account active ho jaye.
        </Text>

        <Button
          title="WhatsApp Support Chat 💬"
          variant="yellow"
          onPress={handleWhatsApp}
          className="w-full py-4 rounded-xl max-w-[280px]"
        />
      </View>

      {/* Spacer to keep footer aligned */}
      <View style={{ flexGrow: 0 }} />

      {/* Logout button at the footer */}
      <View className="px-6 mb-2">
        <Pressable onPress={logout} className="py-3 items-center">
          <Text className="text-neutral-500 text-xs font-bold uppercase tracking-wider">
            Logout 🚪
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
