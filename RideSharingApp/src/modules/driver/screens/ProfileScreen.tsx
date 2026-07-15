import React from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { syncFcmTokenWithBackend } from '@/shared/services/pushNotifications';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { TopBar } from '@/shared/components/common/TopBar';
import { ProfileHeader, ProfileStats, ProfileMenuItem } from '@/shared/components/common/ProfileComponents';
import { brand } from '@/shared/theme';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'DriverTabs'>;

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const switchRole = useAuthStore((s) => s.switchRole);
  const logout = useAuthStore((s) => s.logout);
  const driverProfile = useDriverStore((s) => s.driverProfile);

  const handleSwitchToRider = async () => {
    try {
      const res = await switchRole('rider');
      if (!res.success) {
        Alert.alert('Error', res.message ?? 'Failed to switch role');
      } else {
        void syncFcmTokenWithBackend();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const name = driverProfile ? `${driverProfile.firstName} ${driverProfile.lastName}` : 'Driver';
  const rating = driverProfile?.rating ?? 5.0;
  const totalTrips = driverProfile?.totalTrips ?? 0;
  const initials = driverProfile?.avatarInitials ?? 'D';

  return (
    <View className="flex-1 bg-white">
      <TopBar title="Driver Profile" />
      <ScrollView className="flex-1">
        <ProfileHeader
          initials={initials}
          name={name}
          phone={driverProfile?.phone ?? ''}
          badge="Verified Partner"
        />
        <ProfileStats totalRides={totalTrips} rating={rating} />
        
        <View className="px-3">
          <ProfileMenuItem
            icon="🔄"
            label="Switch to Rider Mode (سواری)"
            value="Change Mode"
            onPress={() => void handleSwitchToRider()}
          />
          <ProfileMenuItem
            icon="🚗"
            label="Vehicle Details"
            value={driverProfile ? `${driverProfile.vehicleModel} (${driverProfile.vehiclePlate})` : ''}
            onPress={() => navigation.navigate('VehicleDetails')}
          />
          <ProfileMenuItem
            icon="⚙️"
            label="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
          <ProfileMenuItem
            icon="📞"
            label="Driver Support"
            value={brand.supportPhone}
            onPress={() => navigation.navigate('Support')}
          />
          <ProfileMenuItem
            icon="🚪"
            label="Logout"
            destructive
            onPress={logout}
          />
        </View>
      </ScrollView>
    </View>
  );
}
