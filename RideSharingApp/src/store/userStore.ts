import { create } from 'zustand';

import type { EmergencyContact, SavedPlace, User } from '@/shared/types';
import { mockUser } from '@/shared/constants/mockData';

interface UserStore {
  profile: User | null;
  emergencyContacts: EmergencyContact[];
  savedPlaces: SavedPlace[];
  setProfile: (profile: User) => void;
  updateProfile: (updates: Partial<User>) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  setSavedPlaces: (places: SavedPlace[]) => void;
  hydrateMockProfile: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  emergencyContacts: [],
  savedPlaces: [],
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
  setEmergencyContacts: (contacts) => set({ emergencyContacts: contacts }),
  setSavedPlaces: (places) => set({ savedPlaces: places }),
  hydrateMockProfile: () => set({ profile: mockUser }),
}));
