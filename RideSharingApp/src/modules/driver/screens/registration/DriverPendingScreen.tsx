import React, { useState } from 'react';
import { Alert, Linking, Text, View, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer, TopBar } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { apiClient } from '@/api/axios';
import { AuthService } from '@/api/services/authService';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import { useAuthStore } from '@/store/authStore';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'DriverPending'>;

export function DriverPendingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const driverId = useDriverRegistrationStore((s) => s.driverId);
  const clearRegistrationStore = useDriverRegistrationStore((s) => s.clear);
  const logout = useAuthStore((s) => s.logout);

  const [skipping, setSkipping] = useState(false);

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

  const handleSkipVerification = async () => {
    if (!driverId) {
      Alert.alert('Testing Error', 'Driver ID missing. Clean build refresh karein.');
      return;
    }

    setSkipping(true);
    try {
      // POST /api/drivers/:id/verify with body { action: "approve" }
      await apiClient.post(`/drivers/${driverId}/verify`, { action: 'approve' });

      // 🔑 Exchange the stale temp token for a permanent one.
      // The temp token has userId = "temp_+92..." which isTempToken() catches.
      // switchRole looks up the driver by phone (encoded in the token) and issues a real JWT.
      const switchResult = await AuthService.switchRole('driver');
      if (switchResult.success && switchResult.token) {
        useAuthStore.setState({
          token: switchResult.token,
          activeRole: 'driver',
          driverId,
        });
      } else {
        // Fallback: at least update the role and driverId even if token swap fails
        useAuthStore.setState({ activeRole: 'driver', driverId });
      }

      clearRegistrationStore();

      Alert.alert('Success', 'Verification bypassed! Dashboard par ja rahe hain.', [
        {
          text: 'Ok',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'DriverTabs' as any }],
            });
          },
        },
      ]);
    } catch {
      Alert.alert(
        'Bypass Failed',
        'Verification skip karne mein masla aaya.'
      );
    } finally {
      setSkipping(false);
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

      {/* Development Bypassing Card */}
      {__DEV__ && (
        <View className="mx-6 mb-4 rounded-2xl border border-accent bg-[#1C1A11] p-5">
          <Text className="text-xs font-black uppercase tracking-wider text-accent mb-1">
            ⚠️ TESTING MODE
          </Text>
          <Text className="text-[11px] text-neutral-400 mb-4">
            Skip verification (dev only) — click below to simulate admin approval.
          </Text>
          {skipping ? (
            <ActivityIndicator size="small" color="#F5C400" />
          ) : (
            <Button
              title="[Skip and Go to Dashboard]"
              variant="outline"
              onPress={handleSkipVerification}
              className="border-accent/40 bg-accent/5 py-3 rounded-xl"
              textClassName="text-accent text-xs font-bold"
            />
          )}
        </View>
      )}

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
