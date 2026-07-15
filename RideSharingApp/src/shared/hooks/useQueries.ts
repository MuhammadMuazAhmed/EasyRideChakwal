import { useQuery } from '@tanstack/react-query';

import { RideService } from '@/api/services/rideService';
import { UserService } from '@/api/services/userService';
import { NotificationService } from '@/api/services/notificationService';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import {
  mockEmergencyContacts,
  mockNotifications,
  mockRideHistory,
  mockSavedPlaces,
  mockUser,
} from '@/shared/constants/mockData';
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';

export function useProfile() {
  const setProfile = useUserStore((s) => s.setProfile);

  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      try {
        return await UserService.getProfile();
      } catch {
        setProfile(mockUser);
        return mockUser;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRideHistory(page = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.rideHistory(page),
    queryFn: async () => {
      try {
        return await RideService.getRideHistory(page);
      } catch {
        return {
          data: mockRideHistory,
          total: mockRideHistory.length,
          page,
          limit: 20,
        };
      }
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCurrentRide() {
  return useQuery({
    queryKey: QUERY_KEYS.currentRide,
    queryFn: async () => {
      try {
        return await RideService.getCurrentRide();
      } catch {
        return null;
      }
    },
    refetchInterval: 10000,
  });
}

export function useNotifications() {
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      try {
        const data = await NotificationService.getNotifications();
        setNotifications(data);
        return data;
      } catch {
        setNotifications(mockNotifications);
        return mockNotifications;
      }
    },
    staleTime: 60 * 1000,
  });
}

export function useEmergencyContacts() {
  return useQuery({
    queryKey: QUERY_KEYS.emergencyContacts,
    queryFn: async () => {
      try {
        return await UserService.getEmergencyContacts();
      } catch {
        return mockEmergencyContacts;
      }
    },
  });
}

export function useSavedPlaces() {
  return useQuery({
    queryKey: QUERY_KEYS.savedPlaces,
    queryFn: async () => {
      try {
        return await UserService.getSavedPlaces();
      } catch {
        return mockSavedPlaces;
      }
    },
  });
}

export function useReferral() {
  return useQuery({
    queryKey: QUERY_KEYS.referral,
    queryFn: async () => {
      try {
        return await UserService.getReferralInfo();
      } catch {
        return { code: mockUser.referralCode, credits: 50, referrals: 3 };
      }
    },
  });
}
