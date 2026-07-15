import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DriverService } from '@/modules/driver/services/driverService';
import { getDeviceFcmToken, syncFcmTokenWithBackend } from '@/shared/services/pushNotifications';
import { useAuthStore } from '@/store/authStore';
import { TopBar, BackButton } from '@/shared/components/common/TopBar';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

const verificationSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  vehicleType: z.enum(['car', 'bike', 'qingqi']),
  vehicleModel: z.string().min(2, 'Vehicle model required'),
  vehiclePlate: z.string().min(4, 'Plate number required'),
  vehicleColor: z.string().min(2, 'Color required'),
  vehicleYear: z.number().min(2000).max(new Date().getFullYear() + 1),
  cnicNumber: z.string().regex(/^\d{5}-\d{7}-\d$/, 'CNIC format (XXXXX-XXXXXXX-X)'),
  licenseNumber: z.string().min(5, 'License number required'),
  licenseExpiry: z.string().min(10, 'Expiry date (YYYY-MM-DD) required'),
});

type VerificationForm = z.infer<typeof verificationSchema>;

export function VerificationScreen() {
  const phone = useAuthStore((s) => s.phone);
  const switchRole = useAuthStore((s) => s.switchRole);
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      vehicleType: 'car',
      vehicleModel: '',
      vehiclePlate: '',
      vehicleColor: '',
      vehicleYear: 2020,
      cnicNumber: '',
      licenseNumber: '',
      licenseExpiry: '2030-12-31',
    },
  });

  const onSubmit = async (data: VerificationForm) => {
    setLoading(true);
    try {
      const fcmToken = await getDeviceFcmToken();
      await DriverService.register({
        ...data,
        phone: phone?.replace(/\s+/g, '') ?? '',
        ...(fcmToken ? { fcmToken } : {}),
      });

      const roleResult = await switchRole('driver');
      if (!roleResult.success) {
        Alert.alert(
          'Registration Saved',
          roleResult.message ?? 'Profile saved. Please log in again to continue.',
        );
        setSubmitted(true);
        return;
      }
      void syncFcmTokenWithBackend();

      if (roleResult.needsRegistration) {
        Alert.alert('Registration Saved', 'Admin verification ke baad aap online ja sakte hain.');
      }

      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <Text className="text-4xl">⏳</Text>
        </View>
        <Text className="mb-2 text-center text-xl font-black text-text-primary">
          Verification Pending
        </Text>
        <Text className="mb-8 text-center text-xs text-text-secondary leading-5">
          Apka account register ho gaya hai. Humare admin apke documents verify kar rahe hain.{'\n'}
          Verification process mein 24-48 ghante lag sakte hain.
        </Text>
        <Button title="Wapas Jao" variant="yellow" onPress={logout} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <TopBar title="Driver Registration" leftAction={<BackButton onPress={logout} />} />
      <ScrollView className="flex-1 px-4 pt-4 pb-8">
        <Text className="mb-2 text-[15px] font-bold text-text-primary">
          Apni details complete karein
        </Text>
        <Text className="mb-6 text-[11px] text-text-secondary">
          Tammam maloomat bilkul sahi aur darj shuda documents ke mutabiq honi chahiye.
        </Text>

        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value } }) => (
            <Input label="First Name" value={value} onChangeText={onChange} error={errors.firstName?.message} />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value } }) => (
            <Input label="Last Name" value={value} onChangeText={onChange} error={errors.lastName?.message} />
          )}
        />

        <Controller
          control={control}
          name="cnicNumber"
          render={({ field: { onChange, value } }) => (
            <Input label="CNIC Number (e.g. 37201-1234567-1)" value={value} onChangeText={onChange} error={errors.cnicNumber?.message} />
          )}
        />

        <Controller
          control={control}
          name="licenseNumber"
          render={({ field: { onChange, value } }) => (
            <Input label="Driving License Number" value={value} onChangeText={onChange} error={errors.licenseNumber?.message} />
          )}
        />

        <Controller
          control={control}
          name="licenseExpiry"
          render={({ field: { onChange, value } }) => (
            <Input label="License Expiry Date (YYYY-MM-DD)" value={value} onChangeText={onChange} error={errors.licenseExpiry?.message} />
          )}
        />

        <Text className="my-3 text-xs font-bold text-text-primary">Gari ki details</Text>

        <Controller
          control={control}
          name="vehicleType"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className="mb-1 text-[10px] font-bold uppercase text-text-secondary">Vehicle Type</Text>
              <View className="flex-row gap-2">
                {['car', 'bike', 'qingqi'].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => onChange(t)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      padding: 10,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: value === t ? '#F5C400' : '#E5E5E5',
                      backgroundColor: value === t ? '#FFFCEB' : 'white',
                    }}
                  >
                    <Text className="text-xs font-bold capitalize text-text-primary">{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        />

        <Controller
          control={control}
          name="vehicleModel"
          render={({ field: { onChange, value } }) => (
            <Input label="Vehicle Model (e.g. Toyota Corolla)" value={value} onChangeText={onChange} error={errors.vehicleModel?.message} />
          )}
        />

        <Controller
          control={control}
          name="vehiclePlate"
          render={({ field: { onChange, value } }) => (
            <Input label="Vehicle Number Plate (e.g. RIW-1234)" value={value} onChangeText={onChange} error={errors.vehiclePlate?.message} />
          )}
        />

        <Controller
          control={control}
          name="vehicleColor"
          render={({ field: { onChange, value } }) => (
            <Input label="Vehicle Color" value={value} onChangeText={onChange} error={errors.vehicleColor?.message} />
          )}
        />

        <Controller
          control={control}
          name="vehicleYear"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Vehicle Year"
              value={String(value)}
              onChangeText={(t) => onChange(Number(t) || 2020)}
              keyboardType="number-pad"
              error={errors.vehicleYear?.message}
            />
          )}
        />

        <View className="mt-4 mb-10">
          <Button title="Submit Application" loading={loading} onPress={handleSubmit(onSubmit)} />
        </View>
      </ScrollView>
    </View>
  );
}
