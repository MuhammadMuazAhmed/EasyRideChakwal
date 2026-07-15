import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { syncFcmTokenWithBackend } from '@/shared/services/pushNotifications';
import { ScreenContainer } from '@/shared/components/common/TopBar';

export function RoleSelectionScreen() {
  const switchRole = useAuthStore((s) => s.switchRole);
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async (role: 'rider' | 'driver') => {
    setLoading(true);
    try {
      const res = await switchRole(role);
      if (res.success) {
        void syncFcmTokenWithBackend();
        if (res.needsRegistration) {
          // If they need registration, temporarily set activeRole as driver
          // so the RootNavigator routes them to DriverNavigator, which will
          // show the Verification/Registration screen.
          useAuthStore.setState({ activeRole: 'driver' });
        }
      } else {
        Alert.alert('Role Switch Failed', res.message ?? 'Unknown error');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-white">
      <View className="bg-primary px-4 pb-4 pt-12">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Text className="text-sm font-black text-primary">E</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-white">Easy Ride Chakwal</Text>
            <Text className="text-[10px] text-[#666666]">Apna role select karein</Text>
          </View>
          <Pressable onPress={logout} className="rounded-lg bg-black/20 px-3 py-1.5">
            <Text className="text-[10px] font-bold text-white">Logout 🚪</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-center text-xl font-black text-text-primary">
          Select Your Account Mode
        </Text>
        <Text className="mb-8 text-center text-xs text-text-secondary">
          Aap kis tarah se app use karna chahte hain?
        </Text>

        {loading ? (
          <View className="items-center py-6">
            <ActivityIndicator size="large" color="#F5C400" />
            <Text className="mt-2 text-xs text-text-secondary">Switching account mode...</Text>
          </View>
        ) : (
          <View className="gap-4">
            {/* Rider Mode Button */}
            <Pressable
              onPress={() => void handleSelectRole('rider')}
              className="flex-row items-center rounded-2xl border-[1.5px] border-border bg-white p-5 shadow-sm active:opacity-90"
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
                <Text className="text-3xl">🚗</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text-primary">Rider (سواری)</Text>
                <Text className="text-[10px] text-text-secondary">
                  Ride book karein aur safar karein
                </Text>
              </View>
            </Pressable>

            {/* Driver Mode Button */}
            <Pressable
              onPress={() => void handleSelectRole('driver')}
              className="flex-row items-center rounded-2xl border-[1.5px] border-border bg-white p-5 shadow-sm active:opacity-90"
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Text className="text-3xl">🔑</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text-primary">Driver (ڈرائیور)</Text>
                <Text className="text-[10px] text-text-secondary">
                  Easy Ride ke sath kamayein
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
