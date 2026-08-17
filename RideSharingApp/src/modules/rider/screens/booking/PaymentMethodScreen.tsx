import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { useRideStore } from '@/rider/store/rideStore';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils';
import type { PaymentMethod } from '@/shared/types';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'PaymentMethod'>;

interface PaymentOption {
  id: PaymentMethod;
  iconName: string;
  name: string;
  sub: string;
  badgeText?: string;
  badgeColor?: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'cash',
    iconName: 'cash-outline',
    name: 'Cash',
    sub: 'Seedha driver ko dein',
    badgeText: 'Default · Seedha driver ko dein',
    badgeColor: '#10B981',
  },
  {
    id: 'jazzcash',
    iconName: 'phone-portrait-outline',
    name: 'JazzCash',
    sub: 'Wallet se pay karein',
    badgeText: 'PKR 340 available',
    badgeColor: '#10B981',
  },
  {
    id: 'easypaisa',
    iconName: 'wallet-outline',
    name: 'EasyPaisa',
    sub: 'Wallet se pay karein',
    badgeText: 'PKR 0 — Recharge first',
    badgeColor: '#EF4444',
  },
  {
    id: 'card',
    iconName: 'card-outline',
    name: 'Debit/Credit Card',
    sub: 'Visa / Mastercard',
  },
];

export function PaymentMethodScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const paymentMethod = useRideStore((s) => s.paymentMethod);
  const setPaymentMethod = useRideStore((s) => s.setPaymentMethod);
  const estimatedFare = useRideStore((s) => s.estimatedFare);
  const estimatedDistance = useRideStore((s) => s.estimatedDistance);

  const handleConfirm = () => {
    navigation.navigate('DriverSearching');
  };

  const selectedOption = paymentOptions.find((p) => p.id === paymentMethod);
  const ctaLabel = selectedOption
    ? selectedOption.id === 'cash'
      ? 'Confirm Ride → Cash Payment'
      : `Confirm Ride → ${selectedOption.name}`
    : 'Confirm Ride';

  return (
    <ScreenContainer>
      {/* Header with Logo, Title, and Subtitle matching design system */}
      <TopBar
        variant="light"
        showLogo
        title="Easy Ride Chakwal"
        subtitle="Payment Method"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />

      <ScrollView
        className="flex-1 px-4 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Section Heading */}
        <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase tracking-wider mb-3">
          APNA PAYMENT CHOOSE KAREIN
        </Text>

        {/* Payment Methods Options List */}
        <View className="mb-6 gap-3">
          {paymentOptions.map((option) => {
            const selected = paymentMethod === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setPaymentMethod(option.id)}
                style={{
                  backgroundColor: selected ? theme.accentLight : theme.card,
                  borderColor: selected ? '#F5C400' : theme.cardBorder,
                }}
                className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] p-3.5 active:opacity-90"
              >
                {/* Icon Container */}
                <View
                  style={{
                    backgroundColor: selected
                      ? theme.isDark ? '#3D3400' : '#FFF3C4'
                      : theme.surface,
                  }}
                  className="h-11 w-11 items-center justify-center rounded-xl"
                >
                  <Ionicons
                    name={option.iconName}
                    size={22}
                    color={selected ? (theme.isDark ? '#F5C400' : '#111111') : theme.textSecondary}
                  />
                </View>

                {/* Details */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text style={{ color: theme.textPrimary }} className="text-[15px] font-bold">
                      {option.name}
                    </Text>
                  </View>
                  <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5" numberOfLines={1}>
                    {option.badgeText ? (
                      <Text
                        style={{
                          color: option.badgeColor ?? theme.textSecondary,
                          fontWeight: '600',
                        }}
                      >
                        {option.badgeText}
                      </Text>
                    ) : (
                      option.sub
                    )}
                  </Text>
                </View>

                {/* Selection Indicator */}
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color="#F5C400" />
                ) : (
                  <View style={{ borderColor: theme.textMuted }} className="h-5 w-5 rounded-full border-2" />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Fare Summary Card */}
        <View
          style={{ backgroundColor: theme.accentLight, borderColor: theme.accentBorder }}
          className="mb-6 rounded-2xl border p-4 shadow-sm"
        >
          <Text style={{ color: theme.accentText }} className="text-[11px] font-bold uppercase tracking-wider mb-1">
            FARE ESTIMATE
          </Text>
          <View className="flex-row items-center justify-between">
            <Text style={{ color: theme.textSecondary }} className="text-[13px] font-medium">
              Base + {estimatedDistance > 0 ? `${estimatedDistance.toFixed(1)}km` : '—'}
            </Text>
            <Text style={{ color: theme.textPrimary }} className="text-[18px] font-extrabold">
              {formatCurrency(estimatedFare > 0 ? estimatedFare : 0)}
            </Text>
          </View>
        </View>

        {/* Primary CTA */}
        <Pressable
          onPress={handleConfirm}
          className="h-[54px] w-full rounded-xl items-center justify-center flex-row active:opacity-90 bg-accent"
        >
          <Text className="text-[16px] font-bold text-primary tracking-wide">
            {ctaLabel}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}


