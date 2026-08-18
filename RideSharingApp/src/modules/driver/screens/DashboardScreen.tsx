import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { useCurrentLocation } from '@/shared/hooks';
import { DriverService } from '@/modules/driver/services/driverService';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/api/services/authService';
import { useTheme } from '@/shared/theme';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'DriverTabs'>;

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { location } = useCurrentLocation();
  const { theme } = useTheme();

  const isOnline = useDriverStore((s) => s.isOnline);
  const setOnline = useDriverStore((s) => s.setOnline);
  const driverProfile = useDriverStore((s) => s.driverProfile);
  const setDriverProfile = useDriverStore((s) => s.setDriverProfile);

  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch driver profile on mount and verify registration/verification status
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await DriverService.getProfile();
        setDriverProfile(profile);
        setOnline(profile.isOnline);

        // If not verified, redirect to pending screen
        if (profile.isVerified === false) {
          useDriverRegistrationStore.getState().setField('driverId', profile._id || profile.id);
          navigation.reset({
            index: 0,
            routes: [{ name: 'DriverPending' as any }],
          });
        }
      } catch (err: any) {
        const status = err.response?.status;
        const msg = err.response?.data?.message ?? '';
        const hasRealDriverId = !!useAuthStore.getState().driverId;
        const isStaleToken =
          status === 400 &&
          (msg.toLowerCase().includes('incomplete') || msg.toLowerCase().includes('registration'));

        if (hasRealDriverId && isStaleToken) {
          // Stale temp token — exchange for permanent one via switch-role, then retry
          console.warn('DashboardScreen: stale temp token detected. Refreshing via switchRole...');
          const switchResult = await AuthService.switchRole('driver');
          if (switchResult.success && switchResult.token) {
            useAuthStore.setState({ token: switchResult.token });
            try {
              const profile = await DriverService.getProfile();
              setDriverProfile(profile);
              setOnline(profile.isOnline);
              if (profile.isVerified === false) {
                useDriverRegistrationStore.getState().setField('driverId', profile._id || profile.id);
                navigation.reset({ index: 0, routes: [{ name: 'DriverPending' as any }] });
              }
            } catch (retryErr: any) {
              Alert.alert('Profile Error', retryErr.response?.data?.message ?? retryErr.message);
            }
          } else {
            Alert.alert('Session Error', 'Dobara login karein.');
          }
        } else if (
          !hasRealDriverId &&
          (status === 400 || status === 404 ||
            msg.toLowerCase().includes('verify') ||
            msg.toLowerCase().includes('profile') ||
            msg.toLowerCase().includes('incomplete'))
        ) {
          // Genuinely unregistered — redirect to registration wizard
          navigation.reset({
            index: 0,
            routes: [{ name: 'DriverRegistrationNavigator' as any }],
          });
        } else {
          Alert.alert('Profile Error', msg || err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, [setDriverProfile, setOnline, navigation]);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      setStatsLoading(true);
      try {
        const s = await DriverService.getStats();
        if (mounted) setStats(s);
      } catch (err) {
        // ignore — dashboard will show fallbacks
      } finally {
        if (mounted) setStatsLoading(false);
      }
    }
    void loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const nextOnline = !isOnline;
      await DriverService.updateStatus(nextOnline, location ?? undefined);
      setOnline(nextOnline);
    } catch (err: any) {
      Alert.alert('Status Error', err.response?.data?.message ?? err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <View style={{ backgroundColor: theme.background }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#F5C400" />
        <Text style={{ color: theme.textSecondary }} className="text-xs mt-3">Profile loading...</Text>
      </View>
    );
  }

  // metrics from profile / stats
  const todayEarnings = stats?.todayEarnings ?? 0;
  const tripsCount = stats?.totalTrips ?? driverProfile?.totalTrips ?? 0;
  const dailyAverage = 2700;
  const progressPct = Math.min((todayEarnings / dailyAverage) * 100, 100);

  return (
    <ScreenContainer>
      <TopBar
        showLogo
        title="Easy Ride"
        subtitle="Driver Panel"
        rightAction={
          <Pressable
            onPress={() => void handleToggleOnline()}
            style={{ backgroundColor: theme.surfaceElevated, borderColor: theme.border }}
            className="flex-row items-center gap-2 rounded-full border px-3 py-1"
          >
            <View className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-success' : 'bg-neutral-400'}`} />
            <Text style={{ color: theme.textPrimary }} className="text-[11px] font-bold">
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </Pressable>
        }
      />

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* SECTION 2 — Earnings card */}
        <View
          style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
          className="mb-5 rounded-2xl border p-4 shadow-sm"
        >
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text style={{ color: theme.textMuted }} className="text-xs font-bold uppercase tracking-wide">Today's Earnings</Text>
              <Text className="text-2xl font-extrabold text-accent">PKR {todayEarnings}</Text>
            </View>
            <View className="items-end">
              <Text style={{ color: theme.textMuted }} className="text-xs font-bold uppercase tracking-wide">Trips</Text>
              <Text style={{ color: theme.textPrimary }} className="text-2xl font-extrabold">{tripsCount}</Text>
            </View>
          </View>

          <View className="mt-3">
            <View className="flex-row justify-between mb-2">
              <Text style={{ color: theme.textSecondary }} className="text-[12px]">Target Progress</Text>
              <Text className="text-[12px] text-accent font-bold">{todayEarnings} / {dailyAverage} PKR</Text>
            </View>
            <View style={{ backgroundColor: theme.surfaceElevated }} className="w-full h-2.5 rounded-full overflow-hidden">
              <View className="bg-accent h-full rounded-full" style={{ width: `${progressPct}%` }} />
            </View>
          </View>
        </View>

        {/* SECTION 3 — Online/Offline toggle button */}
        <View className="mb-6">
          {toggling ? (
            <ActivityIndicator size="small" color="#F5C400" className="py-4" />
          ) : isOnline ? (
            <Pressable
              onPress={handleToggleOnline}
              style={{ backgroundColor: theme.surfaceElevated, borderColor: theme.border }}
              className="w-full py-3.5 rounded-xl items-center justify-center border"
            >
              <Text style={{ color: theme.textPrimary }} className="font-bold">Go Offline</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleToggleOnline} className="w-full bg-accent py-3.5 rounded-xl items-center justify-center active:opacity-90">
              <Text className="text-primary font-black text-[15px]">Go Online — Start Earning</Text>
            </Pressable>
          )}
        </View>

        {/* SECTION 4 — Stats grid (2×2) */}
        <Text style={{ color: theme.textMuted }} className="mb-2 text-[10px] font-bold uppercase tracking-widest">Performance Stats</Text>
        <View className="flex-row gap-3 mb-3">
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="flex-1 border p-4 rounded-xl items-start shadow-sm"
          >
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wide mb-1">Nearby Requests</Text>
            <Text style={{ color: theme.textPrimary }} className="text-2xl font-extrabold">0</Text>
          </View>
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="flex-1 border p-4 rounded-xl items-start shadow-sm"
          >
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wide mb-1">My Rating</Text>
            <Text className="text-2xl font-extrabold text-accent">{statsLoading ? '—' : stats?.rating != null ? `★ ${Number(stats.rating).toFixed(1)}` : '—'}</Text>
          </View>
        </View>
        <View className="flex-row gap-3 mb-6">
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="flex-1 border p-4 rounded-xl items-start shadow-sm"
          >
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wide mb-1">Accept Rate</Text>
            <Text style={{ color: theme.textPrimary }} className="text-2xl font-extrabold">{statsLoading ? '—' : stats?.acceptRate != null ? `${stats.acceptRate}%` : '—'}</Text>
          </View>
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="flex-1 border p-4 rounded-xl items-start shadow-sm"
          >
            <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase tracking-wide mb-1">Total Trips</Text>
            <Text style={{ color: theme.textPrimary }} className="text-2xl font-extrabold">{tripsCount}</Text>
          </View>
        </View>

        {/* SECTION 5 — Incoming ride request cards */}
        <Text style={{ color: theme.textMuted }} className="mb-2.5 text-[10px] font-bold uppercase tracking-widest">
          Ride Requests
        </Text>
        {isOnline ? (
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="items-center py-8 border border-dashed rounded-xl mb-8"
          >
            <Ionicons name="inbox-outline" size={36} color="#F5C400" />
            <Text style={{ color: theme.textPrimary }} className="text-sm font-semibold mt-3 text-center">No requests right now</Text>
            <Text style={{ color: theme.textSecondary }} className="text-xs text-center mt-1">We'll notify you when nearby riders request a ride.</Text>
          </View>
        ) : (
          <View
            style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
            className="items-center py-8 border rounded-xl mb-8"
          >
            <Ionicons name="notifications-off-outline" size={36} color={theme.textMuted} />
            <Text style={{ color: theme.textPrimary }} className="text-sm font-semibold mt-3 text-center">You're offline</Text>
            <Text style={{ color: theme.textSecondary }} className="text-xs text-center mt-1">Go online to receive ride requests.</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
