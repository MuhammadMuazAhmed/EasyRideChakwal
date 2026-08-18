import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { useRideStore } from '@/rider/store/rideStore';
import { useTheme } from '@/shared/theme';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'NoDriver'>;

export function NoDriverScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();

  const pickup = useRideStore((s) => s.pickup);
  const destination = useRideStore((s) => s.destination);
  const setSelectedVehicle = useRideStore((s) => s.setSelectedVehicle);
  const resetBooking = useRideStore((s) => s.resetBooking);

  const [loading, setLoading] = useState(false);
  const [notified, setNotified] = useState(false);

  // Validate location data before executing retry
  const handleRetry = (vehicleOverride?: 'bike' | 'car' | 'qingqi') => {
    if (loading) return;

    if (!pickup?.coordinates || !destination?.coordinates) {
      Alert.alert(
        'Location Details Missing',
        'We couldn\'t find your pickup or destination details. Please select your destination again.',
        [
          {
            text: 'Select Destination',
            onPress: () => {
              resetBooking();
              navigation.navigate('LocationSearch');
            },
          },
        ],
      );
      return;
    }

    setLoading(true);

    if (vehicleOverride) {
      setSelectedVehicle(vehicleOverride);
    }

    // Small immediate feedback delay before replacing with DriverSearching screen
    setTimeout(() => {
      navigation.replace('DriverSearching');
    }, 400);
  };

  const handleNotify = () => {
    setNotified(true);
    Alert.alert(
      'Notification Enabled 🔔',
      'Jaise hi aapke area mein driver online hoga, hum aapko notify kar dein ge.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }),
        },
      ],
    );
  };

  const handleBackToHome = () => {
    resetBooking();
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <ScreenContainer>
      {/* ── Top Header ────────────────────────────────────────── */}
      <TopBar
        showLogo
        title="Easy Ride Chakwal"
        subtitle="Driver Nahi Mila"
        leftAction={<BackButton onPress={handleBackToHome} />}
      />

      {/* ── Background Map ────────────────────────────────────── */}
      <View className="relative flex-1">
        <RideMap
          pickup={pickup?.coordinates}
          destination={destination?.coordinates}
          showRoute={Boolean(pickup?.coordinates && destination?.coordinates)}
        />

        {/* ── Floating Status Card Overlay ────────────────────── */}
        <View className="absolute left-4 right-4 top-4">
          <View
            style={{
              backgroundColor: isDark ? 'rgba(26,26,26,0.92)' : 'rgba(255,255,255,0.95)',
              borderColor: theme.cardBorder,
              borderWidth: 1.5,
            }}
            className="rounded-2xl p-4 shadow-lg flex-row items-center gap-3.5"
          >
            {/* Warning Icon Container */}
            <View
              style={{ backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)' }}
              className="h-11 w-11 items-center justify-center rounded-xl border"
            >
              <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
            </View>

            {/* Text Hierarchy */}
            <View className="flex-1">
              <Text style={{ color: theme.textPrimary }} className="text-[16px] font-extrabold">
                Driver Nahi Mila
              </Text>
              <Text style={{ color: theme.textSecondary }} className="text-[12px] font-medium mt-0.5" numberOfLines={1}>
                Aapke area mein abhi koi driver available nahi hai
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1.5">
                <Ionicons name="location-outline" size={12} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted }} className="text-[11px] font-semibold" numberOfLines={1}>
                  {pickup?.name ?? 'Chakwal Area'} · 60s search
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Bottom Action Sheet ──────────────────────────────── */}
        <MapBottomSheet>
          <View className="px-1 pb-3 pt-1">
            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase tracking-wider mb-3">
              Ab Kya Karein?
            </Text>

            {/* 1. Primary Action — Dobara Try Karein */}
            <Pressable
              onPress={() => handleRetry()}
              disabled={loading}
              style={{
                height: 52,
                backgroundColor: theme.accent,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
              className="mb-3 active:opacity-90 shadow-sm"
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#111111" />
                  <Text className="text-[15px] font-bold text-primary tracking-wide">
                    Driver dobara dhoond rahe hain...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="reload-outline" size={18} color="#111111" />
                  <Text className="text-[15px] font-extrabold text-primary tracking-wide">
                    Dobara Try Karein
                  </Text>
                </>
              )}
            </Pressable>

            {/* 2. Secondary Action — Bike Try Karein (Faster) */}
            <Pressable
              onPress={() => handleRetry('bike')}
              disabled={loading}
              style={{
                height: 50,
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
                borderWidth: 1.5,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
              className="mb-3 active:opacity-80"
            >
              <Text className="text-[16px]">🏍️</Text>
              <Text style={{ color: theme.textPrimary }} className="text-[14px] font-bold tracking-wide">
                Bike Try Karein
              </Text>
              <View style={{ backgroundColor: theme.accentLight }} className="rounded-md px-2 py-0.5">
                <Text style={{ color: theme.accentText }} className="text-[10px] font-extrabold">
                  Faster
                </Text>
              </View>
            </Pressable>

            {/* 3. Tertiary Action — Notify when driver available */}
            <Pressable
              onPress={handleNotify}
              disabled={notified}
              style={{
                height: 48,
                backgroundColor: notified ? 'rgba(16,185,129,0.1)' : theme.card,
                borderColor: notified ? 'rgba(16,185,129,0.3)' : theme.cardBorder,
                borderWidth: 1.5,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
              className="active:opacity-80"
            >
              <Ionicons
                name={notified ? 'checkmark-circle' : 'notifications-outline'}
                size={18}
                color={notified ? '#10B981' : theme.textSecondary}
              />
              <Text
                style={{ color: notified ? '#10B981' : theme.textSecondary }}
                className="text-[13px] font-semibold"
              >
                {notified ? 'Notification Enabled ✓' : 'Driver Available hone par Notify Karein'}
              </Text>
            </Pressable>
          </View>
        </MapBottomSheet>
      </View>
    </ScreenContainer>
  );
}
