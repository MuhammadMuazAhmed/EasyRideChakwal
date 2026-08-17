import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { useRideStore } from '@/rider/store/rideStore';
import { useCurrentLocation } from '@/shared/hooks';
import type { Location } from '@/shared/types';
import type { RiderStackParamList } from '@/navigation/types';
import { GoogleMapsService, AutocompleteSuggestion } from '@/api/services/googleMapsService';
import { SearchHistoryService } from '@/api/services/searchHistoryService';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'LocationSearch'>;

export function LocationSearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { location } = useCurrentLocation();
  const pickup = useRideStore((s) => s.pickup);
  const setPickup = useRideStore((s) => s.setPickup);
  const setDestination = useRideStore((s) => s.setDestination);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Initialize pickup to rider's current GPS location if null
  useEffect(() => {
    if (pickup !== null || !location) return;
    void (async () => {
      try {
        const { name, address } = await GoogleMapsService.fetchAddressFromCoordinates(location, 'Current Location');
        setPickup({
          id: `gps-${Date.now()}`,
          name,
          address,
          coordinates: location,
        });
      } catch {
        setPickup({
          id: `gps-${Date.now()}`,
          name: 'Current Location',
          address: 'Current Location',
          coordinates: location,
        });
      }
    })();
  }, [location, pickup, setPickup]);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search history
  const { data: searchHistory = [] } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => SearchHistoryService.getSearchHistory(),
  });

  // Fetch autocomplete suggestions
  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ['placesAutocomplete', debouncedQuery],
    queryFn: () => GoogleMapsService.fetchPlacesAutocomplete(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const handleSelectHistory = (selectedLoc: Location) => {
    SearchHistoryService.saveSearch(selectedLoc).then(() => {
      setDestination(selectedLoc);
      navigation.navigate('VehicleSelection');
    });
  };

  const handleSelectSuggestion = async (suggestion: AutocompleteSuggestion) => {
    try {
      const coords = await GoogleMapsService.fetchPlaceDetails(suggestion.placeId);
      if (coords) {
        const selectedLoc: Location = {
          id: suggestion.placeId,
          name: suggestion.mainText,
          address: suggestion.secondaryText || suggestion.mainText,
          coordinates: coords,
        };
        await SearchHistoryService.saveSearch(selectedLoc);
        setDestination(selectedLoc);
        navigation.navigate('VehicleSelection');
      }
    } catch (error) {
      console.error('Failed to select suggestion:', error);
    }
  };

  return (
    <ScreenContainer className="bg-white">
      {/* Refined Light TopBar matching EasyRide design language */}
      <TopBar
        variant="light"
        title="Set Destination"
        leftAction={<BackButton onPress={() => navigation.goBack()} color="#111111" />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4 pt-3"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Current Location Card */}
          <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 shadow-sm">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#E6F4EA]">
              <View className="h-3.5 w-3.5 rounded-full bg-[#10B981] border-2 border-white" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-[#10B981] mb-0.5">
                Current Pickup Location
              </Text>
              <Text className="text-[14px] font-bold text-[#111111]" numberOfLines={1}>
                {pickup?.name ?? 'Locating current location...'}
              </Text>
              {pickup?.address && pickup.address !== pickup.name ? (
                <Text className="text-[12px] text-[#6B7280] mt-0.5" numberOfLines={1}>
                  {pickup.address}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Destination Search Field ("Kahan jaana hai?") */}
          <View
            className={`mb-6 flex-row items-center gap-3 rounded-2xl border-[1.5px] bg-white px-3.5 h-[54px] shadow-sm ${
              isFocused ? 'border-[#F5C400]' : 'border-[#E5E7EB]'
            }`}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={isFocused ? '#F5C400' : '#9CA3AF'}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Kahan jaana hai?"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[16px] font-medium text-[#111111] p-0"
              autoFocus
              selectionColor="#F5C400"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Quick Actions Section */}
          <View className="mb-6">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2.5">
              Quick Actions
            </Text>
            <View className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden divide-y divide-[#F3F4F6]">
              {/* Pin location on map */}
              <Pressable
                onPress={() => navigation.navigate('DestinationSelection')}
                className="flex-row items-center justify-between px-4 py-3.5 active:bg-[#F9FAFB]"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#FFFBEB]">
                    <Ionicons name="map-outline" size={20} color="#F5C400" />
                  </View>
                  <Text className="text-[14px] font-semibold text-[#111111]">
                    Pin location on map
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </Pressable>

              {/* Saved Places */}
              <Pressable
                onPress={() => navigation.navigate('SavedPlaces')}
                className="flex-row items-center justify-between px-4 py-3.5 active:bg-[#F9FAFB]"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#FFFBEB]">
                    <Ionicons name="bookmark-outline" size={20} color="#F5C400" />
                  </View>
                  <Text className="text-[14px] font-semibold text-[#111111]">
                    Saved Places
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </Pressable>
            </View>
          </View>

          {/* Search Results or Recent Searches Section */}
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2.5">
              {debouncedQuery.length > 2 ? 'Search Results' : 'Recent Searches'}
            </Text>

            {debouncedQuery.length > 2 ? (
              suggestions.length > 0 ? (
                <View className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden divide-y divide-[#F3F4F6]">
                  {suggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion.placeId}
                      onPress={() => void handleSelectSuggestion(suggestion)}
                      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-[#F9FAFB]"
                    >
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4F6]">
                        <Ionicons name="location-outline" size={18} color="#4B5563" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[14px] font-semibold text-[#111111]" numberOfLines={1}>
                          {suggestion.mainText}
                        </Text>
                        {suggestion.secondaryText ? (
                          <Text className="text-[12px] text-[#6B7280] mt-0.5" numberOfLines={1}>
                            {suggestion.secondaryText}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </Pressable>
                  ))}
                </View>
              ) : isFetching ? (
                <View className="py-8 items-center justify-center">
                  <ActivityIndicator color="#F5C400" size="small" />
                  <Text className="mt-2 text-[13px] text-[#6B7280]">Searching locations...</Text>
                </View>
              ) : (
                <View className="py-8 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]">
                  <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                  <Text className="mt-2 text-[14px] font-medium text-[#6B7280]">No results found</Text>
                </View>
              )
            ) : searchHistory.length > 0 ? (
              <View className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden divide-y divide-[#F3F4F6]">
                {searchHistory.map((spot) => (
                  <Pressable
                    key={spot.id}
                    onPress={() => handleSelectHistory(spot)}
                    className="flex-row items-center gap-3 px-4 py-3.5 active:bg-[#F9FAFB]"
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4F6]">
                      <Ionicons name="time-outline" size={18} color="#4B5563" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[14px] font-semibold text-[#111111]" numberOfLines={1}>
                        {spot.name}
                      </Text>
                      {spot.address && spot.address !== spot.name ? (
                        <Text className="text-[12px] text-[#6B7280] mt-0.5" numberOfLines={1}>
                          {spot.address}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]">
                <Ionicons name="time-outline" size={32} color="#D1D5DB" />
                <Text className="mt-2 text-[14px] font-medium text-[#6B7280]">No recent searches</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

