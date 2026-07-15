import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'VehicleDetails'>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-3 rounded-xl border border-border bg-white p-4">
      <Text className="text-[10px] font-bold uppercase text-text-tertiary">{label}</Text>
      <Text className="mt-1 text-sm font-semibold capitalize text-text-primary">{value || '—'}</Text>
    </View>
  );
}

export function VehicleDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const driverProfile = useDriverStore((s) => s.driverProfile);

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Vehicle Details"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-3 pt-3" contentContainerClassName="pb-10">
        <DetailRow label="Vehicle Type" value={driverProfile?.vehicleType ?? ''} />
        <DetailRow label="Model" value={driverProfile?.vehicleModel ?? ''} />
        <DetailRow label="Number Plate" value={driverProfile?.vehiclePlate ?? ''} />
        <DetailRow label="Color" value={driverProfile?.vehicleColor ?? ''} />
        <DetailRow label="Year" value={String(driverProfile?.vehicleYear ?? '')} />
        <DetailRow label="License Number" value={driverProfile?.licenseNumber ?? ''} />
        <DetailRow label="CNIC" value={driverProfile?.cnicNumber ?? ''} />

        <View className="mt-2 rounded-xl bg-accent/10 p-4">
          <Text className="text-[11px] leading-5 text-text-secondary">
            Vehicle details update karne ke liye support se rabta karein. Document changes admin verification ke baad apply hote hain.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
