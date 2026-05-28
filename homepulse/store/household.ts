import { create } from 'zustand';
import type { HouseholdReadiness } from '@/types/household';

interface HouseholdState {
  readiness: HouseholdReadiness;
  setReadiness: (readiness: HouseholdReadiness) => void;
}

const defaultReadiness: HouseholdReadiness = {
  has_thermometer: false,
  has_oximeter: false,
  transport_available: true,
  pharmacy_distance_km: 0,
  overnight_caregiver: true,
  medicine_stock: false,
};

export const useHouseholdStore = create<HouseholdState>((set) => ({
  readiness: defaultReadiness,
  setReadiness: (readiness) => set({ readiness }),
}));
