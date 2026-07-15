import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Location } from '@/shared/types';

const SEARCH_HISTORY_KEY = '@easyride_search_history';
const MAX_HISTORY_ITEMS = 15;

export const SearchHistoryService = {
  async getSearchHistory(): Promise<Location[]> {
    try {
      const json = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (!json) return [];
      return JSON.parse(json) as Location[];
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  },

  async saveSearch(location: Location): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      
      // Remove if it already exists (by ID or name) to avoid duplicates
      const filtered = history.filter(
        (item) => item.id !== location.id && item.name !== location.name
      );
      
      // Prepend to top
      filtered.unshift(location);
      
      // Keep only latest items
      const newHistory = filtered.slice(0, MAX_HISTORY_ITEMS);
      
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }
};
