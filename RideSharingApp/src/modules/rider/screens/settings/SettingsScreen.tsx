import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { ProfileMenuItem } from '@/shared/components/common/ProfileComponents';
import { AppearanceModal } from '@/shared/components/common/AppearanceModal';
import { useTheme } from '@/shared/theme';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Settings'>;

function SectionLabel({ label }: { label: string }) {
  const { theme } = useTheme();
  return (
    <Text style={{ color: theme.textMuted }} className="mb-1 mt-5 px-1 text-[10px] font-bold uppercase tracking-widest">
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
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
      className="mb-2 flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 active:opacity-75"
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ color: accent ? undefined : theme.textPrimary }} className={`flex-1 text-sm font-semibold ${accent ?? ''}`}>{label}</Text>
      <Text style={{ color: theme.textMuted }}>›</Text>
    </Pressable>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { preference } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const appearanceLabel =
    preference === 'light' ? '☀️ Light' : preference === 'dark' ? '🌙 Dark' : '⚙️ Default';

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Settings"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-3" contentContainerClassName="pb-10">
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

        <SectionLabel label="Legal" />
        <ProfileMenuItem
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => navigation.navigate('Terms')}
        />
        <ProfileMenuItem
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => navigation.navigate('Terms')}
        />
        <ProfileMenuItem icon="lock-closed-outline" label="Privacy & Safety" onPress={() => {}} />

        <SectionLabel label="About" />
        <ProfileMenuItem icon="information-circle-outline" label="App Version" value="1.0.0" />

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

      <AppearanceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ScreenContainer>
  );
}

