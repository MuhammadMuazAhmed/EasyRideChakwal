import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { ScreenContainer, TopBar, BackButton } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'Selfie'>;

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

export function SelfieScreen() {
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
    <ScreenContainer className="bg-primary">
      <TopBar
        title="Live Selfie"
        leftAction={<BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />}
      />
      <ScrollView className="flex-1 px-4 pt-4">
        <StepHeader current={2} />

        <Text className="mb-2 text-lg font-extrabold text-white">
          Live Selfie capture karein
        </Text>
        <Text className="mb-6 text-xs text-neutral-400 font-semibold text-accent">
          {"\"CNIC haath mein pakad kar live selfie lein\""}
        </Text>

        <View className="mb-6 items-center justify-center">
          {localUri ? (
            <View className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden border-2 border-accent">
              <Image source={{ uri: localUri }} className="w-full h-full" resizeMode="cover" />
            </View>
          ) : (
            <View className="w-full aspect-square max-w-[280px] rounded-2xl bg-[#1E1E1E] border border-dashed border-neutral-800 items-center justify-center">
              <Text className="text-4xl mb-3">🤳</Text>
              <Text className="text-[11px] text-neutral-500 text-center px-4">
                Selfie capture karne ke liye niche button tap karein
              </Text>
            </View>
          )}
        </View>

        <View className="gap-3 mt-4">
          <Button
            title={localUri ? "Retake Selfie 📸" : "Take Selfie 📸"}
            variant={localUri ? "outline" : "yellow"}
            onPress={handleCapture}
            className={`py-4 rounded-xl ${localUri ? 'border-neutral-700 bg-transparent text-white' : ''}`}
            textClassName={localUri ? 'text-white' : ''}
          />
          {localUri && (
            <Button
              title="Agla Step →"
              variant="yellow"
              onPress={handleNext}
              className="py-4 rounded-xl"
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
