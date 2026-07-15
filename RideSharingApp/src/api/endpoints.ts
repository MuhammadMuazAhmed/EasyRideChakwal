export const API_ENDPOINTS = {
  auth: {
    login: '/auth/send-otp',
    verifyOtp: '/auth/verify-otp',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    switchRole: '/auth/switch-role',
  },
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    emergencyContacts: '/user/emergency-contacts',
    savedPlaces: '/user/saved-places',
    referral: '/user/referral',
  },
  rides: {
    request: '/rides/request',
    current: '/rides/current',
    cancel: (id: string) => `/rides/${id}/cancel`,
    history: '/rides/history',
    details: (id: string) => `/rides/${id}`,
    rate: (id: string) => `/rides/${id}/rate`,
    receipt: (id: string) => `/rides/${id}/receipt`,
  },
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
  drivers: {
    register: '/drivers',
    profile: (id: string) => `/drivers/${id}`,
    status: (id: string) => `/drivers/${id}/status`,
    location: (id: string) => `/drivers/${id}/location`,
  },
  driverRides: {
    incoming: '/rides/incoming',
    accept: (id: string) => `/rides/${id}/accept`,
    start: (id: string) => `/rides/${id}/start`,
    complete: (id: string) => `/rides/${id}/complete`,
  },
} as const;
