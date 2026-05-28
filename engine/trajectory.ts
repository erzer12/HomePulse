import { CLINICAL_THRESHOLDS } from '../constants/thresholds';
import type { SymptomEntry } from '../types/triage';

export interface TrajectoryResult {
  worsening: boolean;
  dimensions_worsened: string[];
}

export function analyzeTrajectory(current: SymptomEntry, history: SymptomEntry[]): TrajectoryResult {
  if (history.length < 1) return { worsening: false, dimensions_worsened: [] };

  const previous = history[history.length - 1];
  const dimensions_worsened: string[] = [];

  if (
    current.temperature_celsius !== undefined &&
    previous.temperature_celsius !== undefined &&
    current.temperature_celsius >
      previous.temperature_celsius + CLINICAL_THRESHOLDS.trajectoryTemperatureRiseCelsius
  ) {
    dimensions_worsened.push('temperature');
  }

  if (
    current.spo2_percent !== undefined &&
    previous.spo2_percent !== undefined &&
    current.spo2_percent < previous.spo2_percent - CLINICAL_THRESHOLDS.trajectorySpo2DropPercent
  ) {
    dimensions_worsened.push('spo2');
  }

  const hydrationScore = { normal: 0, reduced: 1, poor: 2 } as const;
  if (hydrationScore[current.hydration_status] > hydrationScore[previous.hydration_status]) {
    dimensions_worsened.push('hydration');
  }

  const consciousnessScore = { alert: 0, drowsy: 1, confused: 2, unresponsive: 3 } as const;
  if (consciousnessScore[current.consciousness] > consciousnessScore[previous.consciousness]) {
    dimensions_worsened.push('consciousness');
  }

  return {
    worsening: dimensions_worsened.length >= CLINICAL_THRESHOLDS.trajectoryEscalationDimensions,
    dimensions_worsened,
  };
}
