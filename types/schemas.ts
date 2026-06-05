import { z } from "zod";

export const AgeGroup = z.enum(["infant", "child", "adult", "elderly"]);

export const SymptomCategory = z.enum([
	"fever",
	"respiratory",
	"gastrointestinal",
	"neurological",
	"pain",
	"dehydration",
	"weakness",
]);

export const HydrationStatus = z.enum(["normal", "reduced", "poor"]);
export const Consciousness = z.enum([
	"alert",
	"drowsy",
	"confused",
	"unresponsive",
]);

export const SymptomEntry = z.object({
	id: z.string().uuid().optional(),
	case_id: z.string(),
	timestamp: z.number().int(),
	category: SymptomCategory,
	duration_hours: z.number(),
	temperature_celsius: z.number().optional(),
	spo2_percent: z.number().optional(),
	hydration_status: HydrationStatus,
	consciousness: Consciousness,
	breathing_difficulty: z.boolean(),
	notes: z.string().optional(),
	triage_output: z.string().optional(),
});

export type SymptomEntryType = z.infer<typeof SymptomEntry>;

export const HouseholdReadiness = z.object({
	has_thermometer: z.boolean(),
	has_oximeter: z.boolean(),
	transport_available: z.boolean(),
	pharmacy_distance_km: z.number(),
	overnight_caregiver: z.boolean(),
	medicine_stock: z.boolean(),
});

export const TriageInput = z.object({
	patient: z.object({
		age_group: AgeGroup,
		age_months: z.number().optional(),
		chronic_conditions: z.array(z.string()),
	}),
	symptom: SymptomEntry,
	symptom_history: z.array(SymptomEntry),
	household: HouseholdReadiness,
});

export const ActionState = z.object({
	level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
	label: z.string(),
	explanation: z.string(),
	triggers: z.array(z.string()),
	redFlags: z.array(z.string()),
	recheckIntervalMinutes: z.number(),
});

export const TriageOutput = z.object({
	action_state: ActionState,
	rule_version: z.string(),
	evaluated_at: z.number().int(),
	red_flag_triggered: z.boolean(),
	red_flag_reason: z.string().optional(),
	household_modifiers_applied: z.array(z.string()),
});

export type TriageInputType = z.infer<typeof TriageInput>;
export type TriageOutputType = z.infer<typeof TriageOutput>;
