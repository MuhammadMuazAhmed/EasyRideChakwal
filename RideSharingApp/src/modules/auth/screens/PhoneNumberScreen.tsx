import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { ScreenContainer } from '@/shared/components/common/TopBar';
import { AuthService } from '@/api/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { AuthStackParamList } from '@/navigation/types';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Valid phone number required')
    .regex(/^3\d{9}$/, 'Enter valid Pakistan number (03XX...)'),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PhoneNumber'>;

export function PhoneNumberScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const setPhone = useAuthStore((s) => s.setPhone);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [isFocused, setIsFocused] = useState(false);
  const [selectorWidth, setSelectorWidth] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const tabIndicatorStyle = useAnimatedStyle(() => {
    const halfWidth = selectorWidth > 0 ? (selectorWidth - 8) / 2 : 0;
    return {
      width: halfWidth > 0 ? halfWidth : '50%',
      transform: [
        {
          translateX: withTiming(role === 'rider' ? 0 : halfWidth, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          }),
        },
      ],
    };
  }, [role, selectorWidth]);

  const onSubmit = async (data: PhoneForm) => {
    setLoading(true);
    try {
      await AuthService.login({ phone: `+92${data.phone}`, role });
      setPhone(`+92 ${data.phone.slice(0, 3)} ${data.phone.slice(3)}`);
      navigation.navigate('OtpVerification', { phone: data.phone, role });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'OTP bhejna mumkin nahi hua. Dobara try karein.';
      Alert.alert('OTP Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTermsPress = () => {
    Alert.alert(
      'Terms & Privacy Policy',
      'By using Easy Ride Chakwal, you agree to our Terms of Service and Privacy Policy regarding safe, reliable transportation services in Chakwal.',
    );
  };

  return (
    <ScreenContainer className="bg-white">
      {/* Refined Branded Header */}
      <View
        className="bg-primary px-5 pb-5"
        style={{ paddingTop: Math.max(insets.top + 12, 44) }}
      >
        <View className="flex-row items-center gap-3.5">
          <Image
            source={require('@/assets/images/logo.jpeg')}
            style={{ width: 48, height: 48, borderRadius: 12 }}
            resizeMode="cover"
          />
          <View className="justify-center">
            <Text className="text-[19px] font-bold text-white tracking-tight">
              Easy Ride Chakwal
            </Text>
            <Text className="text-[12px] text-gray-400 font-medium mt-0.5">
              Apna number darj karein
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Heading & Subtitle */}
          <Text className="text-[24px] font-bold text-[#111111] text-center tracking-tight">
            Enter your phone number
          </Text>
          <Text className="text-[14px] text-[#666666] text-center mt-2 leading-5">
            We'll send you a 6-digit OTP to verify your number.
          </Text>

          {/* Rider / Driver Segmented Selector */}
          <View
            className="my-7 flex-row rounded-xl bg-[#F3F4F6] p-1 relative h-[50px] items-center"
            onLayout={(e) => setSelectorWidth(e.nativeEvent.layout.width)}
          >
            {/* Animated Tab Indicator */}
            {selectorWidth > 0 && (
              <Animated.View
                className="absolute left-1 top-1 bottom-1 rounded-lg bg-[#111111]"
                style={tabIndicatorStyle}
              />
            )}

            <Pressable
              onPress={() => setRole('rider')}
              className="flex-1 items-center justify-center h-full z-10"
            >
              <Text
                className={`text-[13px] font-bold ${
                  role === 'rider' ? 'text-[#F5C400]' : 'text-[#6B7280]'
                }`}
              >
                Rider (سواری)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setRole('driver')}
              className="flex-1 items-center justify-center h-full z-10"
            >
              <Text
                className={`text-[13px] font-bold ${
                  role === 'driver' ? 'text-[#F5C400]' : 'text-[#6B7280]'
                }`}
              >
                Driver (ڈرائیور)
              </Text>
            </Pressable>
          </View>

          {/* Phone Number Field Label */}
          <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
            Phone Number
          </Text>

          {/* Unified Phone Input Field */}
          <View
            className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
              errors.phone
                ? 'border-danger'
                : isFocused
                ? 'border-[#F5C400]'
                : 'border-[#E5E7EB]'
            }`}
          >
            <View className="flex-row items-center gap-1.5 pr-3">
              <Text className="text-base">🇵🇰</Text>
              <Text className="text-[15px] font-bold text-[#111111]">+92</Text>
            </View>

            <View className="h-6 w-[1px] bg-[#E5E7EB] mx-2.5" />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="300 1234567"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                  selectionColor="#F5C400"
                />
              )}
            />
          </View>

          {errors.phone?.message && (
            <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
              {errors.phone.message}
            </Text>
          )}

          {/* Send OTP Button */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className={`mt-6 h-[54px] rounded-xl items-center justify-center flex-row ${
              loading ? 'bg-accent/70' : 'bg-accent active:opacity-90'
            }`}
            style={{ width: '100%' }}
          >
            {loading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="#111111" size="small" />
                <Text className="text-[16px] font-bold text-primary">Sending OTP...</Text>
              </View>
            ) : (
              <Text className="text-[16px] font-bold text-primary tracking-wide">
                Send OTP →
              </Text>
            )}
          </Pressable>

          {/* Terms & Privacy Statement */}
          <Text className="text-[12px] text-[#9CA3AF] text-center mt-6 leading-5">
            By continuing, you agree to our{' '}
            <Text onPress={handleTermsPress} className="font-semibold text-[#111111] underline">
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text onPress={handleTermsPress} className="font-semibold text-[#111111] underline">
              Privacy Policy
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
