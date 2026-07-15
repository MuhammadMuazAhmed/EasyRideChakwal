import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { ProfileMenuItem } from '@/shared/components/common/ProfileComponents';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'Settings'>;

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="mb-1 mt-5 px-1 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
      {label}
    </Text>
  );
}

export function DriverSettingsScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Settings"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-3" contentContainerClassName="pb-10">
        <SectionLabel label="Preferences" />
        <ProfileMenuItem icon="🌐" label="Language" value="Urdu / English" />
        <ProfileMenuItem icon="🔔" label="Push Notifications" value="Enabled" />
        <ProfileMenuItem icon="📍" label="Location Services" value="Always" />

        <SectionLabel label="About" />
        <ProfileMenuItem icon="ℹ️" label="App Version" value="1.0.0" />
      </ScrollView>
    </ScreenContainer>
  );
}
