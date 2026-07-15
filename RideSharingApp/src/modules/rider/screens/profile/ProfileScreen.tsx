import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '@/shared/components/common/TopBar';
import {
  ProfileHeader,
  ProfileStats,
  ProfileMenuItem,
} from '@/shared/components/common/ProfileComponents';
import { LoadingState } from '@/shared/components/common/StateViews';
import { useProfile } from '@/shared/hooks/useQueries';
import { useAuthStore } from '@/store/authStore';
import { brand } from '@/shared/theme';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'MainTabs'>;

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const logout = useAuthStore((s) => s.logout);
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) return <LoadingState message="Loading profile..." />;

  return (
    <View className="flex-1 bg-white">
      <TopBar title="My Profile" />
      <ScrollView className="flex-1">
        <ProfileHeader
          initials={profile.avatarInitials}
          name={`${profile.firstName} ${profile.lastName}`}
          phone={profile.phone}
          badge={profile.badge}
        />
        <ProfileStats totalRides={profile.totalRides} rating={profile.rating} />
        <View className="px-3">
          <ProfileMenuItem
            icon="🚨"
            label="SOS Emergency Contacts"
            value="Manage"
            onPress={() => navigation.navigate('EmergencyContacts')}
          />
          <ProfileMenuItem
            icon="📍"
            label="Saved Places"
            onPress={() => navigation.navigate('SavedPlaces')}
          />
          <ProfileMenuItem
            icon="🔔"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <ProfileMenuItem
            icon="💬"
            label="Language / زبان"
            value="اردو"
            onPress={() => navigation.navigate('Settings')}
          />
          <ProfileMenuItem
            icon="📤"
            label="Refer a Friend"
            value="PKR 50 credit"
            onPress={() => navigation.navigate('Referral')}
          />
          <ProfileMenuItem
            icon="⚙️"
            label="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
          <ProfileMenuItem
            icon="📞"
            label="WhatsApp Support"
            value={brand.supportPhone}
            onPress={() => navigation.navigate('Support')}
          />
          <ProfileMenuItem
            icon="✏️"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
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
