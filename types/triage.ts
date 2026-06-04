export type AgeGroup = "infant" | "child" | "adult" | "elderly";

export type SymptomCategory =
	| "fever"
	| "respiratory"
	| "gastrointestinal"
	| "neurological"
	| "pain"
	| "dehydration"
	| "weakness";

export type ActionStateLevel = 1 | 2 | 3 | 4;

export interface ActionState {
	level: ActionStateLevel;
	label: string;
	explanation: string;
	triggers: string[];
	redFlags: string[];
	recheckIntervalMinutes: number;
}

export interface SymptomEntry {
	id: string;
	case_id: string;
	timestamp: number;
	category: SymptomCategory;
	duration_hours: number;
	temperature_celsius?: number;
	spo2_percent?: number;
	hydration_status: "normal" | "reduced" | "poor";
	consciousness: "alert" | "drowsy" | "confused" | "unresponsive";
	breathing_difficulty: boolean;
	notes?: string;
	triage_output?: string; // JSON string of TriageOutput
}

export interface HouseholdReadiness {
	has_thermometer: boolean;
	has_oximeter: boolean;
	transport_available: boolean;
	pharmacy_distance_km: number;
	overnight_caregiver: boolean;
	medicine_stock: boolean;
}

export interface TriageInput {
	patient: {
		age_group: AgeGroup;
		age_months?: number;
		chronic_conditions: string[];
	};
	symptom: SymptomEntry;
	symptom_history: SymptomEntry[];
	household: HouseholdReadiness;
}

export interface TriageOutput {
	action_state: ActionState;
	rule_version: string;
	evaluated_at: number;
	red_flag_triggered: boolean;
	red_flag_reason?: string;
	household_modifiers_applied: string[];
	care_instructions?: string[];
	red_flags?: string[];
	reasoning?: string;
	// In case of engine/internal errors include a safe, engineering-facing message.
	error?: string;
}

export interface RuleConfig {
	version: string;
	signature: string;
	rules: TriageRule[];
	red_flags: RedFlagRule[];
	household_modifiers: HouseholdModifier[];
}

export interface TriageRule {
	id: string;
	conditions: Record<string, unknown>;
	output_state: ActionStateLevel;
	explanation_key: string;
}

export interface RedFlagRule {
	id: string;
	condition: Record<string, unknown>;
	reason_key: string;
}

export interface HouseholdModifier {
	id: string;
	condition: Record<string, unknown>;
	state_adjustment: number;
	reason_key: string;
}
