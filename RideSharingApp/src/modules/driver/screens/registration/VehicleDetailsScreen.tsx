import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer, TopBar, BackButton } from '@/shared/components/common/TopBar';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'VehicleDetails'>;

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

const VEHICLE_OPTIONS = [
  { type: 'car' as const, label: 'Car', icon: '🚗' },
  { type: 'bike' as const, label: 'Bike', icon: '🏍️' },
  { type: 'qingqi' as const, label: 'Qingqi', icon: '🛺' },
];

export function VehicleDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const storeData = useDriverRegistrationStore();
  const setField = useDriverRegistrationStore((s) => s.setField);

  const [type, setType] = useState<'car' | 'bike' | 'qingqi'>(storeData.vehicleType);
  const [model, setModel] = useState(storeData.vehicleModel);
  const [plate, setPlate] = useState(storeData.vehiclePlate);
  const [color, setColor] = useState(storeData.vehicleColor);
  const [year, setYear] = useState(String(storeData.vehicleYear));
  
  const [errors, setErrors] = useState<{
    model?: string;
    plate?: string;
    color?: string;
    year?: string;
  }>({});

  const handleNext = () => {
    const newErrors: typeof errors = {};
    
    if (model.trim().length < 2) {
      newErrors.model = 'Vehicle model enter karein (e.g. Honda CD 70)';
    }
    if (plate.trim().length < 3) {
      newErrors.plate = 'Sahi plate number likhein (min 3 characters)';
    }
    if (color.trim().length < 2) {
      newErrors.color = 'Vehicle color likhein (e.g. Red)';
    }
    
    const numericYear = Number(year);
    const currentYear = new Date().getFullYear();
    if (!year || isNaN(numericYear) || numericYear < 2000 || numericYear > currentYear + 1) {
      newErrors.year = `Sahi model year likhein (2000 se ${currentYear + 1})`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setField('vehicleType', type);
    setField('vehicleModel', model.trim());
    setField('vehiclePlate', plate.trim().toUpperCase());
    setField('vehicleColor', color.trim());
    setField('vehicleYear', numericYear);

    navigation.navigate('VehicleReg');
  };

  return (
    <ScreenContainer className="bg-primary">
      <TopBar
        title="Vehicle Details"
        leftAction={<BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />}
      />
      <ScrollView className="flex-1 px-4 pt-4 pb-8">
        <StepHeader current={5} />

        <Text className="mb-2 text-lg font-extrabold text-white">
          Apni gari ki details
        </Text>
        <Text className="mb-5 text-xs text-neutral-400">
          Apni vehicle type aur details select karein.
        </Text>

        {/* Vehicle Type Selector Cards */}
        <View className="mb-5">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-2">
            Select Vehicle Type
          </Text>
          <View className="flex-row gap-3">
            {VEHICLE_OPTIONS.map((opt) => {
              const isSelected = type === opt.type;
              return (
                <Pressable
                  key={opt.type}
                  onPress={() => setType(opt.type)}
                  className={`flex-1 items-center rounded-2xl border-2 py-4 px-2 ${
                    isSelected ? 'border-accent bg-[#222222]' : 'border-neutral-800 bg-[#1E1E1E]'
                  }`}
                >
                  <Text className="text-3xl mb-1.5">{opt.icon}</Text>
                  <Text className={`text-xs font-bold ${isSelected ? 'text-accent' : 'text-neutral-400'}`}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Vehicle Model Input */}
        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            Vehicle Model (e.g. Honda 125, Suzuki Alto)
          </Text>
          <Input
            placeholder="e.g. Honda CD 70"
            value={model}
            onChangeText={(text) => {
              setModel(text);
              if (errors.model) setErrors((prev) => ({ ...prev, model: undefined }));
            }}
            error={errors.model}
            className="bg-[#1F1F1F] border-neutral-800 text-white"
          />
        </View>

        {/* Vehicle Plate Number Input (Uppercase enforced) */}
        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            Vehicle Plate Number
          </Text>
          <Input
            placeholder="e.g. AB-1234 or LE-9999"
            value={plate}
            onChangeText={(text) => {
              setPlate(text.toUpperCase());
              if (errors.plate) setErrors((prev) => ({ ...prev, plate: undefined }));
            }}
            autoCapitalize="characters"
            error={errors.plate}
            className="bg-[#1F1F1F] border-neutral-800 text-white font-bold"
          />
        </View>

        {/* Vehicle Color Input */}
        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            Vehicle Color
          </Text>
          <Input
            placeholder="e.g. Black"
            value={color}
            onChangeText={(text) => {
              setColor(text);
              if (errors.color) setErrors((prev) => ({ ...prev, color: undefined }));
            }}
            error={errors.color}
            className="bg-[#1F1F1F] border-neutral-800 text-white"
          />
        </View>

        {/* Vehicle Year Input */}
        <View className="mb-6">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
            Vehicle Model Year
          </Text>
          <Input
            placeholder="e.g. 2022"
            value={year}
            onChangeText={(text) => {
              setYear(text.replace(/\D/g, ''));
              if (errors.year) setErrors((prev) => ({ ...prev, year: undefined }));
            }}
            keyboardType="numeric"
            maxLength={4}
            error={errors.year}
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
