import React from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { useDriverStore } from '@/modules/driver/store/driverStore';
import { DriverService } from '@/modules/driver/services/driverService';
import { TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/theme';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export function EarningsScreen() {
  const { theme } = useTheme();
  const driverProfile = useDriverStore((s) => s.driverProfile);
  const setDriverProfile = useDriverStore((s) => s.setDriverProfile);

  const walletBalance = driverProfile?.walletBalance ?? 0;
  const totalEarnings = driverProfile?.totalEarnings ?? 0;
  const weeklyEarnings = driverProfile?.weeklyEarnings ?? 0;

  useFocusEffect(
    React.useCallback(() => {
      void DriverService.getProfile()
        .then(setDriverProfile)
        .catch(() => {});
    }, [setDriverProfile]),
  );

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.driverRideHistory(1),
    queryFn: () => DriverService.getCompletedRides(1, 20),
  });

  const trips = data?.rides ?? [];

  const handleWithdraw = () => {
    Alert.alert(
      'Coming Soon',
      'Wallet withdrawal abhi backend par available nahi hai. Aapki earnings in-app wallet mein save rehti hain.',
    );
  };

  return (
    <ScreenContainer>
      <TopBar title="My Earnings" />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl bg-black p-5 shadow-md border border-neutral-800">
          <Text className="text-xs font-bold text-accent">WALLET BALANCE</Text>
          <Text className="my-1 text-3xl font-black text-white">PKR {walletBalance}</Text>
          <Text className="mb-4 text-[10px] text-white/50">
            Weekly earnings automatically clear every Monday
          </Text>

          <Button title="Withdraw to Wallet" variant="yellow" onPress={handleWithdraw} />
        </View>

        <View className="mt-6 flex-row gap-4">
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="flex-1 rounded-2xl border p-4"
          >
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase">Weekly Earnings</Text>
            <Text style={{ color: theme.textPrimary }} className="mt-1 text-lg font-black">PKR {weeklyEarnings}</Text>
          </View>
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="flex-1 rounded-2xl border p-4"
          >
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase">Total Earnings</Text>
            <Text style={{ color: theme.textPrimary }} className="mt-1 text-lg font-black">PKR {totalEarnings}</Text>
          </View>
        </View>

        <Text style={{ color: theme.textPrimary }} className="mb-4 mt-8 text-sm font-bold">Trip History</Text>

        {isLoading ? (
          <ActivityIndicator size="small" color="#F5C400" className="py-6" />
        ) : trips.length === 0 ? (
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="mb-8 items-center rounded-xl border border-dashed py-8"
          >
            <Text style={{ color: theme.textMuted }} className="text-[11px]">Abhi koi completed trip nahi</Text>
          </View>
        ) : (
          <View className="mb-8 gap-3">
            {trips.map((trip) => (
              <View
                key={trip.id}
                style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
                className="flex-row items-center justify-between rounded-xl border p-4"
              >
                <View className="mr-3 flex-1">
                  <Text style={{ color: theme.textPrimary }} className="text-xs font-bold" numberOfLines={1}>
                    {trip.pickup} to {trip.destination}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="mt-0.5 text-[10px] capitalize">
                    {trip.date}, {trip.time} • {trip.vehicleType}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-success">+PKR {trip.driverEarning}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
