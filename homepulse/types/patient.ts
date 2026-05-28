import type { AgeGroup } from './triage';

export interface Patient {
  id: string;
  name: string;
  age_group: AgeGroup;
  age_months?: number;
  chronic_conditions: string[];
}

export type ChronicCondition = string;
