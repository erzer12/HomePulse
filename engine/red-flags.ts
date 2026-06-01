import { CLINICAL_THRESHOLDS } from "../constants/thresholds";
import type { TriageInput } from "../types/triage";

export interface RedFlagResult {
	triggered: boolean;
	reason?: string;
}

export function checkRedFlags(input: TriageInput): RedFlagResult {
	const { patient, symptom } = input;

	if (
		symptom.spo2_percent !== undefined &&
		symptom.spo2_percent < CLINICAL_THRESHOLDS.spo2RedFlagPercent
	) {
		return {
			triggered: true,
			reason: `SpO2 below ${CLINICAL_THRESHOLDS.spo2RedFlagPercent}% — oxygen saturation critical`,
		};
	}

	if (
		patient.age_group === "infant" &&
		patient.age_months !== undefined &&
		patient.age_months < 3 &&
		symptom.temperature_celsius !== undefined &&
		symptom.temperature_celsius > CLINICAL_THRESHOLDS.infantFeverRedFlagCelsius
	) {
		return {
			triggered: true,
			reason: "Any fever in infant under 3 months requires immediate care",
		};
	}

	if (symptom.temperature_celsius !== undefined) {
		const isChild = patient.age_group === "child";
		const durationThreshold = isChild
			? CLINICAL_THRESHOLDS.childHighFeverDurationHours
			: CLINICAL_THRESHOLDS.nonChildHighFeverDurationHours;
		if (
			symptom.temperature_celsius > CLINICAL_THRESHOLDS.highFeverCelsius &&
			symptom.duration_hours > durationThreshold
		) {
			return {
				triggered: true,
				reason: `High fever persisting over ${durationThreshold} hours`,
			};
		}
	}

	if (["confused", "unresponsive"].includes(symptom.consciousness)) {
		return {
			triggered: true,
			reason: "Altered consciousness detected — seek immediate care",
		};
	}

	if (symptom.breathing_difficulty) {
		return {
			triggered: true,
			reason: "Breathing difficulty — cannot safely monitor at home",
		};
	}

	return { triggered: false };
}
