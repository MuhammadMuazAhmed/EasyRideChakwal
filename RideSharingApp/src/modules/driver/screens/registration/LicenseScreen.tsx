import React, { useState } from 'react';
import {
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
import * as ImagePicker from 'expo-image-picker';

import { ScreenContainer, BackButton } from '@/shared/components/common/TopBar';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'License'>;

function StepHeader({ current = 4, total = 6 }: { current?: number; total?: number }) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          Step {current} of {total}
        </Text>
        <Text className="text-[11px] font-bold text-[#F5C400]">
          Driving License
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

export function LicenseScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const licenseUri = useDriverRegistrationStore((s) => s.licenseUri);
  const licenseNumber = useDriverRegistrationStore((s) => s.licenseNumber);
  const licenseExpiry = useDriverRegistrationStore((s) => s.licenseExpiry);
  const setField = useDriverRegistrationStore((s) => s.setField);

  const [localUri, setLocalUri] = useState<string | null>(licenseUri);
  const [number, setNumber] = useState(licenseNumber);
  const [expiry, setExpiry] = useState(licenseExpiry);
  const [numberFocused, setNumberFocused] = useState(false);
  const [expiryFocused, setExpiryFocused] = useState(false);
  const [errors, setErrors] = useState<{ number?: string; expiry?: string }>({});

  const handleCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'License ki picture lene ke liye camera permission zaroori hai.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLocalUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Camera Error', 'Camera launch karne mein koi masla aaya.');
    }
  };

  const handleExpiryChange = (text: string) => {
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: undefined }));
    
    // Auto format input as DD/MM/YYYY
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    
    setExpiry(formatted);
  };

  const validateFutureDate = (dateStr: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    
    const parts = dateStr.match(regex);
    if (!parts) return false;
    
    const day = Number(parts[1]);
    const month = Number(parts[2]);
    const year = Number(parts[3]);
    
    const dateObj = new Date(year, month - 1, day);
    
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dateObj > today;
  };

  const handleNext = () => {
    if (!localUri) {
      Alert.alert('Image Required', 'License ki picture capture karein.');
      return;
    }

    const newErrors: typeof errors = {};
    if (number.trim().length < 5) {
      newErrors.number = 'Sahi Driving License number enter karein (min 5 characters)';
    }

    if (!validateFutureDate(expiry)) {
      newErrors.expiry = 'Expiry date future ki honi chahiye (DD/MM/YYYY)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setField('licenseUri', localUri);
    setField('licenseNumber', number.trim());
    setField('licenseExpiry', expiry);
    navigation.navigate('VehicleDetails');
  };

  const isFormValid = !!localUri && number.trim().length >= 5 && validateFutureDate(expiry);

  return (
    <ScreenContainer className="bg-white">
      {/* Refined Branded Header */}
      <View
        className="bg-primary px-5 pb-4 flex-row items-center gap-3"
        style={{ paddingTop: Math.max(insets.top + 12, 44) }}
      >
        <BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Text className="text-[18px] font-bold text-white tracking-tight">
          Driving License
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
          <StepHeader current={4} total={6} />

          {/* Heading & Subtitle */}
          <Text className="text-[24px] font-bold text-[#111111] tracking-tight mb-1">
            License details enter karein
          </Text>
          <Text className="text-[14px] text-[#666666] mb-6 leading-5">
            Apne driving license ki picture aur details upload karein.
          </Text>

          {/* License Photo Card */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Driving License Photo
            </Text>
            <Pressable
              onPress={handleCapture}
              className={`w-full aspect-[2/1] rounded-2xl bg-[#F9FAFB] border-[1.5px] overflow-hidden items-center justify-center relative active:opacity-90 ${
                localUri ? 'border-[#F5C400]' : 'border-[#E5E7EB]'
              }`}
            >
              {localUri ? (
                <>
                  <Image source={{ uri: localUri }} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute top-2.5 right-2.5 bg-[#10B981] px-2.5 py-0.5 rounded-full">
                    <Text className="text-white text-[10px] font-bold">License Captured ✓</Text>
                  </View>
                </>
              ) : (
                <View className="items-center justify-center px-4 py-3">
                  <View className="w-10 h-10 rounded-full bg-[#FEF3C7] items-center justify-center mb-2">
                    <View className="w-5 h-3.5 border-2 border-[#D97706] rounded-sm items-center justify-center">
                      <View className="w-2 h-0.5 bg-[#D97706]" />
                    </View>
                  </View>
                  <Text className="text-[14px] font-bold text-[#111111] mb-0.5">
                    Capture License Photo
                  </Text>
                  <Text className="text-[11px] text-[#6B7280]">
                    Tap to capture or upload
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* License Number Input */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              License Number
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                errors.number
                  ? 'border-danger'
                  : numberFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="e.g. DL-12345"
                placeholderTextColor="#9CA3AF"
                value={number}
                onChangeText={(text) => {
                  setNumber(text);
                  if (errors.number) setErrors((prev) => ({ ...prev, number: undefined }));
                }}
                onFocus={() => setNumberFocused(true)}
                onBlur={() => setNumberFocused(false)}
                className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {errors.number && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {errors.number}
              </Text>
            )}
          </View>

          {/* License Expiry Date Input */}
          <View className="mb-7">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              License Expiry Date
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                errors.expiry
                  ? 'border-danger'
                  : expiryFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9CA3AF"
                value={expiry}
                onChangeText={handleExpiryChange}
                onFocus={() => setExpiryFocused(true)}
                onBlur={() => setExpiryFocused(false)}
                keyboardType="numeric"
                maxLength={10}
                className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {errors.expiry && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {errors.expiry}
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

