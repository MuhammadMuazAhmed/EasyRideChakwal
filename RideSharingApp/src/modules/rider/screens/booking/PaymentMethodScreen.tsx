import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { useRideStore } from '@/rider/store/rideStore';
import { formatCurrency, cn } from '@/shared/utils';
import type { PaymentMethod } from '@/shared/types';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'PaymentMethod'>;

const paymentOptions: {
  id: PaymentMethod;
  icon: string;
  name: string;
  sub: string;
  wallet?: string;
}[] = [
  { id: 'cash', icon: '💵', name: 'Cash', sub: 'Seedha driver ko dein', wallet: 'Default' },
  { id: 'jazzcash', icon: '📱', name: 'JazzCash', sub: 'Wallet se pay karein', wallet: 'PKR 340 available' },
  { id: 'easypaisa', icon: '🟢', name: 'EasyPaisa', sub: 'Wallet se pay karein', wallet: 'PKR 0 — Recharge first' },
  { id: 'card', icon: '💳', name: 'Debit/Credit Card', sub: 'Visa / Mastercard' },
];

export function PaymentMethodScreen() {
  const navigation = useNavigation<NavigationProp>();
  const paymentMethod = useRideStore((s) => s.paymentMethod);
  const setPaymentMethod = useRideStore((s) => s.setPaymentMethod);
  const estimatedFare = useRideStore((s) => s.estimatedFare);
  const estimatedDistance = useRideStore((s) => s.estimatedDistance);

  const handleConfirm = () => {
    navigation.navigate('DriverSearching');
  };

  return (
    <ScreenContainer className="bg-white">
      <TopBar
        title="Payment Method"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-3 pt-3">
        <Text className="mb-2 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          Apna payment choose karein
        </Text>
        {paymentOptions.map((option) => {
          const selected = paymentMethod === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setPaymentMethod(option.id)}
              className={cn(
                'mb-2 flex-row items-center gap-2.5 rounded-xl border-2 p-3',
                selected ? 'border-accent bg-accent-light' : 'border-border bg-white',
              )}
            >
              <Text className="text-[22px]">{option.icon}</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text-primary">{option.name}</Text>
                <Text className="text-[10px] text-text-tertiary">{option.wallet ?? option.sub}</Text>
              </View>
              <View
                className={cn(
                  'h-[18px] w-[18px] items-center justify-center rounded-full border-2',
                  selected ? 'border-accent bg-accent' : 'border-[#CCCCCC]',
                )}
              >
                {selected ? <Text className="text-[10px] font-bold text-primary">✓</Text> : null}
              </View>
            </Pressable>
          );
        })}

        <View className="mb-3 rounded-lg border border-[#F5E090] bg-accent-light p-2.5">
          <Text className="text-[11px] font-bold text-[#7A5800]">Fare Estimate</Text>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-xs text-text-secondary">
              Base + {estimatedDistance > 0 ? `${estimatedDistance.toFixed(1)}km` : '—'}
            </Text>
            <Text className="text-base font-extrabold text-text-primary">
              {formatCurrency(estimatedFare > 0 ? estimatedFare : 0)}
            </Text>
          </View>
        </View>

        <Button
          title={`Confirm Ride → ${paymentOptions.find((p) => p.id === paymentMethod)?.name} Payment`}
          onPress={handleConfirm}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
