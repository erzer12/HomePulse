import type { TriageInput } from '@/types/triage';

export function validateTriageInput(input: TriageInput): string[] {
  const errors: string[] = [];
  if (!input.patient.age_group) errors.push('Missing patient age group');
  if (!input.symptom.id) errors.push('Missing symptom entry id');
  if (input.symptom.duration_hours < 0) errors.push('Duration must be non-negative');
  return errors;
}
