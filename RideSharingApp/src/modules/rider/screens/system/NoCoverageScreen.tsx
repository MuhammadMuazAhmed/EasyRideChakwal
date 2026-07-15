import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/shared/components/common/TopBar';
import { brand } from '@/shared/theme';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'NoCoverage'>;

const CHAKWAL_CENTER = { x: 0.5, y: 0.5 };

// Mock nearby cities in the service area
const servicePins = [
  { label: 'Chakwal City', x: 0.5, y: 0.5, inService: true },
  { label: 'Pind Dadan Khan', x: 0.3, y: 0.35, inService: true },
  { label: 'Talagang', x: 0.68, y: 0.62, inService: true },
  { label: 'Choa Saidan Shah', x: 0.22, y: 0.68, inService: true },
];

const RIDER_PIN = { x: 0.78, y: 0.22 }; // outside service area

export function NoCoverageScreen() {
  const navigation = useNavigation<NavigationProp>();

  const requestCoverage = () => {
    void Linking.openURL(`https://wa.me/92${brand.supportPhone.replace(/\D/g, '').slice(1)}?text=Coverage%20request%20for%20my%20area`);
  };

  return (
    <ScreenContainer className="bg-surface-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="min-h-full px-5 py-6"
      >
        {/* Header */}
        <View className="mb-5 items-center">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-danger/10">
            <Text style={{ fontSize: 40 }}>📡</Text>
          </View>
          <Text className="mb-1 text-center text-xl font-extrabold text-text-primary">
            No Coverage in Your Area
          </Text>
          <Text className="text-center text-sm text-text-secondary">
            Aapki location Easy Ride Chakwal ki service area se bahar hai. Hum jald hi expand kar rahe hain!
          </Text>
        </View>

        {/* Mock Map */}
        <View className="mb-5 overflow-hidden rounded-2xl border border-border bg-[#E8F0D8]" style={{ height: 220 }}>
          {/* Map grid overlay */}
          <View className="absolute inset-0">
            {[0.25, 0.5, 0.75].map((x) => (
              <View
                key={`v-${x}`}
                style={{ position: 'absolute', left: `${x * 100}%`, top: 0, bottom: 0, width: 1, backgroundColor: '#C8D8A8', opacity: 0.6 }}
              />
            ))}
            {[0.33, 0.66].map((y) => (
              <View
                key={`h-${y}`}
                style={{ position: 'absolute', top: `${y * 100}%`, left: 0, right: 0, height: 1, backgroundColor: '#C8D8A8', opacity: 0.6 }}
              />
            ))}
          </View>

          {/* Service area circle */}
          <View
            style={{
              position: 'absolute',
              left: `${(CHAKWAL_CENTER.x - 0.28) * 100}%`,
              top: `${(CHAKWAL_CENTER.y - 0.38) * 100}%`,
              width: '56%',
              aspectRatio: 1,
              borderRadius: 9999,
              backgroundColor: '#16A34A18',
              borderWidth: 2,
              borderColor: '#16A34A',
              borderStyle: 'dashed',
            }}
          />

          {/* Service area pins */}
          {servicePins.map((pin) => (
            <View
              key={pin.label}
              style={{ position: 'absolute', left: `${pin.x * 100}%`, top: `${pin.y * 100}%`, transform: [{ translateX: -10 }, { translateY: -10 }] }}
            >
              <View className="items-center">
                <View className="h-5 w-5 items-center justify-center rounded-full bg-success border-2 border-white shadow">
                  <Text style={{ fontSize: 8, color: '#fff' }}>●</Text>
                </View>
              </View>
            </View>
          ))}

          {/* Rider pin (outside) */}
          <View
            style={{
              position: 'absolute',
              left: `${RIDER_PIN.x * 100}%`,
              top: `${RIDER_PIN.y * 100}%`,
              transform: [{ translateX: -12 }, { translateY: -24 }],
            }}
          >
            <View className="items-center">
              <View className="h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-danger shadow-md">
                <Text style={{ fontSize: 12 }}>📍</Text>
              </View>
              <Text
                className="mt-0.5 rounded-sm bg-danger px-1 text-[8px] font-bold text-white"
                style={{ overflow: 'hidden' }}
              >
                You
              </Text>
            </View>
          </View>

          {/* Legend */}
          <View className="absolute bottom-2 left-2 right-2 flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-1 rounded-full bg-white px-2 py-0.5">
              <View className="h-2 w-2 rounded-full bg-success" />
              <Text className="text-[9px] text-text-secondary">Service Area</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-white px-2 py-0.5">
              <View className="h-2 w-2 rounded-full bg-danger" />
              <Text className="text-[9px] text-text-secondary">Your Location</Text>
            </View>
          </View>
        </View>

        {/* Coverage request info */}
        <View className="mb-5 rounded-2xl border border-border bg-white p-4">
          <Text className="mb-2 text-sm font-bold text-text-primary">📍 Currently Serving</Text>
          <View className="flex-row flex-wrap gap-2">
            {['Chakwal City', 'Pind Dadan Khan', 'Talagang', 'Choa Saidan Shah', 'Lawa'].map((city) => (
              <View key={city} className="rounded-full bg-success/10 px-3 py-1">
                <Text className="text-[11px] font-semibold text-success">{city}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <Pressable
          onPress={requestCoverage}
          className="mb-3 w-full items-center rounded-2xl bg-primary py-4 active:opacity-80"
        >
          <Text className="text-sm font-extrabold text-accent">📡 Is Area mein Coverage Request Karein</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          className="w-full items-center rounded-2xl border-2 border-border bg-white py-4 active:opacity-80"
        >
          <Text className="text-sm font-bold text-text-primary">🔄 Location Dubara Check Karein</Text>
        </Pressable>

        <Text className="mt-4 text-center text-[11px] text-text-tertiary">
          Hum Chakwal District mein tezi se expand ho rahe hain — shukria aapki patience ka!
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
