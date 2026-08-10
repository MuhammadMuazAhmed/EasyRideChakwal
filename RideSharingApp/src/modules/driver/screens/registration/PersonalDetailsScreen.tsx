import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
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

import { ScreenContainer, BackButton } from '@/shared/components/common/TopBar';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import { useAuthStore } from '@/store/authStore';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'PersonalDetails'>;

function StepHeader({ current = 1, total = 6 }: { current?: number; total?: number }) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          Step {current} of {total}
        </Text>
        <Text className="text-[11px] font-bold text-[#F5C400]">
          Personal Details
        </Text>
      </View>
      <View className="flex-row gap-2 h-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            className={`flex-1 rounded-full ${
              i < current ? 'bg-[#F5C400]' : 'bg-[#E5E7EB]'
            }`}
          />
        ))}
      </View>
    </View>
  );
}

export function PersonalDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const authPhone = useAuthStore((s) => s.phone);
  const logout = useAuthStore((s) => s.logout);
  
  const firstName = useDriverRegistrationStore((s) => s.firstName);
  const lastName = useDriverRegistrationStore((s) => s.lastName);
  const storePhone = useDriverRegistrationStore((s) => s.phone);
  const setField = useDriverRegistrationStore((s) => s.setField);

  const displayPhone = storePhone || authPhone || '';

  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const handleBack = useCallback(() => {
    // Reset auth state to return safely to PhoneNumber screen without stale registration state
    logout();
  }, [logout]);

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [handleBack]);

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

  const isFormValid = localFirstName.trim().length >= 2 && localLastName.trim().length >= 2;

  return (
    <ScreenContainer className="bg-white">
      {/* Refined Branded Header */}
      <View
        className="bg-primary px-5 pb-4 flex-row items-center gap-3"
        style={{ paddingTop: Math.max(insets.top + 12, 44) }}
      >
        <BackButton onPress={handleBack} color="#FFFFFF" />
        <Text className="text-[18px] font-bold text-white tracking-tight">
          Personal Details
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step Indicator */}
          <StepHeader current={1} total={6} />
          
          {/* Heading & Subtitle */}
          <Text className="text-[24px] font-bold text-[#111111] tracking-tight mb-1">
            Apni details enter karein
          </Text>
          <Text className="text-[14px] text-[#666666] mb-6 leading-5">
            Apna sahi naam likhein jo aapke CNIC par darj hai.
          </Text>

          {/* Read-Only Mobile Number */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Mobile Number (Read-only)
            </Text>
            <View className="flex-row items-center border-[1.5px] border-[#E5E7EB] rounded-xl bg-[#F9FAFB] px-3.5 h-[54px]">
              <Text className="text-[15px] font-bold text-[#4B5563]">
                {displayPhone}
              </Text>
            </View>
          </View>

          {/* First Name Input */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              First Name
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                errors.firstName
                  ? 'border-danger'
                  : firstNameFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="e.g. Ali"
                placeholderTextColor="#9CA3AF"
                value={localFirstName}
                onChangeText={(text) => {
                  setLocalFirstName(text);
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
                }}
                onFocus={() => setFirstNameFocused(true)}
                onBlur={() => setFirstNameFocused(false)}
                className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {errors.firstName && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {errors.firstName}
              </Text>
            )}
          </View>

          {/* Last Name Input */}
          <View className="mb-7">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Last Name
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                errors.lastName
                  ? 'border-danger'
                  : lastNameFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="e.g. Khan"
                placeholderTextColor="#9CA3AF"
                value={localLastName}
                onChangeText={(text) => {
                  setLocalLastName(text);
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
                }}
                onFocus={() => setLastNameFocused(true)}
                onBlur={() => setLastNameFocused(false)}
                className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {errors.lastName && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {errors.lastName}
              </Text>
            )}
          </View>

          {/* Agla Step Button */}
          <Pressable
            onPress={handleNext}
            className="mt-auto h-[54px] rounded-xl items-center justify-center flex-row active:opacity-90 bg-accent"
            style={{
              opacity: isFormValid ? 1 : 0.5,
              width: '100%',
            }}
          >
            <Text className="text-[16px] font-bold text-primary tracking-wide">
              Agla Step →
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

