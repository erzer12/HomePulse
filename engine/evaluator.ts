import { CLINICAL_THRESHOLDS } from "../constants/thresholds";
import type { ActionState, TriageInput, TriageOutput } from "../types/triage";
import { applyHouseholdModifiers } from "./household";
import { checkRedFlags } from "./red-flags";
import { analyzeTrajectory } from "./trajectory";

const RULE_VERSION = "1.0.0";

export function evaluateTriage(input: TriageInput): TriageOutput {
	const evaluatedAt = input.symptom.timestamp;

	const redFlagResult = checkRedFlags(input);
	if (redFlagResult.triggered) {
		return {
			action_state: buildState(4),
			rule_version: RULE_VERSION,
			evaluated_at: evaluatedAt,
			red_flag_triggered: true,
			red_flag_reason: redFlagResult.reason,
			household_modifiers_applied: [],
		};
	}

	const trajectory = analyzeTrajectory(input.symptom, input.symptom_history);
	if (trajectory.worsening) {
		return {
			action_state: buildState(4),
			rule_version: RULE_VERSION,
			evaluated_at: evaluatedAt,
			red_flag_triggered: true,
			red_flag_reason: `Worsening pattern: ${trajectory.dimensions_worsened.join(", ")}`,
			household_modifiers_applied: [],
		};
	}

	const baseState = evaluateBaseState(input);
	const { state: modifiedState, modifiers } = applyHouseholdModifiers(
		baseState,
		input,
	);

	return {
		action_state: buildState(modifiedState),
		rule_version: RULE_VERSION,
		evaluated_at: evaluatedAt,
		red_flag_triggered: false,
		household_modifiers_applied: modifiers,
	};
}

function evaluateBaseState(input: TriageInput): 1 | 2 | 3 | 4 {
	const { symptom } = input;
	const temp = symptom.temperature_celsius ?? 0;
	const hours = symptom.duration_hours;

	if (symptom.consciousness !== "alert") return 3;
	if (
		temp > CLINICAL_THRESHOLDS.baseStateSevereFeverCelsius &&
		hours > CLINICAL_THRESHOLDS.baseStateSevereFeverDurationHours
	)
		return 3;
	if (
		temp > CLINICAL_THRESHOLDS.baseStateModerateFeverCelsius ||
		symptom.hydration_status === "poor"
	)
		return 2;
	if (symptom.hydration_status === "reduced") return 2;
	return 1;
}

function buildState(level: 1 | 2 | 3 | 4): ActionState {
	const states: Record<1 | 2 | 3 | 4, ActionState> = {
		1: {
			level: 1,
			label: "Monitor at Home",
			explanation:
				"Symptoms are mild and not worsening. Your household is capable of safe observation.",
			triggers: [],
			redFlags: [
				"Fever rises above 39°C",
				"Breathing becomes difficult",
				"Person becomes confused",
			],
			recheckIntervalMinutes: 360,
		},
		2: {
			level: 2,
			label: "Guided Home Care",
			explanation:
				"Symptoms require active management. Follow the care instructions below.",
			triggers: [],
			redFlags: [
				"Temperature exceeds 39.5°C",
				"Unable to keep fluids down",
				"Breathing worsens",
			],
			recheckIntervalMinutes: 120,
		},
		3: {
			level: 3,
			label: "Arrange Teleconsultation",
			explanation:
				"Symptoms need a clinical assessment. Arrange a teleconsult or clinic visit within a few hours.",
			triggers: [],
			redFlags: [
				"Any breathing difficulty",
				"Confusion or unresponsiveness",
				"Severe worsening",
			],
			recheckIntervalMinutes: 240,
		},
		4: {
			level: 4,
			label: "Seek Urgent Care Now",
			explanation:
				"This situation requires immediate in-person medical attention. Go to the nearest clinic or hospital now.",
			triggers: [],
			redFlags: [],
			recheckIntervalMinutes: 0,
		},
	};

	return states[level];
}
