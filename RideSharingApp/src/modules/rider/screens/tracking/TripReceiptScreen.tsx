import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { useRideStore } from '@/rider/store/rideStore';
import { formatCurrency } from '@/shared/utils';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'TripReceipt'>;

const fareBreakdown = [
  ['Base Fare', 'PKR 50'],
  ['Distance (3.2 km × PKR 35)', 'PKR 112'],
  ['Waiting (2 min)', 'PKR 18'],
  ['Platform Fee', 'PKR 0'],
];

export function TripReceiptScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentRide = useRideStore((s) => s.currentRide);
  const driver = currentRide?.driver;

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Trip Receipt"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
        rightAction={<Badge label="Paid" variant="green" />}
      />
      <ScrollView className="flex-1 p-2.5">
        <Card className="mb-2">
          <View className="mb-2.5 items-center border-b border-border pb-2.5">
            <View className="mb-1.5 h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Text className="text-sm font-black text-accent">E</Text>
            </View>
            <Text className="text-sm font-bold text-text-primary">Easy Ride Chakwal</Text>
            <Text className="text-[10px] text-text-tertiary">25 Jun 2026 · 3:12 PM</Text>
          </View>

          <View className="mb-2.5 flex-row items-center rounded-lg bg-surface-muted p-2">
            <Avatar initials={driver?.avatarInitials ?? 'AR'} size="sm" />
            <View className="ml-2 flex-1">
              <Text className="text-xs font-bold text-text-primary">
                {driver ? `${driver.firstName} ${driver.lastName}` : 'Abdul Rehman'}
              </Text>
              <Text className="text-[10px] text-text-tertiary">
                {driver?.vehicleModel ?? 'Suzuki Alto'} · {driver?.vehiclePlate ?? 'LZR-482'}
              </Text>
            </View>
            <Text className="text-[10px] text-accent">★★★★★</Text>
          </View>

          <View className="mb-2.5">
            <View className="mb-1 flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-accent" />
              <View>
                <Text className="text-[10px] text-text-tertiary">Pickup</Text>
                <Text className="text-xs font-semibold text-text-primary">
                  {currentRide?.pickup.name ?? 'Clock Tower, Chakwal'}
                </Text>
              </View>
            </View>
            <View className="ml-[3px] h-2 border-l-2 border-dashed border-border" />
            <View className="flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-success" />
              <View>
                <Text className="text-[10px] text-text-tertiary">Drop-off</Text>
                <Text className="text-xs font-semibold text-text-primary">
                  {currentRide?.destination.name ?? 'GCT College, Chakwal'}
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-2 h-px bg-border" />
          {fareBreakdown.map(([label, value]) => (
            <View key={label} className="mb-1 flex-row justify-between">
              <Text className="text-xs text-text-secondary">{label}</Text>
              <Text className="text-xs font-semibold text-text-primary">{value}</Text>
            </View>
          ))}
          <View className="my-2 h-px bg-border" />
          <View className="flex-row justify-between">
            <Text className="text-sm font-bold text-text-primary">Total Paid</Text>
            <Text className="text-lg font-extrabold text-text-primary">
              {formatCurrency(currentRide?.fare ?? 180)}
            </Text>
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-[10px] text-text-tertiary">Payment</Text>
            <Text className="text-[10px] text-text-tertiary">Cash</Text>
          </View>
        </Card>

        <View className="flex-row gap-2">
          <Button title="📤 Share" variant="outline" className="flex-1" onPress={() => {}} />
          <Button title="💾 Save PDF" className="flex-1" onPress={() => {}} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
