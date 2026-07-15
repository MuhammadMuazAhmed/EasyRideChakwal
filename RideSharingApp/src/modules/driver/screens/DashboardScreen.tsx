import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { useCurrentLocation } from '@/shared/hooks';
import { DriverService } from '@/modules/driver/services/driverService';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/api/services/authService';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'DriverTabs'>;

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { location } = useCurrentLocation();

  const isOnline = useDriverStore((s) => s.isOnline);
  const setOnline = useDriverStore((s) => s.setOnline);
  const driverProfile = useDriverStore((s) => s.driverProfile);
  const setDriverProfile = useDriverStore((s) => s.setDriverProfile);

  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

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
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#F5C400" />
        <Text className="text-white text-xs mt-3">Profile loading...</Text>
      </View>
    );
  }

  // hardcoded/calculated metrics
  const todayEarnings = 0;
  const tripsCount = driverProfile?.totalTrips ?? 0;
  const dailyAverage = 2700;
  const progressPct = Math.min((todayEarnings / dailyAverage) * 100, 100);

  return (
    <View className="flex-1 bg-[#111111]">
      <TopBar
        showLogo
        title="Driver Panel"
        rightAction={
          <View className="flex-row items-center gap-1.5 rounded-full bg-[#1F1F1F] px-2.5 py-1">
            <View className={`h-2 w-2 rounded-full ${isOnline ? 'bg-success' : 'bg-neutral-500'}`} />
            <Text className="text-[10px] font-bold text-white">
              {isOnline ? 'آن لائن' : 'آف لائن'}
            </Text>
          </View>
        }
      />

      <ScrollView className="flex-1 px-4 pt-4">
        {/* SECTION 2 — Earnings card */}
        <View className="mb-5 rounded-2xl bg-[#1A1A1A] border border-neutral-800 p-5">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs text-neutral-400 font-bold uppercase tracking-wide">
              Aaj ki Kamai
            </Text>
            <Text className="text-xs text-neutral-400 font-bold uppercase tracking-wide">
              Trips
            </Text>
          </View>
          <View className="flex-row justify-between items-baseline mb-4">
            <Text className="text-2xl font-black text-accent">
              PKR {todayEarnings}
            </Text>
            <Text className="text-xl font-black text-accent">
              {tripsCount}
            </Text>
          </View>

          {/* Earnings Progress Bar vs 2700 average */}
          <View className="mt-1">
            <View className="flex-row justify-between text-[10px] mb-1.5">
              <Text className="text-[10px] text-neutral-400">Target Progress</Text>
              <Text className="text-[10px] text-accent font-bold">
                {todayEarnings} / {dailyAverage} PKR
              </Text>
            </View>
            <View className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <View className="bg-accent h-full rounded-full" style={{ width: `${progressPct}%` }} />
            </View>
          </View>
        </View>

        {/* SECTION 3 — Online/Offline toggle button */}
        <View className="mb-6">
          {toggling ? (
            <ActivityIndicator size="small" color="#F5C400" className="py-4" />
          ) : isOnline ? (
            <Button
              title="🔴 Offline Ho Jao"
              variant="outline"
              onPress={handleToggleOnline}
              className="py-4 rounded-xl border border-danger bg-transparent"
              textClassName="text-danger font-bold text-sm"
            />
          ) : (
            <Pressable
              onPress={handleToggleOnline}
              className="w-full bg-success active:opacity-90 py-4 rounded-xl items-center justify-center"
            >
              <Text className="text-white font-black text-sm">
                🟢 Online Ho Jao — Kamai Shuru!
              </Text>
            </Pressable>
          )}
        </View>

        {/* SECTION 4 — Stats grid (2×2) */}
        <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Performance Stats
        </Text>
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-[#1A1A1A] border border-neutral-850 p-4 rounded-xl">
            <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1">
              Nearby Requests
            </Text>
            <Text className="text-lg font-black text-white">0</Text>
          </View>
          <View className="flex-1 bg-[#1A1A1A] border border-neutral-850 p-4 rounded-xl">
            <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1">
              My Rating
            </Text>
            <Text className="text-lg font-black text-accent">
              ⭐ {driverProfile?.rating?.toFixed(1) ?? '5.0'}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-[#1A1A1A] border border-neutral-850 p-4 rounded-xl">
            <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1">
              Accept Rate
            </Text>
            <Text className="text-lg font-black text-white">100%</Text>
          </View>
          <View className="flex-1 bg-[#1A1A1A] border border-neutral-850 p-4 rounded-xl">
            <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1">
              Total Trips
            </Text>
            <Text className="text-lg font-black text-white">{tripsCount}</Text>
          </View>
        </View>

        {/* SECTION 5 — Incoming ride request cards */}
        <Text className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Ride Requests
        </Text>
        {isOnline ? (
          <View className="items-center py-8 border border-dashed border-neutral-800 bg-[#151515] rounded-xl mb-8">
            <Text className="text-xs text-neutral-500 text-center font-semibold">
              Koi request nahi abhi — intezar karein...
            </Text>
          </View>
        ) : (
          <View className="items-center py-8 border border-neutral-800 bg-[#151515] rounded-xl mb-8">
            <Text className="text-xs text-neutral-500 text-center">
              Rides receive karne ke liye online ho jao.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
