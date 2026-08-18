import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { cancelReasons } from '@/shared/constants/mockData';
import { useRideStore } from '@/rider/store/rideStore';
import { RideService } from '@/api/services/rideService';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useTheme } from '@/shared/theme';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'CancelRide'>;

// ------------------------------------------------------------------
// Destructive colour constants — semantically meaningful across themes
// ------------------------------------------------------------------
const DANGER_BORDER_DARK = 'rgba(239,68,68,0.30)';
const DANGER_BG_DARK = 'rgba(239,68,68,0.08)';
const DANGER_BORDER_LIGHT = 'rgba(239,68,68,0.25)';
const DANGER_BG_LIGHT = 'rgba(239,68,68,0.06)';
const DANGER_PILL_BG_DARK = 'rgba(239,68,68,0.15)';
const DANGER_PILL_BG_LIGHT = 'rgba(239,68,68,0.10)';

export function CancelRideScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const currentRide = useRideStore((s) => s.currentRide);
  const cancelRide = useRideStore((s) => s.cancelRide);
  const resetBooking = useRideStore((s) => s.resetBooking);

  const [selectedReason, setSelectedReason] = useState(cancelReasons[2]);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!currentRide?.id) {
      resetBooking();
      queryClient.removeQueries({ queryKey: QUERY_KEYS.currentRide });
      navigation.popToTop();
      return;
    }

    setLoading(true);
    try {
      await RideService.cancelRide(currentRide.id, selectedReason);
      cancelRide();
      resetBooking();
      queryClient.removeQueries({ queryKey: QUERY_KEYS.currentRide });
      navigation.popToTop();
    } catch (err: any) {
      Alert.alert('Cancel Failed', err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  // Theme-specific danger surface
  const dangerBorder = isDark ? DANGER_BORDER_DARK : DANGER_BORDER_LIGHT;
  const dangerBg = isDark ? DANGER_BG_DARK : DANGER_BG_LIGHT;
  const dangerPillBg = isDark ? DANGER_PILL_BG_DARK : DANGER_PILL_BG_LIGHT;

  return (
    <ScreenContainer>
      {/* ── Header ──────────────────────────────────────────────── */}
      <TopBar
        title="Ride Cancel Karein?"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Cancellation Policy Card ───────────────────────────── */}
        <View
          style={{
            backgroundColor: dangerBg,
            borderColor: dangerBorder,
            borderWidth: 1.5,
          }}
          className="mb-5 rounded-2xl overflow-hidden"
        >
          {/* Card header strip */}
          <View
            style={{ backgroundColor: dangerPillBg, borderBottomColor: dangerBorder, borderBottomWidth: 1 }}
            className="flex-row items-center gap-2.5 px-4 py-3"
          >
            <Ionicons name="warning-outline" size={17} color={theme.danger} />
            <Text style={{ color: theme.danger }} className="text-[13px] font-bold tracking-wide">
              Cancellation Policy
            </Text>
          </View>

          {/* Body */}
          <View className="px-4 pt-3 pb-4">
            <Text style={{ color: theme.textPrimary }} className="text-[13px] leading-5 mb-4">
              Driver ne aapka request accept kar liya hai aur aapki taraf aa raha hai.
            </Text>

            {/* Fee breakdown pills */}
            <View className="flex-row gap-2.5">
              {/* Free window */}
              <View
                style={{ backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderWidth: 1 }}
                className="flex-1 items-center rounded-xl p-3 gap-1"
              >
                <Text style={{ color: theme.textSecondary }} className="text-[10px] font-semibold text-center uppercase tracking-wider">
                  Abhi Cancel
                </Text>
                <Text style={{ color: theme.textMuted }} className="text-[10px] text-center mb-1">
                  0 – 2 minutes
                </Text>
                <View
                  style={{ backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.30)', borderWidth: 1 }}
                  className="rounded-lg px-3 py-1"
                >
                  <Text style={{ color: '#10B981' }} className="text-[13px] font-extrabold">
                    Free
                  </Text>
                </View>
              </View>

              {/* Fee window */}
              <View
                style={{ backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderWidth: 1 }}
                className="flex-1 items-center rounded-xl p-3 gap-1"
              >
                <Text style={{ color: theme.textSecondary }} className="text-[10px] font-semibold text-center uppercase tracking-wider">
                  Driver Arrive
                </Text>
                <Text style={{ color: theme.textMuted }} className="text-[10px] text-center mb-1">
                  ke baad
                </Text>
                <View
                  style={{ backgroundColor: dangerPillBg, borderColor: dangerBorder, borderWidth: 1 }}
                  className="rounded-lg px-3 py-1"
                >
                  <Text style={{ color: theme.danger }} className="text-[13px] font-extrabold">
                    PKR 30 Fee
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Reason Section Header ──────────────────────────────── */}
        <Text
          style={{ color: theme.textMuted }}
          className="text-[11px] font-bold uppercase tracking-wider mb-3"
        >
          Cancel Karne ki Wajah?
        </Text>

        {/* ── Reason Cards ──────────────────────────────────────── */}
        <View className="gap-2.5 mb-6">
          {cancelReasons.map((reason) => {
            const selected = selectedReason === reason;
            return (
              <Pressable
                key={reason}
                onPress={() => setSelectedReason(reason)}
                style={{
                  backgroundColor: selected ? theme.accentLight : theme.card,
                  borderColor: selected ? theme.accentBorder : theme.cardBorder,
                  borderWidth: 1.5,
                }}
                className="flex-row items-center gap-3 rounded-2xl p-3.5 active:opacity-80"
              >
                {/* Radio indicator */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selected ? theme.accent : theme.textMuted,
                    backgroundColor: selected ? theme.accent : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: isDark ? '#111111' : '#111111',
                      }}
                    />
                  )}
                </View>

                {/* Label */}
                <Text
                  style={{
                    color: selected ? theme.textPrimary : theme.textSecondary,
                    fontWeight: selected ? '700' : '500',
                  }}
                  className="flex-1 text-[14px]"
                >
                  {reason}
                </Text>

                {/* Checkmark when selected */}
                {selected && (
                  <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── Action Buttons ────────────────────────────────────── */}
        <View className="gap-3">
          {/* Secondary — Wapas Jao */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              height: 52,
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
              borderWidth: 1.5,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
            className="active:opacity-75"
          >
            <Ionicons name="arrow-back-outline" size={18} color={theme.textPrimary} />
            <Text style={{ color: theme.textPrimary }} className="text-[15px] font-bold tracking-wide">
              Wapas Jao
            </Text>
          </Pressable>

          {/* Destructive — Ride Cancel Karein */}
          <Pressable
            onPress={() => void handleCancel()}
            disabled={loading}
            style={{
              height: 52,
              backgroundColor: theme.danger,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: loading ? 0.65 : 1,
            }}
            className="active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                <Text className="text-[15px] font-bold tracking-wide text-white">
                  Ride Cancel Karein
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
