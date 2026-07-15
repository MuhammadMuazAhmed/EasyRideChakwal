import { useState } from 'react';
import { Alert, Clipboard, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { StatCard } from '@/shared/components/ui/Card';
import { useReferral } from '@/shared/hooks/useQueries';
import { LoadingState } from '@/shared/components/common/StateViews';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Referral'>;

export function ReferralScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data, isLoading } = useReferral();
  const [promoInput, setPromoInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (isLoading || !data) return <LoadingState message="Loading referral info..." />;

  const handleCopy = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    Clipboard.setString(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralMessage = `Easy Ride Chakwal istemal karein aur apni pehli ride par PKR 50 discount payein!\n\nMera referral code: ${data.code}\n\nDownload: https://play.google.com/store`;

  const handleShareLink = async () => {
    try {
      await Share.share({ message: referralMessage, title: 'Easy Ride Chakwal — Referral Code' });
    } catch {
      // user dismissed
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(referralMessage);
    void import('react-native').then(({ Linking }) => {
      void Linking.openURL(`https://wa.me/?text=${encoded}`);
    });
  };

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Promo & Referral"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 p-3" contentContainerClassName="pb-10">
        <View className="mb-4 rounded-xl border-2 border-accent bg-accent-light p-4">
          <Text className="mb-1 text-sm font-bold text-[#7A5800]">🎁 Refer & Earn PKR 50</Text>
          <Text className="text-xs text-text-secondary">
            Share your code with friends. Both get PKR 50 credit!
          </Text>
        </View>

        <View className="mb-4 flex-row gap-2">
          <StatCard value={String(data.referrals)} label="Referrals" />
          <StatCard value={`PKR ${data.credits}`} label="Credits" valueClassName="text-accent" />
        </View>

        <Text className="mb-1 text-[10px] font-bold uppercase text-text-secondary">
          Your Referral Code
        </Text>
        <View className="mb-4 flex-row items-center justify-between rounded-xl border-2 border-accent bg-white p-3">
          <Text className="text-lg font-extrabold tracking-widest text-primary">{data.code}</Text>
          <Pressable
            onPress={handleCopy}
            className={`rounded-lg px-3 py-1.5 ${copied ? 'bg-success' : 'bg-primary'}`}
          >
            <Text className="text-xs font-bold text-accent">{copied ? '✓ Copied!' : 'Copy'}</Text>
          </Pressable>
        </View>

        <Input
          label="Enter Promo Code"
          placeholder="PROMO2026"
          value={promoInput}
          onChangeText={setPromoInput}
        />
        <Button
          title="Apply Promo Code"
          variant="yellow"
          className="mb-3"
          onPress={() => Alert.alert('Promo Applied!', `Code "${promoInput}" applied successfully.`)}
        />
        <Button title="📤 Share Referral Link" onPress={() => void handleShareLink()} className="mb-2" />
        <Pressable
          onPress={handleWhatsAppShare}
          className="w-full items-center rounded-2xl bg-[#25D366] py-3.5 active:opacity-85"
        >
          <Text className="text-sm font-extrabold text-white">💬 WhatsApp Share</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
