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

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'Cnic'>;

function StepHeader({ current = 3, total = 6 }: { current?: number; total?: number }) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          Step {current} of {total}
        </Text>
        <Text className="text-[11px] font-bold text-[#F5C400]">
          CNIC Details
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

export function CnicScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const cnicFrontUri = useDriverRegistrationStore((s) => s.cnicFrontUri);
  const cnicBackUri = useDriverRegistrationStore((s) => s.cnicBackUri);
  const cnicNumber = useDriverRegistrationStore((s) => s.cnicNumber);
  const setField = useDriverRegistrationStore((s) => s.setField);

  const [frontUri, setFrontUri] = useState<string | null>(cnicFrontUri);
  const [backUri, setBackUri] = useState<string | null>(cnicBackUri);
  const [number, setNumber] = useState(cnicNumber);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleCapture = async (side: 'front' | 'back') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photos lene ke liye camera permission zaroori hai.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (side === 'front') {
          setFrontUri(result.assets[0].uri);
        } else {
          setBackUri(result.assets[0].uri);
        }
      }
    } catch {
      Alert.alert('Camera Error', 'Camera launch karne mein koi masla aaya.');
    }
  };

  const handleNext = () => {
    if (!frontUri) {
      Alert.alert('Front Image Required', 'Pehle CNIC Front ki picture capture karein.');
      return;
    }
    if (!backUri) {
      Alert.alert('Back Image Required', 'CNIC Back ki picture capture karein.');
      return;
    }

    const cnicRegex = /^\d{5}-\d{7}-\d$/;
    if (!cnicRegex.test(number)) {
      setError('CNIC format ghalat hai (e.g. 37201-1234567-1)');
      return;
    }

    setError(undefined);
    setField('cnicFrontUri', frontUri);
    setField('cnicBackUri', backUri);
    setField('cnicNumber', number);
    navigation.navigate('License');
  };

  const handleCnicChange = (text: string) => {
    setError(undefined);
    const cleaned = text.replace(/\D/g, ''); // keep numbers only
    let formatted = cleaned;
    
    if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    if (cleaned.length > 12) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
    }
    
    setNumber(formatted);
  };

  const isFormValid = !!frontUri && !!backUri && /^\d{5}-\d{7}-\d$/.test(number);

  return (
    <ScreenContainer className="bg-white">
      {/* Refined Branded Header */}
      <View
        className="bg-primary px-5 pb-4 flex-row items-center gap-3"
        style={{ paddingTop: Math.max(insets.top + 12, 44) }}
      >
        <BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Text className="text-[18px] font-bold text-white tracking-tight">
          CNIC Details
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
          <StepHeader current={3} total={6} />

          {/* Heading & Subtitle */}
          <Text className="text-[24px] font-bold text-[#111111] tracking-tight mb-1">
            CNIC photos aur number
          </Text>
          <Text className="text-[14px] text-[#666666] mb-6 leading-5">
            CNIC ki saaf pictures upload karein (Front pehle, phir Back).
          </Text>

          {/* CNIC Front Upload Card */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              CNIC Front Side
            </Text>
            <Pressable
              onPress={() => void handleCapture('front')}
              className={`w-full aspect-[2/1] rounded-2xl bg-[#F9FAFB] border-[1.5px] overflow-hidden items-center justify-center relative active:opacity-90 ${
                frontUri ? 'border-[#F5C400]' : 'border-[#E5E7EB]'
              }`}
            >
              {frontUri ? (
                <>
                  <Image source={{ uri: frontUri }} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute top-2.5 right-2.5 bg-[#10B981] px-2.5 py-0.5 rounded-full">
                    <Text className="text-white text-[10px] font-bold">Front Captured ✓</Text>
                  </View>
                </>
              ) : (
                <View className="items-center justify-center px-4 py-3">
                  <View className="w-10 h-10 rounded-full bg-[#FEF3C7] items-center justify-center mb-2">
                    <View className="w-5 h-3.5 border-2 border-[#D97706] rounded-sm items-center justify-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    </View>
                  </View>
                  <Text className="text-[14px] font-bold text-[#111111] mb-0.5">
                    Capture Front Side
                  </Text>
                  <Text className="text-[11px] text-[#6B7280]">
                    Tap to capture or upload
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* CNIC Back Upload Card */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              CNIC Back Side
            </Text>
            <Pressable
              onPress={() => void handleCapture('back')}
              className={`w-full aspect-[2/1] rounded-2xl bg-[#F9FAFB] border-[1.5px] overflow-hidden items-center justify-center relative active:opacity-90 ${
                backUri ? 'border-[#F5C400]' : 'border-[#E5E7EB]'
              }`}
            >
              {backUri ? (
                <>
                  <Image source={{ uri: backUri }} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute top-2.5 right-2.5 bg-[#10B981] px-2.5 py-0.5 rounded-full">
                    <Text className="text-white text-[10px] font-bold">Back Captured ✓</Text>
                  </View>
                </>
              ) : (
                <View className="items-center justify-center px-4 py-3">
                  <View className="w-10 h-10 rounded-full bg-[#FEF3C7] items-center justify-center mb-2">
                    <View className="w-5 h-3.5 border-2 border-[#D97706] rounded-sm items-center justify-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    </View>
                  </View>
                  <Text className="text-[14px] font-bold text-[#111111] mb-0.5">
                    Capture Back Side
                  </Text>
                  <Text className="text-[11px] text-[#6B7280]">
                    Tap to capture or upload
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* CNIC Number Field */}
          <View className="mb-7">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              CNIC Number
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                error
                  ? 'border-danger'
                  : isFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="37201-1234567-1"
                placeholderTextColor="#9CA3AF"
                value={number}
                onChangeText={handleCnicChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="numeric"
                maxLength={15}
                className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {error && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {error}
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

