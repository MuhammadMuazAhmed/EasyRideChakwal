import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
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

import { Pressable } from 'react-native';

export function PhoneNumberScreen() {
  const navigation = useNavigation<NavigationProp>();
  const setPhone = useAuthStore((s) => s.setPhone);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'rider' | 'driver'>('rider');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '3100570499' },
  });

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

  return (
    <ScreenContainer className="bg-white">
      <View className="bg-primary px-4 pb-4 pt-12">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Text className="text-sm font-black text-primary">E</Text>
          </View>
          <View>
            <Text className="text-sm font-bold text-white">Easy Ride Chakwal</Text>
            <Text className="text-[10px] text-[#666666]">Apna number darj karein</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-6">
        <View className="mb-4 h-16 w-16 items-center justify-center self-center rounded-full border-2 border-accent bg-accent-light">
          <Text className="text-[26px]">📱</Text>
        </View>
        <Text className="mb-1 text-center text-[15px] font-bold text-text-primary">
          Enter Phone Number
        </Text>
        <Text className="mb-6 text-center text-[11px] text-text-secondary">
          Hum aapke number par 6-digit OTP bhejenge
        </Text>

        {/* Role Selector */}
        <View className="mb-5 flex-row rounded-xl bg-gray-100 p-1">
          <Pressable
            onPress={() => setRole('rider')}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, backgroundColor: role === 'rider' ? '#000000' : 'transparent' }}
          >
            <Text className="text-[11px] font-bold" style={{ color: role === 'rider' ? '#F5C400' : '#666666' }}>
              Rider (سواری)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setRole('driver')}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, backgroundColor: role === 'driver' ? '#F5C400' : 'transparent' }}
          >
            <Text className="text-[11px] font-bold" style={{ color: role === 'driver' ? '#000000' : '#666666' }}>
              Driver (ڈرائیور)
            </Text>
          </Pressable>
        </View>

        <Text className="mb-1 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
          Phone Number
        </Text>
        <View className="mb-4 flex-row gap-2">
          <View className="justify-center rounded-lg border-[1.5px] border-border bg-white px-2.5 py-2">
            <Text className="text-xs font-bold">🇵🇰 +92</Text>
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="310 0570499"
                  error={errors.phone?.message}
                  containerClassName="mb-0"
                />
              )}
            />
          </View>
        </View>

        <Button title="Send OTP" variant="yellow" loading={loading} onPress={handleSubmit(onSubmit)} />
      </View>
    </ScreenContainer>
  );
}
