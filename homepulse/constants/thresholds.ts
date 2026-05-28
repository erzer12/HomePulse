export const CLINICAL_THRESHOLDS = {
  spo2RedFlagPercent: 94,
  infantFeverRedFlagCelsius: 37.5,
  highFeverCelsius: 39.5,
  childHighFeverDurationHours: 24,
  nonChildHighFeverDurationHours: 48,
  baseStateSevereFeverCelsius: 39.0,
  baseStateSevereFeverDurationHours: 24,
  baseStateModerateFeverCelsius: 38.5,
  trajectoryTemperatureRiseCelsius: 0.5,
  trajectorySpo2DropPercent: 2,
  trajectoryEscalationDimensions: 3,
} as const;
