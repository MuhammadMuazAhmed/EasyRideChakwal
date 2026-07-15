import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer, TopBar, BackButton } from '@/shared/components/common/TopBar';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import { useAuthStore } from '@/store/authStore';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'PersonalDetails'>;

function StepHeader({ current, total = 6 }: { current: number; total?: number }) {
  return (
    <View className="mb-6 px-4">
      <Text className="text-[10px] font-bold uppercase tracking-widest text-accent">
        Step {current} of {total}
      </Text>
      <View className="mt-2 flex-row gap-1.5 h-1">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            className={`flex-1 rounded-full ${
              i < current ? 'bg-accent' : 'bg-neutral-800'
            }`}
          />
        ))}
      </View>
    </View>
  );
}

export function PersonalDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const authPhone = useAuthStore((s) => s.phone);
  
  const firstName = useDriverRegistrationStore((s) => s.firstName);
  const lastName = useDriverRegistrationStore((s) => s.lastName);
  const storePhone = useDriverRegistrationStore((s) => s.phone);
  const setField = useDriverRegistrationStore((s) => s.setField);

  const displayPhone = storePhone || authPhone || '';

  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const handleNext = () => {
    const newErrors: typeof errors = {};
    if (localFirstName.trim().length < 2) {
      newErrors.firstName = 'First Name kam az kam 2 characters ka hona chahiye';
    }
    if (localLastName.trim().length < 2) {
      newErrors.lastName = 'Last Name kam az kam 2 characters ka hona chahiye';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setField('firstName', localFirstName.trim());
    setField('lastName', localLastName.trim());
    if (!storePhone && authPhone) {
      setField('phone', authPhone);
    }
    navigation.navigate('Selfie');
  };

  return (
    <ScreenContainer className="bg-primary">
      <TopBar
        title="Personal Details"
        leftAction={<BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />}
      />
      <ScrollView className="flex-1 px-4 pt-4">
        <StepHeader current={1} />
        
        <Text className="mb-2 text-lg font-extrabold text-white">
          Apni details enter karein
        </Text>
        <Text className="mb-6 text-xs text-neutral-400">
          Apna sahi naam likhein jo aapke CNIC par darj hai.
        </Text>

        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            Mobile Number (Read-only)
          </Text>
          <Input
            value={displayPhone}
            editable={false}
            selectTextOnFocus={false}
            className="bg-[#1A1A1A] border-neutral-800 text-neutral-500 font-bold"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            First Name
          </Text>
          <Input
            placeholder="e.g. Ali"
            value={localFirstName}
            onChangeText={(text) => {
              setLocalFirstName(text);
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
            }}
            error={errors.firstName}
            className="bg-[#1F1F1F] border-neutral-800 text-white"
          />
        </View>

        <View className="mb-6">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            Last Name
          </Text>
          <Input
            placeholder="e.g. Khan"
            value={localLastName}
            onChangeText={(text) => {
              setLocalLastName(text);
              if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
            }}
            error={errors.lastName}
            className="bg-[#1F1F1F] border-neutral-800 text-white"
          />
        </View>

        <Button
          title="Agla Step →"
          variant="yellow"
          onPress={handleNext}
          className="mt-4 py-4 rounded-xl"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
