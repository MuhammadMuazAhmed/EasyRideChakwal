import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { useSavedPlaces } from '@/shared/hooks/useQueries';
import { useRideStore } from '@/rider/store/rideStore';
import { LoadingState } from '@/shared/components/common/StateViews';
import type { Location } from '@/shared/types';
import type { RiderStackParamList } from '@/navigation/types';

const placeColors = [
  { bg: 'bg-accent-light', border: 'border-accent' },
  { bg: 'bg-blue-50', border: 'border-blue-200' },
  { bg: 'bg-green-50', border: 'border-green-200' },
  { bg: 'bg-pink-50', border: 'border-pink-200' },
];

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'SavedPlaces'>;

export function SavedPlacesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data: places, isLoading } = useSavedPlaces();
  const setDestination = useRideStore((s) => s.setDestination);

  if (isLoading) return <LoadingState message="Loading saved places..." />;

  const handleSelect = (place: { id: string; label: string; address: string; coordinates: Location['coordinates'] }) => {
    setDestination({
      id: place.id,
      name: place.label,
      address: place.address,
      coordinates: place.coordinates,
    });
    navigation.navigate('VehicleSelection');
  };

  return (
    <ScreenContainer className="bg-white">
      <TopBar
        title="Saved Places"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
        rightAction={
          <Pressable className="rounded-md bg-accent px-2 py-1">
            <Text className="text-[10px] font-bold text-primary">+ Add New</Text>
          </Pressable>
        }
      />
      <ScrollView className="flex-1 p-2.5">
        <Text className="mb-2 text-[10px] font-bold uppercase text-text-tertiary">
          Aapki Saved Jagahein
        </Text>
        {places?.map((place, index) => {
          const colors = placeColors[index % placeColors.length];
          return (
            <Pressable
              key={place.id}
              onPress={() => handleSelect(place)}
              className={`mb-2 flex-row items-center gap-2.5 rounded-xl border-[1.5px] p-3 ${colors.bg} ${colors.border}`}
            >
              <Text className="text-[22px]">{place.icon}</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text-primary">{place.label}</Text>
                <Text className="text-[11px] text-text-secondary">{place.address}</Text>
              </View>
              <Text className="text-text-tertiary">›</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}
