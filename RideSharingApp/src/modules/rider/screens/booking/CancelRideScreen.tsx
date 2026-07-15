import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { cancelReasons } from '@/shared/constants/mockData';
import { useRideStore } from '@/rider/store/rideStore';
import { RideService } from '@/api/services/rideService';
import { cn } from '@/shared/utils';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'CancelRide'>;

export function CancelRideScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentRide = useRideStore((s) => s.currentRide);
  const cancelRide = useRideStore((s) => s.cancelRide);
  const resetBooking = useRideStore((s) => s.resetBooking);
  const [selectedReason, setSelectedReason] = useState(cancelReasons[2]);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!currentRide?.id) {
      resetBooking();
      navigation.navigate('MainTabs', { screen: 'Home' });
      return;
    }

    setLoading(true);
    try {
      await RideService.cancelRide(currentRide.id, selectedReason);
      cancelRide();
      resetBooking();
      navigation.navigate('MainTabs', { screen: 'Home' });
    } catch (err: any) {
      Alert.alert('Cancel Failed', err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <TopBar title="Ride Cancel Karein?" />
      <ScrollView className="flex-1 p-3">
        <View className="mb-3 rounded-xl border-[1.5px] border-red-300 bg-danger-light p-3">
          <Text className="mb-1 text-sm font-bold text-danger">⚠️ Cancellation Policy</Text>
          <Text className="mb-2 text-[11px] text-red-800">
            Driver ne aapka request accept kar liya hai aur aapki taraf aa raha hai.
          </Text>
          <View className="flex-row gap-1.5">
            <View className="flex-1 items-center rounded-lg bg-red-100 p-2">
              <Text className="text-[10px] font-bold text-red-800">Abhi Cancel (0-2 min)</Text>
              <Text className="text-sm font-extrabold text-danger">Free</Text>
            </View>
            <View className="flex-1 items-center rounded-lg bg-red-100 p-2">
              <Text className="text-[10px] font-bold text-red-800">Driver Arrive ke Baad</Text>
              <Text className="text-sm font-extrabold text-danger">PKR 30 Fee</Text>
            </View>
          </View>
        </View>

        <Text className="mb-2 text-sm font-bold text-text-primary">Cancel Karne ki Wajah?</Text>
        {cancelReasons.map((reason) => (
          <Pressable
            key={reason}
            onPress={() => setSelectedReason(reason)}
            className={cn(
              'mb-1.5 flex-row items-center gap-2.5 rounded-lg border-[1.5px] p-2.5',
              selectedReason === reason
                ? 'border-accent bg-accent-light'
                : 'border-border bg-white',
            )}
          >
            <View
              className={cn(
                'h-4 w-4 rounded-full border-2',
                selectedReason === reason ? 'border-accent bg-accent' : 'border-[#CCCCCC]',
              )}
            />
            <Text
              className={cn(
                'text-xs',
                selectedReason === reason ? 'font-bold text-text-primary' : 'text-text-secondary',
              )}
            >
              {reason}
            </Text>
          </Pressable>
        ))}

        <View className="mt-2 flex-row gap-2">
          <Button title="Wapas Jao" variant="outline" className="flex-1" onPress={() => navigation.goBack()} />
          <Button
            title="Ride Cancel Karein"
            variant="danger"
            className="flex-1"
            loading={loading}
            onPress={() => void handleCancel()}
          />
        </View>
      </ScrollView>
    </View>
  );
}
