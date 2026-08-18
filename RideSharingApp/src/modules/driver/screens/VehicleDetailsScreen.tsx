import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { useTheme } from '@/shared/theme';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'VehicleDetails'>;

function DetailRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View
      style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
      className="mb-3 rounded-2xl border p-4 shadow-sm"
    >
      <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">{label}</Text>
      <Text style={{ color: theme.textPrimary }} className="mt-1 text-sm font-bold capitalize">{value || '—'}</Text>
    </View>
  );
}

export function VehicleDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const driverProfile = useDriverStore((s) => s.driverProfile);

  return (
    <ScreenContainer>
      <TopBar
        title="Vehicle Details"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-3.5 pt-3.5" contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        <DetailRow label="Vehicle Type" value={driverProfile?.vehicleType ?? ''} />
        <DetailRow label="Model" value={driverProfile?.vehicleModel ?? ''} />
        <DetailRow label="Number Plate" value={driverProfile?.vehiclePlate ?? ''} />
        <DetailRow label="Color" value={driverProfile?.vehicleColor ?? ''} />
        <DetailRow label="Year" value={String(driverProfile?.vehicleYear ?? '')} />
        <DetailRow label="License Number" value={driverProfile?.licenseNumber ?? ''} />
        <DetailRow label="CNIC" value={driverProfile?.cnicNumber ?? ''} />

        <View
          style={{ backgroundColor: theme.accentLight, borderColor: theme.accentBorder }}
          className="mt-2 rounded-2xl border p-4"
        >
          <Text style={{ color: theme.accentText }} className="text-[12px] leading-5 font-medium">
            Vehicle details update karne ke liye support se rabta karein. Document changes admin verification ke baad apply hote hain.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
