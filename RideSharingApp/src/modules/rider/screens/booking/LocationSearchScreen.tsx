import { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { LocationRow, PlaceListItem } from '@/shared/components/common/SearchBar';
import { useRideStore } from '@/rider/store/rideStore';
import type { Location } from '@/shared/types';
import type { RiderStackParamList } from '@/navigation/types';
import { useQuery } from '@tanstack/react-query';
import { GoogleMapsService, AutocompleteSuggestion } from '@/api/services/googleMapsService';
import { SearchHistoryService } from '@/api/services/searchHistoryService';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'LocationSearch'>;

export function LocationSearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const pickup = useRideStore((s) => s.pickup);
  const setDestination = useRideStore((s) => s.setDestination);
  
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search history
  const { data: searchHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => SearchHistoryService.getSearchHistory(),
  });

  // Fetch autocomplete suggestions
  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ['placesAutocomplete', debouncedQuery],
    queryFn: () => GoogleMapsService.fetchPlacesAutocomplete(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const handleSelectHistory = (location: Location) => {
    SearchHistoryService.saveSearch(location).then(() => {
      setDestination(location);
      navigation.navigate('VehicleSelection');
    });
  };

  const handleSelectSuggestion = async (suggestion: AutocompleteSuggestion) => {
    try {
      const coords = await GoogleMapsService.fetchPlaceDetails(suggestion.placeId);
      if (coords) {
        const location: Location = {
          id: suggestion.placeId,
          name: suggestion.mainText,
          address: suggestion.secondaryText || suggestion.mainText,
          coordinates: coords,
        };
        await SearchHistoryService.saveSearch(location);
        setDestination(location);
        navigation.navigate('VehicleSelection');
      }
    } catch (error) {
      console.error('Failed to select suggestion:', error);
    }
  };

  return (
    <ScreenContainer className="bg-white">
      <TopBar
        title="Set Destination"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-3 pt-3" keyboardShouldPersistTaps="handled">
        <LocationRow
          label={pickup?.name ?? 'Current Location'}
          dotColor="green"
          highlighted
        />
        <View className="mb-3 flex-row items-center gap-2 rounded-xl border-[1.5px] border-border bg-surface-muted px-3 py-2.5">
          <Text>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Kahan jaana hai?"
            placeholderTextColor="#888888"
            className="flex-1 text-sm text-text-primary"
            autoFocus
          />
        </View>

        <Text className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          {debouncedQuery.length > 2 ? 'Search Results' : 'Recent Searches'}
        </Text>
        
        {debouncedQuery.length > 2 ? (
          suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <PlaceListItem
                key={suggestion.placeId}
                name={suggestion.mainText}
                subtitle={suggestion.secondaryText}
                onPress={() => handleSelectSuggestion(suggestion)}
              />
            ))
          ) : isFetching ? (
            <Text className="py-4 text-center text-sm text-text-secondary">Searching...</Text>
          ) : (
            <Text className="py-4 text-center text-sm text-text-secondary">No results found</Text>
          )
        ) : searchHistory.length > 0 ? (
          searchHistory.map((spot) => (
            <PlaceListItem
              key={spot.id}
              name={spot.name}
              subtitle={spot.address}
              onPress={() => handleSelectHistory(spot)}
            />
          ))
        ) : (
          <Text className="py-4 text-center text-sm text-text-secondary">No recent searches</Text>
        )}

        <Pressable
          onPress={() => navigation.navigate('PickupSelection')}
          className="mt-2.5 flex-row items-center gap-2 rounded-lg bg-surface-muted p-2.5"
        >
          <Text>⭐</Text>
          <Text className="text-sm font-semibold text-text-primary">Pin location on map</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('SavedPlaces')}
          className="mt-2 flex-row items-center gap-2 rounded-lg bg-accent-light p-2.5"
        >
          <Text>📍</Text>
          <Text className="text-sm font-semibold text-[#7A5800]">Saved Places</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
