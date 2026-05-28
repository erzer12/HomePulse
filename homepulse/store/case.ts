import { create } from 'zustand';
import type { CaseRecord } from '@/types/case';

interface CaseState {
  activeCase?: CaseRecord;
  setActiveCase: (record: CaseRecord | undefined) => void;
}

export const useCaseStore = create<CaseState>((set) => ({
  activeCase: undefined,
  setActiveCase: (record) => set({ activeCase: record }),
}));
