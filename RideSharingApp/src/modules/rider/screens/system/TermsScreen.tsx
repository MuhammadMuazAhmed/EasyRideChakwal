import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'Terms'>;

const content = {
  en: {
    langLabel: 'اردو',
    title: 'Terms & Privacy',
    termsHeading: 'Terms of Service',
    termsBody:
      'By using Easy Ride Chakwal, you agree to use the service lawfully and safely. You must provide accurate personal information and comply with all applicable local regulations. Misuse of the platform, including fraudulent bookings or harassment of drivers, may result in permanent account suspension.\n\nPayments must be completed as specified. Cash rides are settled directly with the driver; digital payments are processed through our secure gateway. Refund eligibility is subject to our cancellation policy.',
    privacyHeading: 'Privacy Policy',
    privacyBody:
      'We collect your name, phone number, and real-time location solely for ride matching and safety purposes. Your data is never sold to third parties. Location data is retained for 30 days to resolve disputes.\n\nYou may request deletion of your account and all associated data at any time by contacting our support team via WhatsApp.',
    checkboxLabel:
      'I have read and agree to the Terms of Service and Privacy Policy of Easy Ride Chakwal.',
    action: 'Accept & Continue',
  },
  ur: {
    langLabel: 'English',
    title: 'شرائط و رازداری',
    termsHeading: 'سروس کی شرائط',
    termsBody:
      'Easy Ride Chakwal استعمال کر کے آپ اس بات سے اتفاق کرتے ہیں کہ آپ سروس کو قانونی اور محفوظ طریقے سے استعمال کریں گے۔ آپ کو درست ذاتی معلومات فراہم کرنی ہوں گی اور تمام مقامی قوانین کی پاسداری کرنی ہوگی۔ پلیٹ فارم کا غلط استعمال، جیسے جھوٹی بکنگ یا ڈرائیور کو ہراساں کرنا، مستقل اکاؤنٹ معطلی کا سبب بن سکتا ہے۔\n\nادائیگی مقررہ طریقے سے مکمل کی جائے۔ کیش سواریاں براہِ راست ڈرائیور سے طے ہوتی ہیں۔ ڈیجیٹل ادائیگیاں ہمارے محفوظ گیٹ وے سے پروسیس ہوتی ہیں۔',
    privacyHeading: 'رازداری کی پالیسی',
    privacyBody:
      'ہم آپ کا نام، فون نمبر اور ریئل ٹائم مقام صرف سواری کے ملاپ اور حفاظت کے لیے جمع کرتے ہیں۔ آپ کا ڈیٹا کبھی فریقِ ثالث کو فروخت نہیں کیا جاتا۔ مقامی ڈیٹا تنازعات کے حل کے لیے 30 دن تک محفوظ رکھا جاتا ہے۔\n\nآپ کسی بھی وقت اپنا اکاؤنٹ اور تمام متعلقہ ڈیٹا حذف کروانے کی درخواست دے سکتے ہیں۔',
    checkboxLabel:
      'میں نے Easy Ride Chakwal کی سروس کی شرائط اور رازداری کی پالیسی پڑھ لی ہے اور اتفاق کرتا/کرتی ہوں۔',
    action: 'قبول کریں اور جاری رکھیں',
  },
} as const;

type Lang = 'en' | 'ur';

export function TermsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [lang, setLang] = useState<Lang>('en');
  const [accepted, setAccepted] = useState(false);
  const t = content[lang];

  return (
    <ScreenContainer className="bg-white">
      <TopBar
        title={t.title}
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
        rightAction={
          <Pressable
            onPress={() => setLang(lang === 'en' ? 'ur' : 'en')}
            className="rounded-full border border-border bg-surface-muted px-3 py-1"
          >
            <Text className="text-[11px] font-bold text-text-primary">{t.langLabel}</Text>
          </Pressable>
        }
      />

      <ScrollView className="flex-1 px-4 pt-3" contentContainerClassName="pb-8">
        {/* Terms Section */}
        <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
          <View className="border-b border-border bg-primary px-4 py-3">
            <Text className="text-sm font-extrabold text-accent">📄 {t.termsHeading}</Text>
          </View>
          <Text
            className="p-4 text-[13px] leading-6 text-text-secondary"
            style={{ writingDirection: lang === 'ur' ? 'rtl' : 'ltr' }}
          >
            {t.termsBody}
          </Text>
        </View>

        {/* Privacy Section */}
        <View className="mb-5 overflow-hidden rounded-2xl border border-border bg-white">
          <View className="border-b border-border bg-primary px-4 py-3">
            <Text className="text-sm font-extrabold text-accent">🔐 {t.privacyHeading}</Text>
          </View>
          <Text
            className="p-4 text-[13px] leading-6 text-text-secondary"
            style={{ writingDirection: lang === 'ur' ? 'rtl' : 'ltr' }}
          >
            {t.privacyBody}
          </Text>
        </View>

        {/* Accept Checkbox */}
        <Pressable
          onPress={() => setAccepted(!accepted)}
          className="mb-5 flex-row items-start gap-3 rounded-2xl border border-border bg-surface-muted p-4"
        >
          <View
            className={`mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${accepted ? 'border-primary bg-primary' : 'border-border bg-white'}`}
          >
            {accepted && <Text className="text-[10px] font-black text-accent">✓</Text>}
          </View>
          <Text
            className="flex-1 text-[12px] leading-5 text-text-secondary"
            style={{ writingDirection: lang === 'ur' ? 'rtl' : 'ltr' }}
          >
            {t.checkboxLabel}
          </Text>
        </Pressable>

        {/* Action Button */}
        <Pressable
          onPress={() => accepted && navigation.goBack()}
          className={`rounded-2xl py-4 items-center ${accepted ? 'bg-primary active:opacity-80' : 'bg-border'}`}
        >
          <Text className={`text-sm font-extrabold ${accepted ? 'text-accent' : 'text-text-tertiary'}`}>
            {t.action}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
