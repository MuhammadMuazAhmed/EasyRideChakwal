import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { ScreenContainer, TopBar, BackButton } from '@/shared/components/common/TopBar';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'License'>;

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

export function LicenseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const licenseUri = useDriverRegistrationStore((s) => s.licenseUri);
  const licenseNumber = useDriverRegistrationStore((s) => s.licenseNumber);
  const licenseExpiry = useDriverRegistrationStore((s) => s.licenseExpiry);
  const setField = useDriverRegistrationStore((s) => s.setField);

  const [localUri, setLocalUri] = useState<string | null>(licenseUri);
  const [number, setNumber] = useState(licenseNumber);
  const [expiry, setExpiry] = useState(licenseExpiry);
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

  return (
    <ScreenContainer className="bg-primary">
      <TopBar
        title="Driving License"
        leftAction={<BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />}
      />
      <ScrollView className="flex-1 px-4 pt-4 pb-8">
        <StepHeader current={4} />

        <Text className="mb-2 text-lg font-extrabold text-white">
          License details enter karein
        </Text>
        <Text className="mb-5 text-xs text-neutral-400">
          Apne driving license ki picture aur details upload karein.
        </Text>

        {/* License Photo Card */}
        <View className="mb-5">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
            Driving License Photo
          </Text>
          <Pressable
            onPress={handleCapture}
            className="w-full aspect-[1.6] rounded-xl bg-[#1E1E1E] border border-neutral-800 overflow-hidden items-center justify-center"
          >
            {localUri ? (
              <Image source={{ uri: localUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Text className="text-3xl mb-1">🪪</Text>
                <Text className="text-xs font-semibold text-accent">Capture License Photo</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* License Number Input */}
        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            License Number
          </Text>
          <Input
            placeholder="e.g. DL-12345"
            value={number}
            onChangeText={(text) => {
              setNumber(text);
              if (errors.number) setErrors((prev) => ({ ...prev, number: undefined }));
            }}
            error={errors.number}
            className="bg-[#1F1F1F] border-neutral-800 text-white"
          />
        </View>

        {/* License Expiry Date Input */}
        <View className="mb-6">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            License Expiry Date
          </Text>
          <Input
            placeholder="DD/MM/YYYY"
            value={expiry}
            onChangeText={handleExpiryChange}
            keyboardType="numeric"
            maxLength={10}
            error={errors.expiry}
            className="bg-[#1F1F1F] border-neutral-800 text-white"
          />
        </View>

        <Button
          title="Agla Step →"
          variant="yellow"
          onPress={handleNext}
          className="mt-2 py-4 rounded-xl"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
