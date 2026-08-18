import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { ScreenContainer } from '@/shared/components/common/TopBar';
import { AuthService } from '@/api/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useOtpTimer } from '@/shared/hooks';
import { formatPhoneNumber } from '@/shared/utils';
import { useTheme } from '@/shared/theme';
import { getDeviceFcmToken, syncFcmTokenWithBackend } from '@/shared/services/pushNotifications';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OtpVerification'>;
type RouteProps = RouteProp<AuthStackParamList, 'OtpVerification'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate box size: 6 boxes + 5 gaps (8px each) within a 32px padded container
const OTP_BOX_SIZE = Math.min(Math.floor((SCREEN_WIDTH - 32 - 5 * 10) / 6), 56);

export function OtpVerificationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme, isDark } = useTheme();
  const login = useAuthStore((s) => s.login);
  const phone = useAuthStore((s) => s.phone);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { formatted, canResend, reset } = useOtpTimer(30);

  const displayPhone = phone ?? formatPhoneNumber(route.params.phone);

  const handleVerify = useCallback(
    async (code: string) => {
      setLoading(true);
      try {
        const fcmToken = await getDeviceFcmToken();
        const response = await AuthService.verifyOtp({
          phone: route.params.phone,
          otp: code,
          role: route.params.role,
          fcmToken: fcmToken ?? undefined,
        });

        login(
          response.tokens.accessToken,
          response.tokens.refreshToken,
          displayPhone,
          route.params.role,
        );

        if (route.params.role === 'driver') {
          if (response.needsRegistration) {
            useDriverRegistrationStore
              .getState()
              .setField('phone', response.phone || route.params.phone);
          } else {
            void syncFcmTokenWithBackend();
          }
        } else {
          if (!response.needsRegistration) {
            void syncFcmTokenWithBackend();
          }
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          'Verification code ghalat hai ya server par koi masla aaya. Dobara try karein.';
        Alert.alert('Verification Failed', msg);
        setOtp('');
      } finally {
        setLoading(false);
      }
    },
    [route.params.phone, route.params.role, login, displayPhone],
  );

  useEffect(() => {
    if (otp.length === 6) {
      void handleVerify(otp);
    }
  }, [otp, handleVerify]);

  const handleResend = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    try {
      await AuthService.login({ phone: route.params.phone, role: route.params.role });
      reset();
      setOtp('');
    } catch (err: any) {
      const status = err?.response?.status;
      const msg =
        status === 400
          ? err.response?.data?.message ?? 'Bohot zyada requests. 10 minute baad try karein.'
          : 'OTP dobara bhejne mein masla aaya. Thori der baad try karein.';
      Alert.alert('OTP Resend Failed', msg);
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = otp.length === 6;

  return (
    <ScreenContainer>
      {/* Branded Header — matches Phone Number screen */}
      <View
        style={{ paddingTop: Math.max(insets.top + 12, 44), backgroundColor: theme.headerBg, borderBottomWidth: 1, borderBottomColor: theme.border }}
        className="px-5 pb-5"
      >
        <View className="flex-row items-center gap-3.5">
          <Image
            source={require('@/assets/images/logo.jpeg')}
            style={{ width: 48, height: 48, borderRadius: 12 }}
            resizeMode="cover"
          />
          <View className="justify-center">
            <Text style={{ color: theme.headerText }} className="text-[19px] font-bold tracking-tight">
              Easy Ride Chakwal
            </Text>
            <Text style={{ color: theme.headerSubtitle }} className="text-[12px] font-medium mt-0.5">
              OTP Verify Karein
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
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 32,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Heading — Centered */}
          <Text style={{ color: theme.textPrimary }} className="text-[24px] font-bold text-center tracking-tight">
            OTP Verify Karein
          </Text>

          {/* Explanation + phone number — Centered */}
          <Text style={{ color: theme.textSecondary }} className="text-[14px] text-center mt-2 leading-5">
            Hum ne aapke number par 6-digit OTP bheja hai
          </Text>
          <Text style={{ color: theme.textPrimary }} className="text-[16px] font-bold text-center mt-1">
            {displayPhone}
          </Text>

          {/* OTP Box Display + hidden input */}
          <View className="mt-9 mb-3 relative">
            {/* Visual boxes */}
            <View className="flex-row justify-center gap-[10px]">
              {Array.from({ length: 6 }).map((_, index) => {
                const digit = otp[index] ?? '';
                const isActive = index === otp.length && !loading;
                const isFilled = !!digit;

                return (
                  <View
                    key={index}
                    style={{
                      width: OTP_BOX_SIZE,
                      height: OTP_BOX_SIZE,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      backgroundColor: theme.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: isFilled
                        ? '#F5C400'
                        : isActive
                        ? '#F5C400'
                        : theme.cardBorder,
                    }}
                  >
                    {isFilled ? (
                      <Text
                        style={{
                          fontSize: OTP_BOX_SIZE * 0.42,
                          fontWeight: '700',
                          color: theme.inputText,
                          textAlign: 'center',
                          textAlignVertical: 'center',
                          includeFontPadding: false,
                        }}
                      >
                        {digit}
                      </Text>
                    ) : isActive ? (
                      /* blinking cursor indicator */
                      <View
                        style={{
                          width: 2,
                          height: OTP_BOX_SIZE * 0.4,
                          backgroundColor: '#F5C400',
                          borderRadius: 2,
                        }}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* Invisible TextInput captures keyboard input */}
            <TextInput
              value={otp}
              onChangeText={(text) => {
                if (!loading) {
                  setOtp(text.replace(/\D/g, '').slice(0, 6));
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
              }}
              caretHidden
              textContentType="oneTimeCode"
              importantForAutofill="yes"
            />
          </View>

          {/* Resend section — Centered */}
          <View className="mt-5 flex-row items-center justify-center gap-1">
            {canResend ? (
              <>
                <Text style={{ color: theme.textSecondary }} className="text-[13px]">OTP nahi mila?</Text>
                <Pressable
                  onPress={() => void handleResend()}
                  disabled={resendLoading}
                  className="active:opacity-70"
                >
                  <Text style={{ color: theme.textPrimary }} className="text-[13px] font-bold ml-1">
                    {resendLoading ? 'Bhej rahe hain...' : 'Resend OTP'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={{ color: theme.textSecondary }} className="text-[13px]">Resend OTP in</Text>
                <Text style={{ color: theme.textPrimary }} className="text-[13px] font-bold ml-1">{formatted}</Text>
              </>
            )}
          </View>

          {/* Verify Button */}
          <Pressable
            onPress={() => void handleVerify(otp)}
            disabled={!isComplete || loading}
            className="mt-8 h-[54px] rounded-xl items-center justify-center flex-row active:opacity-90 w-full"
            style={{
              backgroundColor: '#F5C400',
              opacity: isComplete && !loading ? 1 : 0.45,
            }}
          >
            {loading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="#111111" size="small" />
                <Text className="text-[16px] font-bold text-[#111111]">Verifying...</Text>
              </View>
            ) : (
              <Text className="text-[16px] font-bold text-[#111111] tracking-wide">
                Verify Karein →
              </Text>
            )}
          </Pressable>

          {/* Wrong number / go back — Centered */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-5 py-2 active:opacity-70"
          >
            <Text style={{ color: theme.textMuted }} className="text-center text-[13px]">
              Galat number?{' '}
              <Text style={{ color: theme.textPrimary }} className="font-bold">Wapas jao</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
