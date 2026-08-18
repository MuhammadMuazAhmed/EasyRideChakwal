import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { ProfileMenuItem } from '@/shared/components/common/ProfileComponents';
import { AppearanceModal } from '@/shared/components/common/AppearanceModal';
import { useTheme } from '@/shared/theme';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'Settings'>;

function SectionLabel({ label }: { label: string }) {
  const { theme } = useTheme();
  return (
    <Text style={{ color: theme.textMuted }} className="mb-1 mt-5 px-1 text-[10px] font-bold uppercase tracking-widest">
      {label}
    </Text>
  );
}

export function DriverSettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { preference } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const appearanceLabel =
    preference === 'light' ? '☀️ Light' : preference === 'dark' ? '🌙 Dark' : '⚙️ Default';

  return (
    <ScreenContainer>
      <TopBar
        showLogo
        title="Easy Ride Chakwal"
        subtitle="Settings"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-10">
        <SectionLabel label="Preferences" />
        <ProfileMenuItem
          icon="color-palette-outline"
          label="Appearance"
          value={appearanceLabel}
          onPress={() => setModalVisible(true)}
        />
        <ProfileMenuItem icon="globe-outline" label="Language" value="Urdu / English" />
        <ProfileMenuItem icon="notifications-outline" label="Push Notifications" value="Enabled" />
        <ProfileMenuItem icon="location-outline" label="Location Services" value="Always" />

        <SectionLabel label="About" />
        <ProfileMenuItem icon="information-circle-outline" label="App Version" value="1.0.0" />
      </ScrollView>

      <AppearanceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ScreenContainer>
  );
}

