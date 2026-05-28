import type { ActionState, SymptomEntry } from './triage';

export interface CaseRecord {
  id: string;
  patient_id: string;
  status: 'active' | 'closed';
  timeline: SymptomEntry[];
  current_action_state?: ActionState;
}
