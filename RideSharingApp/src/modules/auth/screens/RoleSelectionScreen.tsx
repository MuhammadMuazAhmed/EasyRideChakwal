import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { syncFcmTokenWithBackend } from '@/shared/services/pushNotifications';
import { ScreenContainer } from '@/shared/components/common/TopBar';
import { useTheme } from '@/shared/theme';

export function RoleSelectionScreen() {
  const switchRole = useAuthStore((s) => s.switchRole);
  const logout = useAuthStore((s) => s.logout);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async (role: 'rider' | 'driver') => {
    setLoading(true);
    try {
      const res = await switchRole(role);
      if (res.success) {
        void syncFcmTokenWithBackend();
        if (res.needsRegistration) {
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
    <ScreenContainer>
      <View style={{ backgroundColor: theme.headerBg, borderBottomWidth: 1, borderBottomColor: theme.border }} className="px-4 pb-4 pt-12">
        <View className="flex-row items-center gap-2.5">
          <Image
            source={require('@/assets/images/logo.jpeg')}
            style={{ width: 36, height: 36, borderRadius: 8 }}
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text style={{ color: theme.headerText }} className="text-sm font-bold">Easy Ride Chakwal</Text>
            <Text style={{ color: theme.headerSubtitle }} className="text-[10px]">Apna role select karein</Text>
          </View>
          <Pressable onPress={logout} className="rounded-lg bg-red-500/20 px-3 py-1.5 border border-red-500/30">
            <Text className="text-[10px] font-bold text-red-500">Logout 🚪</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1 justify-center px-6">
        <Text style={{ color: theme.textPrimary }} className="mb-2 text-center text-xl font-black">
          Select Your Account Mode
        </Text>
        <Text style={{ color: theme.textSecondary }} className="mb-8 text-center text-xs">
          Aap kis tarah se app use karna chahte hain?
        </Text>

        {loading ? (
          <View className="items-center py-6">
            <ActivityIndicator size="large" color="#F5C400" />
            <Text style={{ color: theme.textSecondary }} className="mt-2 text-xs">Switching account mode...</Text>
          </View>
        ) : (
          <View className="gap-4">
            {/* Rider Mode Button */}
            <Pressable
              onPress={() => void handleSelectRole('rider')}
              style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
              className="flex-row items-center rounded-2xl border-[1.5px] p-5 shadow-sm active:opacity-90"
            >
              <View style={{ backgroundColor: theme.accentLight }} className="mr-4 h-12 w-12 items-center justify-center rounded-xl">
                <Text className="text-3xl">🚗</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: theme.textPrimary }} className="text-sm font-bold">Rider (سواری)</Text>
                <Text style={{ color: theme.textSecondary }} className="text-[10px]">
                  Ride book karein aur safar karein
                </Text>
              </View>
            </Pressable>

            {/* Driver Mode Button */}
            <Pressable
              onPress={() => void handleSelectRole('driver')}
              style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
              className="flex-row items-center rounded-2xl border-[1.5px] p-5 shadow-sm active:opacity-90"
            >
              <View style={{ backgroundColor: theme.accentLight }} className="mr-4 h-12 w-12 items-center justify-center rounded-xl">
                <Text className="text-3xl">🔑</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: theme.textPrimary }} className="text-sm font-bold">Driver (ڈرائیور)</Text>
                <Text style={{ color: theme.textSecondary }} className="text-[10px]">
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
