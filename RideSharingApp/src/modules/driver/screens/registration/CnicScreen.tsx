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

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'Cnic'>;

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

export function CnicScreen() {
  const navigation = useNavigation<NavigationProp>();
  const cnicFrontUri = useDriverRegistrationStore((s) => s.cnicFrontUri);
  const cnicBackUri = useDriverRegistrationStore((s) => s.cnicBackUri);
  const cnicNumber = useDriverRegistrationStore((s) => s.cnicNumber);
  const setField = useDriverRegistrationStore((s) => s.setField);

  const [frontUri, setFrontUri] = useState<string | null>(cnicFrontUri);
  const [backUri, setBackUri] = useState<string | null>(cnicBackUri);
  const [number, setNumber] = useState(cnicNumber);
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

  // Autocomplete format (XXXXX-XXXXXXX-X) as driver types
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

  return (
    <ScreenContainer className="bg-primary">
      <TopBar
        title="CNIC Details"
        leftAction={<BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />}
      />
      <ScrollView className="flex-1 px-4 pt-4 pb-8">
        <StepHeader current={3} />

        <Text className="mb-2 text-lg font-extrabold text-white">
          CNIC photos aur number
        </Text>
        <Text className="mb-5 text-xs text-neutral-400">
          CNIC ki saaf pictures upload karein (Front pehle, phir Back).
        </Text>

        {/* CNIC Front Card */}
        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
            CNIC Front Side
          </Text>
          <Pressable
            onPress={() => void handleCapture('front')}
            className="w-full aspect-[1.6] rounded-xl bg-[#1E1E1E] border border-neutral-800 overflow-hidden items-center justify-center"
          >
            {frontUri ? (
              <Image source={{ uri: frontUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Text className="text-3xl mb-1">🪪</Text>
                <Text className="text-xs font-semibold text-accent">Capture Front Side</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* CNIC Back Card */}
        <View className="mb-5">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
            CNIC Back Side
          </Text>
          <Pressable
            onPress={() => void handleCapture('back')}
            className="w-full aspect-[1.6] rounded-xl bg-[#1E1E1E] border border-neutral-800 overflow-hidden items-center justify-center"
          >
            {backUri ? (
              <Image source={{ uri: backUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Text className="text-3xl mb-1">🪪</Text>
                <Text className="text-xs font-semibold text-accent">Capture Back Side</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* CNIC Input */}
        <View className="mb-6">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            CNIC Number
          </Text>
          <Input
            placeholder="37201-1234567-1"
            value={number}
            onChangeText={handleCnicChange}
            keyboardType="numeric"
            maxLength={15}
            error={error}
            className="bg-[#1F1F1F] border-neutral-800 text-white font-bold"
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
