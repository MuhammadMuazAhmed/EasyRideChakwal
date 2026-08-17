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
import { useTheme } from '@/shared/theme';
import type { Location } from '@/shared/types';
import type { RiderStackParamList } from '@/navigation/types';
import { GoogleMapsService, AutocompleteSuggestion } from '@/api/services/googleMapsService';
import { SearchHistoryService } from '@/api/services/searchHistoryService';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'LocationSearch'>;

export function LocationSearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { location } = useCurrentLocation();
  const { theme } = useTheme();
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
    <ScreenContainer>
      {/* Header with Logo, Title, and Subtitle */}
      <TopBar
        variant="light"
        showLogo
        title="Easy Ride Chakwal"
        subtitle="Set Destination"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
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
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className="mb-4 flex-row items-center gap-3 rounded-2xl border p-3.5 shadow-sm"
          >
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#E6F4EA]">
              <View className="h-3.5 w-3.5 rounded-full bg-[#10B981] border-2 border-white" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-[#10B981] mb-0.5">
                Current Pickup Location
              </Text>
              <Text style={{ color: theme.textPrimary }} className="text-[14px] font-bold" numberOfLines={1}>
                {pickup?.name ?? 'Locating current location...'}
              </Text>
              {pickup?.address && pickup.address !== pickup.name ? (
                <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5" numberOfLines={1}>
                  {pickup.address}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Destination Search Field ("Kahan jaana hai?") */}
          <View
            style={{
              backgroundColor: theme.inputBg,
              borderColor: isFocused ? '#F5C400' : theme.inputBorder,
            }}
            className="mb-6 flex-row items-center gap-3 rounded-2xl border-[1.5px] px-3.5 h-[54px] shadow-sm"
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={isFocused ? '#F5C400' : theme.placeholderText}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Kahan jaana hai?"
              placeholderTextColor={theme.placeholderText}
              style={{ color: theme.inputText }}
              className="flex-1 text-[16px] font-medium p-0"
              autoFocus
              selectionColor="#F5C400"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={theme.placeholderText} />
              </Pressable>
            )}
          </View>

          {/* Quick Actions Section */}
          <View className="mb-6">
            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase tracking-wider mb-2.5">
              Quick Actions
            </Text>
            <View style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }} className="rounded-2xl border overflow-hidden">
              {/* Pin location on map */}
              <Pressable
                onPress={() => navigation.navigate('DestinationSelection')}
                style={{ borderBottomWidth: 1, borderBottomColor: theme.divider }}
                className="flex-row items-center justify-between px-4 py-3.5 active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <View style={{ backgroundColor: theme.accentLight }} className="h-9 w-9 items-center justify-center rounded-xl">
                    <Ionicons name="map-outline" size={20} color="#F5C400" />
                  </View>
                  <Text style={{ color: theme.textPrimary }} className="text-[14px] font-semibold">
                    Pin location on map
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </Pressable>

              {/* Saved Places */}
              <Pressable
                onPress={() => navigation.navigate('SavedPlaces')}
                className="flex-row items-center justify-between px-4 py-3.5 active:opacity-80"
              >
                <View className="flex-row items-center gap-3">
                  <View style={{ backgroundColor: theme.accentLight }} className="h-9 w-9 items-center justify-center rounded-xl">
                    <Ionicons name="bookmark-outline" size={20} color="#F5C400" />
                  </View>
                  <Text style={{ color: theme.textPrimary }} className="text-[14px] font-semibold">
                    Saved Places
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Search Results or Recent Searches Section */}
          <View>
            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase tracking-wider mb-2.5">
              {debouncedQuery.length > 2 ? 'Search Results' : 'Recent Searches'}
            </Text>

            {debouncedQuery.length > 2 ? (
              suggestions.length > 0 ? (
                <View style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }} className="rounded-2xl border overflow-hidden">
                  {suggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion.placeId}
                      onPress={() => void handleSelectSuggestion(suggestion)}
                      style={{ borderBottomWidth: 1, borderBottomColor: theme.divider }}
                      className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-80"
                    >
                      <View style={{ backgroundColor: theme.surface }} className="h-9 w-9 items-center justify-center rounded-xl">
                        <Ionicons name="location-outline" size={18} color={theme.textSecondary} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: theme.textPrimary }} className="text-[14px] font-semibold" numberOfLines={1}>
                          {suggestion.mainText}
                        </Text>
                        {suggestion.secondaryText ? (
                          <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5" numberOfLines={1}>
                            {suggestion.secondaryText}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    </Pressable>
                  ))}
                </View>
              ) : isFetching ? (
                <View className="py-8 items-center justify-center">
                  <ActivityIndicator color="#F5C400" size="small" />
                  <Text style={{ color: theme.textSecondary }} className="mt-2 text-[13px]">Searching locations...</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="py-8 items-center justify-center rounded-2xl border">
                  <Ionicons name="search-outline" size={32} color={theme.textMuted} />
                  <Text style={{ color: theme.textSecondary }} className="mt-2 text-[14px] font-medium">No results found</Text>
                </View>
              )
            ) : searchHistory.length > 0 ? (
              <View style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }} className="rounded-2xl border overflow-hidden">
                {searchHistory.map((spot) => (
                  <Pressable
                    key={spot.id}
                    onPress={() => handleSelectHistory(spot)}
                    style={{ borderBottomWidth: 1, borderBottomColor: theme.divider }}
                    className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-80"
                  >
                    <View style={{ backgroundColor: theme.surface }} className="h-9 w-9 items-center justify-center rounded-xl">
                      <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: theme.textPrimary }} className="text-[14px] font-semibold" numberOfLines={1}>
                        {spot.name}
                      </Text>
                      {spot.address && spot.address !== spot.name ? (
                        <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5" numberOfLines={1}>
                          {spot.address}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="py-8 items-center justify-center rounded-2xl border">
                <Ionicons name="time-outline" size={32} color={theme.textMuted} />
                <Text style={{ color: theme.textSecondary }} className="mt-2 text-[14px] font-medium">No recent searches</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}


