import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { Button } from '@/shared/components/ui/Button';
import { OtpInputDisplay } from '@/shared/components/common/ProfileComponents';
import { ScreenContainer } from '@/shared/components/common/TopBar';
import { AuthService } from '@/api/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useOtpTimer } from '@/shared/hooks';
import { formatPhoneNumber } from '@/shared/utils';
import { getDeviceFcmToken, syncFcmTokenWithBackend } from '@/shared/services/pushNotifications';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import type { AuthStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OtpVerification'>;
type RouteProps = RouteProp<AuthStackParamList, 'OtpVerification'>;

export function OtpVerificationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const login = useAuthStore((s) => s.login);
  const phone = useAuthStore((s) => s.phone);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { formatted, canResend, reset } = useOtpTimer(30);

  const displayPhone = phone ?? formatPhoneNumber(route.params.phone);

  const handleVerify = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const fcmToken = await getDeviceFcmToken();
      const response = await AuthService.verifyOtp({
        phone: route.params.phone,
        otp: code,
        role: route.params.role,
        fcmToken: fcmToken ?? undefined,
      });
      
      login(response.tokens.accessToken, response.tokens.refreshToken, displayPhone, route.params.role);

      if (route.params.role === 'driver') {
        if (response.needsRegistration) {
          useDriverRegistrationStore.getState().setField('phone', response.phone || route.params.phone);
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
    } finally {
      setLoading(false);
    }
  }, [route.params.phone, route.params.role, login, displayPhone, navigation]);

  useEffect(() => {
    if (otp.length === 6) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <ScreenContainer className="bg-white">
      <View className="bg-primary px-4 pb-4 pt-12">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Text className="text-sm font-black text-primary">E</Text>
          </View>
          <View>
            <Text className="text-sm font-bold text-white">Easy Ride Chakwal</Text>
            <Text className="text-[10px] text-[#666666]">OTP Verify Karein</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-6">
        <View className="mb-4 h-16 w-16 items-center justify-center self-center rounded-full border-2 border-accent bg-accent-light">
          <Text className="text-[26px]">📱</Text>
        </View>
        <Text className="mb-1 text-center text-[15px] font-bold text-text-primary">
          OTP Verify Karein
        </Text>
        <Text className="mb-5 text-center text-[11px] text-text-secondary">
          Hum ne aapke <Text className="font-bold text-text-primary">{displayPhone}</Text> par{'\n'}
          6-digit code bheja hai
        </Text>

        <View className="mb-5">
          <OtpInputDisplay value={otp} length={6} />
          <TextInput
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            className="absolute h-12 w-full opacity-0"
          />
        </View>

        <Text className="mb-5 text-center text-[11px] text-text-secondary">
          Dobara bhejein:{' '}
          {canResend ? (
            <Pressable
              onPress={() => void handleResend()}
              disabled={resendLoading}
            >
              <Text className="font-bold text-text-primary">
                {resendLoading ? 'Bhej rahe hain...' : 'Resend OTP'}
              </Text>
            </Pressable>
          ) : (
            <Text className="font-bold text-text-primary">{formatted}</Text>
          )}
        </Text>

        <Button
          title="Verify Karein ✓"
          variant="yellow"
          loading={loading}
          disabled={otp.length < 6}
          onPress={() => void handleVerify(otp)}
        />

        <Pressable onPress={() => navigation.goBack()} className="mt-3">
          <Text className="text-center text-[11px] text-text-tertiary">
            Galat number? <Text className="font-bold text-text-primary">Wapas jao</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
