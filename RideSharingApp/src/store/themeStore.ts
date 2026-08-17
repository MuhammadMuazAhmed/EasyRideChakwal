import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'default';
export type ActiveTheme = 'light' | 'dark';

interface ThemeStore {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      preference: 'dark', // App initial preference is DARK per requirement #2
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useActiveTheme(): ActiveTheme {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();

  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemScheme === 'light' ? 'light' : 'dark';
}
