import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Card } from '@/shared/components/ui/Card';
import { brand, useTheme } from '@/shared/theme';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'Support'>;

const faqItems = [
  {
    q: 'Verification kitne din mein hoti hai?',
    a: 'Registration ke baad admin 24-48 ghante mein documents verify karta hai. Verified hone par aap online ja sakte hain.',
  },
  {
    q: 'Earnings kab wallet mein aati hain?',
    a: 'Har completed trip ke baad earning automatically aapke wallet balance mein add ho jati hai.',
  },
  {
    q: 'Ride reject kaise karein?',
    a: 'Incoming request screen par Reject button tap karein. Ride doosre available drivers ko dikhegi.',
  },
  {
    q: 'Withdrawal kaise karein?',
    a: 'Withdrawal feature jald available hogi. Filhal earnings aapke in-app wallet mein store rehti hain.',
  },
];

function FAQItem({ item }: { item: (typeof faqItems)[0] }) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <View
      style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
      className="mb-2.5 overflow-hidden rounded-2xl border"
    >
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between px-4 py-3.5 active:opacity-80"
      >
        <Text style={{ color: theme.textPrimary }} className="flex-1 pr-3 text-[13px] font-semibold">{item.q}</Text>
        <View
          style={{ backgroundColor: open ? theme.accent : theme.surfaceElevated }}
          className="h-6 w-6 items-center justify-center rounded-full"
        >
          <Text
            style={{ color: open ? '#111111' : theme.textSecondary }}
            className="text-[11px] font-extrabold"
          >
            {open ? '−' : '+'}
          </Text>
        </View>
      </Pressable>

      {open && (
        <View style={{ borderTopColor: theme.border, backgroundColor: theme.accentLight }} className="border-t px-4 py-3">
          <Text style={{ color: theme.textSecondary }} className="text-[12px] leading-6">{item.a}</Text>
        </View>
      )}
    </View>
  );
}

export function DriverSupportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const openWhatsApp = () => {
    void Linking.openURL(`https://wa.me/923100570499`);
  };

  return (
    <ScreenContainer>
      <TopBar
        title="Driver Support"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 p-3.5" contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        <Card className="mb-4 items-center">
          <Text className="mb-1 text-3xl">💬</Text>
          <Text style={{ color: theme.textPrimary }} className="mb-1 text-sm font-bold">WhatsApp Support</Text>
          <Text style={{ color: theme.textSecondary }} className="mb-3 text-center text-xs">
            Driver support team 24/7 available hai
          </Text>
          <Pressable
            onPress={openWhatsApp}
            className="rounded-xl bg-accent px-6 py-3 active:opacity-90"
          >
            <Text className="font-bold text-primary">Chat on WhatsApp</Text>
          </Pressable>
          <Text style={{ color: theme.textMuted }} className="mt-2 text-xs">{brand.supportPhone}</Text>
        </Card>

        <Text style={{ color: theme.textMuted }} className="mb-2 text-[10px] font-bold uppercase tracking-widest px-1">
          Aksar Puchhe Janay Wale Sawalaat
        </Text>

        {faqItems.map((item) => (
          <FAQItem key={item.q} item={item} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
