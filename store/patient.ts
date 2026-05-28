import { create } from 'zustand';
import type { Patient } from '@/types/patient';

interface PatientState {
  profiles: Patient[];
  setProfiles: (profiles: Patient[]) => void;
  addProfile: (profile: Patient) => void;
}

// Patient records are persisted in SQLite (see db/schema.ts + db/queries/patients.ts).
// This zustand slice is an in-memory projection for UI state.
export const usePatientStore = create<PatientState>((set) => ({
  profiles: [],
  setProfiles: (profiles) => set({ profiles }),
  addProfile: (profile) => set((state) => ({ profiles: [...state.profiles, profile] })),
}));
