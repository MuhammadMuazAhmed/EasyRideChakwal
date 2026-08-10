import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { ScreenContainer, BackButton } from '@/shared/components/common/TopBar';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'Selfie'>;

function StepHeader({ current = 2, total = 6 }: { current?: number; total?: number }) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          Step {current} of {total}
        </Text>
        <Text className="text-[11px] font-bold text-[#F5C400]">
          Live Selfie
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

export function SelfieScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const selfieUri = useDriverRegistrationStore((s) => s.selfieUri);
  const setField = useDriverRegistrationStore((s) => s.setField);

  const [localUri, setLocalUri] = useState<string | null>(selfieUri);

  const handleCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Selfie lene ke liye camera permission zaroori hai.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
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

  const handleNext = () => {
    if (!localUri) {
      Alert.alert('Image Required', 'Agay barhne ke liye selfie capture karein.');
      return;
    }
    setField('selfieUri', localUri);
    navigation.navigate('Cnic');
  };

  return (
    <ScreenContainer className="bg-white">
      {/* Refined Branded Header */}
      <View
        className="bg-primary px-5 pb-4 flex-row items-center gap-3"
        style={{ paddingTop: Math.max(insets.top + 12, 44) }}
      >
        <BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Text className="text-[18px] font-bold text-white tracking-tight">
          Live Selfie
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
          <StepHeader current={2} total={6} />

          {/* Heading & Instructions */}
          <Text className="text-[24px] font-bold text-[#111111] tracking-tight mb-1">
            Live Selfie capture karein
          </Text>
          <Text className="text-[14px] text-[#666666] mb-6 leading-5">
            CNIC haath mein pakad kar live selfie lein taake aap ki identity verify ho sake.
          </Text>

          {/* Selfie Capture Framing Card */}
          <View className="mb-6 items-center justify-center">
            <View className="w-full aspect-[4/4.5] max-w-[290px] rounded-2xl bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] overflow-hidden items-center justify-center relative shadow-sm">
              {localUri ? (
                <>
                  <Image source={{ uri: localUri }} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute top-3 right-3 bg-[#10B981] px-3 py-1 rounded-full flex-row items-center">
                    <Text className="text-white text-[11px] font-bold">Captured ✓</Text>
                  </View>
                </>
              ) : (
                <View className="items-center justify-center px-6 py-8 w-full h-full">
                  {/* Oval Face Silhouette Guide */}
                  <View className="w-36 h-44 rounded-[70px] border-2 border-dashed border-[#F5C400] items-center justify-center bg-white/80 mb-4 p-2">
                    <View className="w-14 h-14 rounded-full bg-[#E5E7EB] mb-2 items-center justify-center">
                      <View className="w-7 h-7 rounded-full bg-[#9CA3AF]" />
                    </View>
                    <View className="w-20 h-8 rounded-t-full bg-[#D1D5DB]" />
                  </View>

                  <Text className="text-[13px] font-bold text-[#111111] text-center mb-1">
                    Position your face & CNIC
                  </Text>
                  <Text className="text-[11px] text-[#6B7280] text-center leading-4">
                    Frame ke andar apna chehra aur CNIC saaf dikhayen
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-auto gap-3">
            <Pressable
              onPress={handleCapture}
              className={`h-[54px] rounded-xl items-center justify-center flex-row active:opacity-90 ${
                localUri ? 'bg-[#F3F4F6] border border-[#D1D5DB]' : 'bg-[#F5C400]'
              }`}
            >
              <Text
                className={`text-[16px] font-bold tracking-wide ${
                  localUri ? 'text-[#111111]' : 'text-primary'
                }`}
              >
                {localUri ? 'Retake Selfie' : 'Take Selfie'}
              </Text>
            </Pressable>

            {localUri && (
              <Pressable
                onPress={handleNext}
                className="h-[54px] rounded-xl items-center justify-center flex-row active:opacity-90 bg-[#F5C400]"
              >
                <Text className="text-[16px] font-bold text-primary tracking-wide">
                  Agla Step →
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

