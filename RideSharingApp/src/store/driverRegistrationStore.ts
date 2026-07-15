import { create } from 'zustand';

export interface DriverRegistrationState {
  firstName: string;
  lastName: string;
  phone: string;
  selfieUri: string | null;
  cnicFrontUri: string | null;
  cnicBackUri: string | null;
  cnicNumber: string;
  licenseUri: string | null;
  licenseNumber: string;
  licenseExpiry: string; // DD/MM/YYYY
  vehicleType: 'car' | 'bike' | 'qingqi';
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  vehicleYear: number;
  vehicleRegUri: string | null;
  policeClearanceUri: string | null;
  driverId: string | null;

  setField: <K extends keyof Omit<DriverRegistrationState, 'setField' | 'clear'>>(
    key: K,
    value: DriverRegistrationState[K]
  ) => void;
  clear: () => void;
}

const initialState = {
  firstName: '',
  lastName: '',
  phone: '',
  selfieUri: null,
  cnicFrontUri: null,
  cnicBackUri: null,
  cnicNumber: '',
  licenseUri: null,
  licenseNumber: '',
  licenseExpiry: '',
  vehicleType: 'car' as const,
  vehicleModel: '',
  vehiclePlate: '',
  vehicleColor: '',
  vehicleYear: new Date().getFullYear(),
  vehicleRegUri: null,
  policeClearanceUri: null,
  driverId: null,
};

export const useDriverRegistrationStore = create<DriverRegistrationState>((set) => ({
  ...initialState,
  setField: (key, value) => set((state) => ({ ...state, [key]: value })),
  clear: () => set(initialState),
}));
