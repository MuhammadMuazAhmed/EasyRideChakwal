import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { ScreenContainer, TopBar, BackButton } from '@/shared/components/common/TopBar';
import { Button } from '@/shared/components/ui/Button';
import { DriverService } from '@/modules/driver/services/driverService';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import { useAuthStore } from '@/store/authStore';
import { CloudinaryService } from '@/api/services/cloudinaryService';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'VehicleReg'>;

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

export function VehicleRegScreen() {
  const navigation = useNavigation<NavigationProp>();
  const storeData = useDriverRegistrationStore();
  const setField = useDriverRegistrationStore((s) => s.setField);

  const [regUri, setRegUri] = useState<string | null>(storeData.vehicleRegUri);
  const [clearanceUri, setClearanceUri] = useState<string | null>(storeData.policeClearanceUri);
  
  const [uploading, setUploading] = useState(false);
  const [currentDoc, setCurrentDoc] = useState('');
  const [progress, setProgress] = useState(0);

  const handleCapture = async (type: 'reg' | 'clearance') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission zaroori hai photo lene ke liye.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === 'reg') {
          setRegUri(result.assets[0].uri);
        } else {
          setClearanceUri(result.assets[0].uri);
        }
      }
    } catch {
      Alert.alert('Camera Error', 'Camera launch karne mein koi masla aaya.');
    }
  };

  const handleSubmit = async () => {
    if (!regUri) {
      Alert.alert('Required Document', 'Vehicle registration book ki picture zaroori hai.');
      return;
    }

    setUploading(true);
    try {
      const cleanPhone = storeData.phone.replace(/\+/g, '').replace(/\s+/g, '');
      const folder = `EasyRide/drivers/${cleanPhone}`;
      
      const uploads = [
        { key: 'selfie', uri: storeData.selfieUri!, name: 'Selfie', publicId: 'selfie' },
        { key: 'cnicFront', uri: storeData.cnicFrontUri!, name: 'CNIC Front', publicId: 'cnicFront' },
        { key: 'cnicBack', uri: storeData.cnicBackUri!, name: 'CNIC Back', publicId: 'cnicBack' },
        { key: 'license', uri: storeData.licenseUri!, name: 'Driving License', publicId: 'license' },
        { key: 'vehicleReg', uri: regUri, name: 'Vehicle Registration Book', publicId: 'vehicleReg' },
      ];

      if (clearanceUri) {
        uploads.push({
          key: 'policeClearance',
          uri: clearanceUri,
          name: 'Police Clearance Certificate',
          publicId: 'policeClearance',
        });
      }

      const urls: Record<string, string> = {};
      for (let i = 0; i < uploads.length; i++) {
        const item = uploads[i];
        setCurrentDoc(`Uploading ${item.name}...`);
        setProgress(0);
        const downloadUrl = await CloudinaryService.upload(item.uri, {
          folder,
          publicId: item.publicId,
          onProgress: (pct) => setProgress(pct),
        });
        urls[item.key] = downloadUrl;
      }

      setCurrentDoc('Details save ho rahi hain...');
      setProgress(100);

      // Format Expiry as YYYY-MM-DD for backend
      const formattedExpiry = storeData.licenseExpiry.split('/').reverse().join('-');

      const payload = {
        // Normalize phone: remove spaces so it never exceeds backend .max(15)
        phone: storeData.phone.replace(/\s+/g, '').trim(),
        firstName: storeData.firstName,
        lastName: storeData.lastName,
        vehicleType: storeData.vehicleType,
        vehicleModel: storeData.vehicleModel,
        vehiclePlate: storeData.vehiclePlate,
        vehicleColor: storeData.vehicleColor,
        vehicleYear: storeData.vehicleYear,
        cnicNumber: storeData.cnicNumber,
        licenseNumber: storeData.licenseNumber,
        licenseExpiry: formattedExpiry,
        documents: {
          selfie: urls.selfie,
          cnicFront: urls.cnicFront,
          cnicBack: urls.cnicBack,
          license: urls.license,
          vehicleReg: urls.vehicleReg,
          policeClearance: urls.policeClearance || undefined,
        },
      };

      const response = await DriverService.register(payload);
      
      setField('vehicleRegUri', regUri);
      setField('policeClearanceUri', clearanceUri);

      if (response && response.driverId) {
        setField('driverId', response.driverId);
      }

      // 🔑 Swap the temporary token for the permanent token returned by the backend.
      // Without this, GET /api/drivers/:id returns 400 because isTempToken() still matches.
      if (response?.token) {
        const currentStore = useAuthStore.getState();
        useAuthStore.setState({
          token: response.token,
          driverId: response.driverId ? response.driverId.toString() : currentStore.driverId,
        });
      }

      setUploading(false);
      navigation.getParent()?.navigate('DriverPending');
    } catch (err: any) {
      setUploading(false);
      Alert.alert(
        'Upload Failed',
        err.response?.data?.message ?? err.message ?? 'Documents upload aur profile submission fail ho gaya. Dobara try karein.'
      );
    }
  };

  if (uploading) {
    return (
      <ScreenContainer className="bg-primary justify-center items-center px-6">
        <ActivityIndicator size="large" color="#F5C400" className="mb-6" />
        <Text className="text-lg font-black text-white text-center mb-2">
          Documents upload ho rahe hain...
        </Text>
        <Text className="text-xs text-neutral-400 text-center mb-6 px-4">
          {currentDoc}
        </Text>
        <View className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden mb-2">
          <View className="bg-accent h-full rounded-full" style={{ width: `${progress}%` }} />
        </View>
        <Text className="text-sm font-bold text-accent">{progress}%</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-primary">
      <TopBar
        title="Vehicle Documents"
        leftAction={<BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />}
      />
      <ScrollView className="flex-1 px-4 pt-4 pb-8">
        <StepHeader current={6} />

        <Text className="mb-2 text-lg font-extrabold text-white">
          Documents ki verification
        </Text>
        <Text className="mb-5 text-xs text-neutral-400">
          Gari ke registration documents submit karein.
        </Text>

        {/* Vehicle Registration Book Card */}
        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
            Vehicle Registration Book (Required)
          </Text>
          <Pressable
            onPress={() => void handleCapture('reg')}
            className="w-full aspect-[1.6] rounded-xl bg-[#1E1E1E] border border-neutral-800 overflow-hidden items-center justify-center"
          >
            {regUri ? (
              <Image source={{ uri: regUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Text className="text-3xl mb-1">📄</Text>
                <Text className="text-xs font-semibold text-accent">Capture Registration Book</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Police Clearance Certificate Card (Optional) */}
        <View className="mb-6">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
              Police Clearance Certificate
            </Text>
            <Text className="text-[10px] font-bold uppercase text-accent">
              Optional — bohat important hai, jald verify hogi
            </Text>
          </View>
          <Pressable
            onPress={() => void handleCapture('clearance')}
            className="w-full aspect-[1.6] rounded-xl bg-[#1E1E1E] border border-neutral-800 overflow-hidden items-center justify-center"
          >
            {clearanceUri ? (
              <Image source={{ uri: clearanceUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Text className="text-3xl mb-1">📜</Text>
                <Text className="text-xs font-semibold text-accent">Capture Clearance (Optional)</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Button
          title="Submit Registration ✓"
          variant="yellow"
          onPress={handleSubmit}
          className="mt-2 py-4 rounded-xl"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
