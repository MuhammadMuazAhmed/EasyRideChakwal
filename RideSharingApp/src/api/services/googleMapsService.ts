import axios from 'axios';
import * as Location from 'expo-location';
import { env } from '@/config/env';
import type { Coordinates } from '@/shared/types';

const googleMapsClient = axios.create();

// Diagnostic: log key presence on module load (never log the full key in prod)
const apiKey = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  console.error('[GoogleMapsService] CRITICAL: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is missing or empty!');
} else {
  console.log(`[GoogleMapsService] API key loaded. Prefix: ${apiKey.slice(0, 8)}... Length: ${apiKey.length}`);
}

export interface AutocompleteSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface DirectionsResult {
  polyline: Coordinates[];
  distanceKm: number;
  durationMins: number;
}

export const GoogleMapsService = {
  async fetchPlacesAutocomplete(query: string): Promise<AutocompleteSuggestion[]> {
    if (!query || query.length < 2) return [];

    const requestBody = {
      input: query,
      includedRegionCodes: ['PK'],
    };
    const requestHeaders = {
      'X-Goog-Api-Key': apiKey,
      'Content-Type': 'application/json',
    };

    console.log('[GoogleMapsService] Autocomplete request:', {
      endpoint: 'https://places.googleapis.com/v1/places:autocomplete',
      body: requestBody,
      headers: { ...requestHeaders, 'X-Goog-Api-Key': `${apiKey.slice(0, 8)}...` },
    });

    try {
      const { data } = await googleMapsClient.post(
        'https://places.googleapis.com/v1/places:autocomplete',
        requestBody,
        { headers: requestHeaders }
      );

      console.log('[GoogleMapsService] Autocomplete raw response:', JSON.stringify(data).slice(0, 500));

      return (data.suggestions || []).map((s: any) => ({
        placeId: s.placePrediction.placeId,
        mainText: s.placePrediction.text.text,
        secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || '',
      }));
    } catch (error: any) {
      const status = error?.response?.status;
      const responseData = error?.response?.data;
      console.error('[GoogleMapsService] Autocomplete FAILED:', {
        httpStatus: status,
        googleErrorBody: responseData,
        message: error?.message,
      });
      throw error;
    }
  },


  async fetchPlaceDetails(placeId: string): Promise<Coordinates | null> {
    try {
      const { data } = await googleMapsClient.get(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            'X-Goog-Api-Key': env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'location',
          },
        }
      );

      const location = data.location;
      if (location) {
        return {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Google Maps Place Details Error:', error);
      throw error;
    }
  },

  async fetchDirections(origin: Coordinates, destination: Coordinates): Promise<DirectionsResult | null> {
    try {
      const { data } = await googleMapsClient.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destination.latitude,
                longitude: destination.longitude,
              },
            },
          },
          travelMode: 'DRIVE',
        },
        {
          headers: {
            'X-Goog-Api-Key': env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
            'Content-Type': 'application/json',
          },
        }
      );

      const route = data.routes?.[0];
      if (!route) return null;

      // distance in meters -> km
      const distanceKm = (route.distanceMeters || 0) / 1000;
      
      // duration in seconds (string ending in 's', e.g. "200s")
      const durationSeconds = parseInt((route.duration || '0').replace('s', ''), 10);
      const durationMins = Math.ceil(durationSeconds / 60);
      
      const polylineStr = route.polyline?.encodedPolyline;
      const polyline = polylineStr ? this.decodePolyline(polylineStr) : [];

      return {
        polyline,
        distanceKm,
        durationMins,
      };
    } catch (error) {
      console.error('Google Maps Directions Error:', error);
      throw error;
    }
  },

  // Standard Google Polyline decoding algorithm
  decodePolyline(encoded: string): Coordinates[] {
    const poly: Coordinates[] = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return poly;
  },

  /**
   * Reverse-geocode coordinates into a { name, address } pair.
   *
   * `name`    — short, human-readable label (road/sublocality/locality).
   *             Suitable for display in compact UI rows.
   * `address` — full formatted address string for storage and driver display.
   *
   * Tries Google Maps API first, falls back to native device Geocoder,
   * and finally falls back to `fallbackName` (default: 'Current Location').
   */
  async fetchAddressFromCoordinates(
    coords: Coordinates,
    fallbackName: string = 'Current Location',
  ): Promise<{ name: string; address: string }> {
    // 1. Try Google Maps Web API Geocoding
    try {
      const { data } = await googleMapsClient.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            latlng: `${coords.latitude},${coords.longitude}`,
            key: env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            language: 'en',
          },
        },
      );

      if (data.status === 'OK' && data.results?.length > 0) {
        const result = data.results[0];
        const fullAddress: string = result.formatted_address ?? fallbackName;

        const components: { long_name: string; types: string[] }[] =
          result.address_components ?? [];

        const pick = (...types: string[]): string | undefined => {
          for (const type of types) {
            const comp = components.find((c) => c.types.includes(type));
            if (comp?.long_name) return comp.long_name;
          }
          return undefined;
        };

        const shortName =
          pick('premise', 'point_of_interest') ??
          pick('route') ??
          pick('sublocality_level_1', 'sublocality') ??
          pick('locality') ??
          pick('administrative_area_level_2') ??
          fullAddress.split(',')[0].trim();

        if (shortName) {
          return { name: shortName, address: fullAddress };
        }
      } else {
        console.warn('[GoogleMapsService] Geocoding API returned status:', data.status);
      }
    } catch (error) {
      console.warn('[GoogleMapsService] Google Geocoding API Error:', error);
    }

    // 2. Try native device geocoder via Expo Location as fallback
    try {
      const nativeResults = await Location.reverseGeocodeAsync(coords);
      if (nativeResults && nativeResults.length > 0) {
        const item = nativeResults[0];
        const shortName =
          item.street ||
          item.name ||
          item.subregion ||
          item.district ||
          item.city ||
          fallbackName;

        const addressParts = [
          item.streetNumber,
          item.street || item.name,
          item.subregion || item.district || item.city,
          item.region || item.country,
        ].filter(Boolean);

        const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : shortName;

        return { name: shortName, address: fullAddress };
      }
    } catch (nativeErr) {
      console.warn('[GoogleMapsService] Native Geocoder Error:', nativeErr);
    }

    // 3. Fallback if both primary and secondary geocoders fail
    return { name: fallbackName, address: fallbackName };
  },
};
