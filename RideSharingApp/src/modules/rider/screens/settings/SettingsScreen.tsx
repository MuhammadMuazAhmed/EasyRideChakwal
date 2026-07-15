import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { ProfileMenuItem } from '@/shared/components/common/ProfileComponents';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Settings'>;

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="mb-1 mt-5 px-1 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
      {label}
    </Text>
  );
}

function DemoButton({
  icon,
  label,
  onPress,
  accent,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  accent?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5 active:opacity-75"
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text className={`flex-1 text-sm font-semibold ${accent ?? 'text-text-primary'}`}>{label}</Text>
      <Text className="text-text-tertiary">›</Text>
    </Pressable>
  );
}

export function SettingsScreen() {
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

        <SectionLabel label="Legal" />
        <ProfileMenuItem
          icon="📄"
          label="Terms of Service"
          onPress={() => navigation.navigate('Terms')}
        />
        <ProfileMenuItem
          icon="🔐"
          label="Privacy Policy"
          onPress={() => navigation.navigate('Terms')}
        />
        <ProfileMenuItem icon="🔒" label="Privacy & Safety" onPress={() => {}} />

        <SectionLabel label="About" />
        <ProfileMenuItem icon="ℹ️" label="App Version" value="1.0.0" />

        {/* Demo / Simulation Section */}
        <View className="mt-5 overflow-hidden rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-4">
          <Text className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#7A5800]">
            🧪 Simulation & Demo
          </Text>
          <DemoButton
            icon="⬆️"
            label="Force App Update"
            onPress={() => navigation.navigate('ForceUpdate')}
          />
          <DemoButton
            icon="🔧"
            label="Maintenance Mode"
            onPress={() => navigation.navigate('Maintenance')}
          />
          <DemoButton
            icon="📡"
            label="No Coverage Area"
            onPress={() => navigation.navigate('NoCoverage')}
            accent="text-danger"
          />
          <Text className="mt-1 text-[10px] text-text-tertiary">
            These screens are shown automatically in production based on server conditions.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
