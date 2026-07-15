import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/shared/components/common/TopBar';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'ForceUpdate'>;

const newFeatures = [
  { icon: '⚡', text: 'Faster ride matching — under 30 seconds' },
  { icon: '🗺️', text: 'Improved live tracking with smoother map' },
  { icon: '💸', text: 'JazzCash & EasyPaisa in-app payments' },
  { icon: '🔒', text: 'Enhanced safety & SOS improvements' },
  { icon: '🌐', text: 'Full Urdu language support' },
];

export function ForceUpdateScreen() {
  useNavigation<NavigationProp>();

  const openPlayStore = () => {
    void Linking.openURL('https://play.google.com/store');
  };

  return (
    <ScreenContainer className="bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="min-h-full items-center justify-center px-6 py-12"
      >
        {/* Logo Badge */}
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-accent shadow-lg">
          <Text style={{ fontSize: 44 }}>🚕</Text>
        </View>

        <Text className="mb-1 text-center text-2xl font-extrabold text-white">Update Required</Text>
        <Text className="mb-6 text-center text-sm text-[#aaaaaa]">
          Easy Ride Chakwal ka naya version available hai
        </Text>

        {/* Version comparison */}
        <View className="mb-6 w-full flex-row items-center justify-center gap-3">
          <View className="flex-1 items-center rounded-xl border border-[#333333] bg-[#1a1a1a] p-3">
            <Text className="text-[10px] uppercase text-[#888888]">Current</Text>
            <Text className="text-lg font-bold text-danger">1.0.0</Text>
          </View>
          <Text className="text-xl text-[#555555]">→</Text>
          <View className="flex-1 items-center rounded-xl border border-[#2a4a1a] bg-[#142208] p-3">
            <Text className="text-[10px] uppercase text-[#888888]">New</Text>
            <Text className="text-lg font-bold text-success">2.1.0</Text>
          </View>
        </View>

        {/* New Features Card */}
        <View className="mb-6 w-full overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <View className="border-b border-[#2a2a2a] px-4 py-3">
            <Text className="text-sm font-extrabold text-accent">✨ Naye Features</Text>
          </View>
          <View className="p-3">
            {newFeatures.map((f) => (
              <View key={f.text} className="mb-2 flex-row items-start gap-3">
                <Text style={{ fontSize: 16 }}>{f.icon}</Text>
                <Text className="flex-1 text-[12px] leading-5 text-[#cccccc]">{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={openPlayStore}
          className="mb-3 w-full items-center rounded-2xl bg-accent py-4 active:opacity-85"
        >
          <Text className="text-sm font-extrabold text-primary">▶ Play Store par Update Karein</Text>
        </Pressable>

        <Text className="text-center text-[11px] text-[#555555]">
          Version 2.1.0 — Yeh update zaroori hai. App continue nahi kar sakti.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
