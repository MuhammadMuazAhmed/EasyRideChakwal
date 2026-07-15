import { useState } from 'react';
import { Animated, Easing, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Card } from '@/shared/components/ui/Card';
import { brand } from '@/shared/theme';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Support'>;

const faqItems = [
  {
    q: 'Ride kaise cancel karein?',
    a: 'Aap ride 2 minutes ke andar free cancel kar sakte hain. Driver ke aanay ke baad PKR 30 fee lagti hai. Active trip screen par "Cancel Ride" button tap karein.',
  },
  {
    q: 'Kaunse payment methods qubool hain?',
    a: 'Cash, JazzCash, EasyPaisa, aur debit/credit cards — sab supported hain. Payment Method screen se apni preferred method choose karein.',
  },
  {
    q: 'SOS kaise kaam karta hai?',
    a: 'Ride ke dauran SOS tap karein taake aapki live location aapke emergency contacts ke saath share ho jaye. Contacts Profile > Emergency Contacts mein add karein.',
  },
  {
    q: 'Driver late ho toh kya karein?',
    a: 'Tracking screen par driver ki real-time location dekhein. Agar wait zyada ho toh in-app chat ya call se directly contact karein. Zyada late hone par cancel bhi kar sakte hain.',
  },
  {
    q: 'Referral code kaise use karein?',
    a: 'Profile > Promo & Referral mein jayein. Apna code share karein ya doston ka code enter karein. Dono parties ko PKR 50 credit milta hai pehli ride ke baad.',
  },
  {
    q: 'App mein masla ho toh?',
    a: 'Pehle app forcefully close kar ke dobara kholein. Agar masla jari rahe toh WhatsApp support se rabta karein ya app uninstall / reinstall karein.',
  },
];

function FAQItem({ item }: { item: (typeof faqItems)[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-2 overflow-hidden rounded-2xl border border-border bg-white">
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between px-4 py-3.5 active:bg-surface-muted"
      >
        <Text className="flex-1 pr-3 text-[13px] font-semibold text-text-primary">{item.q}</Text>
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${open ? 'bg-primary' : 'bg-surface-muted'}`}
        >
          <Text
            className={`text-[11px] font-black ${open ? 'text-accent' : 'text-text-tertiary'}`}
          >
            {open ? '−' : '+'}
          </Text>
        </View>
      </Pressable>

      {open && (
        <View className="border-t border-border bg-accent/5 px-4 py-3">
          <Text className="text-[12px] leading-6 text-text-secondary">{item.a}</Text>
        </View>
      )}
    </View>
  );
}

export function SupportScreen() {
  const navigation = useNavigation<NavigationProp>();

  const openWhatsApp = () => {
    void Linking.openURL(`https://wa.me/923100570499`);
  };

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Support"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 p-3" contentContainerClassName="pb-10">
        {/* WhatsApp Card */}
        <Card className="mb-4 items-center">
          <Text className="mb-1 text-3xl">💬</Text>
          <Text className="mb-1 text-sm font-bold text-text-primary">WhatsApp Support</Text>
          <Text className="mb-3 text-center text-xs text-text-secondary">
            Hum 24/7 aapki madad ke liye hazir hain
          </Text>
          <Pressable
            onPress={openWhatsApp}
            className="rounded-xl bg-primary px-6 py-3 active:opacity-90"
          >
            <Text className="font-bold text-accent">Chat on WhatsApp</Text>
          </Pressable>
          <Text className="mt-2 text-xs text-text-tertiary">{brand.supportPhone}</Text>
        </Card>

        <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
          Aksar Puchhe Janay Wale Sawalaat
        </Text>

        {faqItems.map((item) => (
          <FAQItem key={item.q} item={item} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
