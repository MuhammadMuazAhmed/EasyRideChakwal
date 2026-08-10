import React, { useState } from 'react';
import {
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

import { ScreenContainer, BackButton } from '@/shared/components/common/TopBar';
import { useDriverRegistrationStore } from '@/store/driverRegistrationStore';
import type { DriverRegistrationStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverRegistrationStackParamList, 'VehicleDetails'>;

function StepHeader({ current = 5, total = 6 }: { current?: number; total?: number }) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          Step {current} of {total}
        </Text>
        <Text className="text-[11px] font-bold text-[#F5C400]">
          Vehicle Details
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

const VEHICLE_OPTIONS = [
  {
    type: 'car' as const,
    label: 'Car',
    image: require('@/assets/images/car.png'),
  },
  {
    type: 'bike' as const,
    label: 'Bike',
    image: require('@/assets/images/bike.png'),
  },
  {
    type: 'qingqi' as const,
    label: 'Qingqi',
    image: require('@/assets/images/qingqi.png'),
  },
];

export function VehicleDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const storeData = useDriverRegistrationStore();
  const setField = useDriverRegistrationStore((s) => s.setField);

  const [type, setType] = useState<'car' | 'bike' | 'qingqi'>(storeData.vehicleType);
  const [model, setModel] = useState(storeData.vehicleModel);
  const [plate, setPlate] = useState(storeData.vehiclePlate);
  const [color, setColor] = useState(storeData.vehicleColor);
  const [year, setYear] = useState(storeData.vehicleYear ? String(storeData.vehicleYear) : '');

  const [modelFocused, setModelFocused] = useState(false);
  const [plateFocused, setPlateFocused] = useState(false);
  const [colorFocused, setColorFocused] = useState(false);
  const [yearFocused, setYearFocused] = useState(false);

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

  const currentYear = new Date().getFullYear();
  const numericYear = Number(year);
  const isYearValid = !!year && !isNaN(numericYear) && numericYear >= 2000 && numericYear <= currentYear + 1;
  const isFormValid = model.trim().length >= 2 && plate.trim().length >= 3 && color.trim().length >= 2 && isYearValid;

  return (
    <ScreenContainer className="bg-white">
      {/* Refined Branded Header */}
      <View
        className="bg-primary px-5 pb-4 flex-row items-center gap-3"
        style={{ paddingTop: Math.max(insets.top + 12, 44) }}
      >
        <BackButton onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Text className="text-[18px] font-bold text-white tracking-tight">
          Vehicle Details
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
          <StepHeader current={5} total={6} />

          {/* Heading & Subtitle */}
          <Text className="text-[24px] font-bold text-[#111111] tracking-tight mb-1">
            Apni gari ki details
          </Text>
          <Text className="text-[14px] text-[#666666] mb-6 leading-5">
            Apni vehicle type aur details select karein.
          </Text>

          {/* Vehicle Type Selector Cards */}
          <View className="mb-6">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Select Vehicle Type
            </Text>
            <View className="flex-row gap-3">
              {VEHICLE_OPTIONS.map((opt) => {
                const isSelected = type === opt.type;
                return (
                  <Pressable
                    key={opt.type}
                    onPress={() => setType(opt.type)}
                    className={`flex-1 items-center rounded-2xl border-2 py-3 px-2 relative active:opacity-90 ${
                      isSelected
                        ? 'border-[#F5C400] bg-[#FFFBEB]'
                        : 'border-[#E5E7EB] bg-[#F9FAFB]'
                    }`}
                  >
                    <View className="h-12 w-full items-center justify-center mb-1.5">
                      <Image
                        source={opt.image}
                        style={{ width: '90%', height: 44 }}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      className={`text-[13px] font-bold ${
                        isSelected ? 'text-[#111111]' : 'text-[#6B7280]'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Vehicle Model Input */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Vehicle Model
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                errors.model
                  ? 'border-danger'
                  : modelFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="e.g. Honda CD 70 or Suzuki Alto"
                placeholderTextColor="#9CA3AF"
                value={model}
                onChangeText={(text) => {
                  setModel(text);
                  if (errors.model) setErrors((prev) => ({ ...prev, model: undefined }));
                }}
                onFocus={() => setModelFocused(true)}
                onBlur={() => setModelFocused(false)}
                className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {errors.model && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {errors.model}
              </Text>
            )}
          </View>

          {/* Vehicle Plate Number Input */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Vehicle Plate Number
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                errors.plate
                  ? 'border-danger'
                  : plateFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="e.g. AB-1234 or LE-9999"
                placeholderTextColor="#9CA3AF"
                value={plate}
                onChangeText={(text) => {
                  setPlate(text.toUpperCase());
                  if (errors.plate) setErrors((prev) => ({ ...prev, plate: undefined }));
                }}
                onFocus={() => setPlateFocused(true)}
                onBlur={() => setPlateFocused(false)}
                autoCapitalize="characters"
                className="flex-1 text-[16px] font-bold text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {errors.plate && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {errors.plate}
              </Text>
            )}
          </View>

          {/* Vehicle Color Input */}
          <View className="mb-5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Vehicle Color
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                errors.color
                  ? 'border-danger'
                  : colorFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="e.g. Black"
                placeholderTextColor="#9CA3AF"
                value={color}
                onChangeText={(text) => {
                  setColor(text);
                  if (errors.color) setErrors((prev) => ({ ...prev, color: undefined }));
                }}
                onFocus={() => setColorFocused(true)}
                onBlur={() => setColorFocused(false)}
                className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {errors.color && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {errors.color}
              </Text>
            )}
          </View>

          {/* Vehicle Model Year Input */}
          <View className="mb-7">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Vehicle Model Year
            </Text>
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl bg-white px-3.5 h-[54px] ${
                errors.year
                  ? 'border-danger'
                  : yearFocused
                  ? 'border-[#F5C400]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              <TextInput
                placeholder="e.g. 2022"
                placeholderTextColor="#9CA3AF"
                value={year}
                onChangeText={(text) => {
                  setYear(text.replace(/\D/g, ''));
                  if (errors.year) setErrors((prev) => ({ ...prev, year: undefined }));
                }}
                onFocus={() => setYearFocused(true)}
                onBlur={() => setYearFocused(false)}
                keyboardType="numeric"
                maxLength={4}
                className="flex-1 text-[16px] font-medium text-[#111111] p-0"
                selectionColor="#F5C400"
              />
            </View>
            {errors.year && (
              <Text className="text-xs text-danger font-medium mt-1.5 ml-1">
                {errors.year}
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

