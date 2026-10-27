import { locationsService } from "@/services/api/locationsService";
import type { Location } from "@/types";
import { mockStores } from "@/data/locations/mockStores";

const API_URL = import.meta.env.VITE_API_URL || '/api';

type LocalizedStoreText = string | {
  English?: string;
  Arabic?: string;
  en?: string;
  ar?: string;
};

interface StoreResource {
  id?: string;
  name?: LocalizedStoreText;
  English?: string;
  address?: LocalizedStoreText;
  city?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  services?: string[];
}

export const locationFetchers = {
  /**
   * Fetch all locations from Backend Resources API.
   * Falls back to mock data if the backend is unreachable.
   */
  async fetchLocations(language: string = 'en'): Promise<Location[]> {
    try {
      // Try Backend Resources API first
      const response = await fetch(
        `${API_URL}/v1/resources/localization/${language}/locations`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.ok) {
        const data = (await response.json()) as { resources?: { stores?: StoreResource[] } };
        const locationsResources = data.resources;
        
        // Transform Backend API response to Location[]
        if (locationsResources.stores && Array.isArray(locationsResources.stores)) {
          const getEnglish = (value?: LocalizedStoreText): string => {
            if (typeof value === 'string') return value;
            return value?.English ?? value?.en ?? '';
          };

          return locationsResources.stores.map((store) => ({
            id: store.id,
            name: getEnglish(store.name) || store.English || '',
            address: getEnglish(store.address),
            city: store.city,
            phone: store.phone,
            latitude: store.latitude,
            longitude: store.longitude,
            features: store.services || [],
          }));
        }
      }
    } catch (err) {
      console.warn('Backend Resources API unavailable, using fallback', err);
    }

    // Fallback: Try locationsService
    try {
      return await locationsService.getAll(language);
    } catch {
      console.warn('Falling back to mock store data due to API failure');
      return mockStores;
    }
  },

  /**
   * Fetch all cities with bilingual names.
   */
  async fetchCities() {
    try {
      return await locationsService.getCities();
    } catch (error) {
      console.warn('Failed to fetch cities', error);
      return [];
    }
  },

  /**
   * Find nearby locations based on coordinates.
   */
  async fetchNearby(lat: number, lng: number, radius?: number, language: string = 'en') {
    try {
      return await locationsService.getNearby(lat, lng, radius, language);
    } catch (error) {
      console.warn('Failed to fetch nearby locations', error);
      return [];
    }
  },
};
