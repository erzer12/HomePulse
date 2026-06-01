import { CLINICAL_THRESHOLDS } from "../constants/thresholds";
import type { TriageInput } from "../types/triage";
import { getCachedRuleConfig } from "./rulesLoader";

export interface RedFlagResult {
	triggered: boolean;
	reason?: string;
}

export function checkRedFlags(input: TriageInput): RedFlagResult {
	const { patient, symptom } = input;
	// Prefer rule-config red flags when available and verified
	const cached = getCachedRuleConfig();
	if (
		cached?.verified &&
		cached.config &&
		Array.isArray(cached.config.red_flags)
	) {
		for (const rf of cached.config.red_flags) {
			const c = rf.condition as Record<string, unknown>;
			// simple checks
			if (
				c.spo2_max !== undefined &&
				input.symptom.spo2_percent !== undefined
			) {
				if (Number(input.symptom.spo2_percent) < Number(c.spo2_max)) {
					return { triggered: true, reason: rf.reason_key || rf.id };
				}
			}
			if (
				c.spo2_percent_lt !== undefined &&
				input.symptom.spo2_percent !== undefined
			) {
				if (Number(input.symptom.spo2_percent) < Number(c.spo2_percent_lt)) {
					return { triggered: true, reason: rf.reason_key || rf.id };
				}
			}
			if (
				c.temperature_min !== undefined &&
				input.symptom.temperature_celsius !== undefined
			) {
				if (
					Number(input.symptom.temperature_celsius) > Number(c.temperature_min)
				) {
					return { triggered: true, reason: rf.reason_key || rf.id };
				}
			}
			if (
				c.infant_fever &&
				input.patient.age_group === "infant" &&
				input.patient.age_months !== undefined &&
				input.patient.age_months < 3 &&
				input.symptom.temperature_celsius !== undefined &&
				input.symptom.temperature_celsius > 37.5
			) {
				return { triggered: true, reason: rf.reason_key || rf.id };
			}
			if (
				c.altered_consciousness &&
				["confused", "unresponsive"].includes(input.symptom.consciousness)
			) {
				return { triggered: true, reason: rf.reason_key || rf.id };
			}
			if (c.breathing_difficulty && input.symptom.breathing_difficulty) {
				return { triggered: true, reason: rf.reason_key || rf.id };
			}
			if (
				c.hydration_status === "poor" &&
				input.symptom.hydration_status === "poor" &&
				input.symptom.duration_hours > (Number(c.duration_hours) || 8)
			) {
				return { triggered: true, reason: rf.reason_key || rf.id };
			}
		}
	}

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
