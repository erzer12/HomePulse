import type { TriageInput, TriageOutput } from '../types/triage';
import { evaluateTriage } from './evaluator';

export function evaluate(input: TriageInput): TriageOutput {
  return evaluateTriage(input);
}
