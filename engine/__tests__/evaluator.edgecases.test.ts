import type { TriageInput } from "../../types/triage";
import { evaluate } from "../index";

jest.mock("../rulesLoader", () => {
	const cfg = {
		verified: true,
		config: {
			version: "test",
			signature: "unsigned",
			rules: [
				{
					id: "or-chronic-or-temp",
					conditions: {
						or: [
							{ temperature_gt: 38 },
							{ chronic_conditions_any: ["asthma"] },
						],
					},
					output_state: 2,
					explanation_key: "or_test",
				},
				{
					id: "not-fever",
					conditions: { not: { category: "fever" } },
					output_state: 1,
					explanation_key: "not_fever",
				},
				{
					id: "spo2-low",
					conditions: { spo2_percent_lt: 95 },
					output_state: 4,
					explanation_key: "spo2_low",
				},
				{
					id: "dot-path-temp",
					conditions: { "symptom.temperature_celsius_gt": 37.5 },
					output_state: 2,
					explanation_key: "dot_temp",
				},
			],
			red_flags: [],
			household_modifiers: [],
		},
	};
	return {
		loadBundledRuleConfig: async () => cfg,
		getCachedRuleConfig: () => cfg,
	};
});

function baseInput(overrides: Partial<TriageInput> = {}) {
	return {
		patient: {
			age_group: "adult",
			chronic_conditions: [],
			...(overrides.patient || {}),
		},
		symptom: {
			id: "s1",
			timestamp: Date.now(),
			category: "fever",
			duration_hours: 1,
			hydration_status: "normal",
			consciousness: "alert",
			breathing_difficulty: false,
			...overrides.symptom,
		},
		symptom_history: overrides.symptom_history || [],
		household: overrides.household || {
			has_thermometer: false,
			has_oximeter: false,
			transport_available: true,
			pharmacy_distance_km: 0,
			overnight_caregiver: true,
			medicine_stock: true,
		},
	} as TriageInput;
}

test("OR condition matches on chronic condition", () => {
	const input = baseInput({
		patient: { age_group: "adult", chronic_conditions: ["asthma"] },
	});
	const out = evaluate(input);
	expect(out.action_state.level).toBe(2);
});

test("OR condition matches on temperature comparator", () => {
	const input = baseInput({ symptom: { temperature_celsius: 39 } });
	const out = evaluate(input);
	expect(out.action_state.level).toBe(2);
});

test("not operator excludes fever category", () => {
	const input = baseInput({ symptom: { category: "respiratory" } });
	const out = evaluate(input);
	// 'not-fever' returns level 1
	expect(out.action_state.level).toBe(1);
});

test("spo2 comparator triggers high urgency", () => {
	const input = baseInput({ symptom: { spo2_percent: 92 } });
	const out = evaluate(input);
	expect(out.action_state.level).toBe(4);
});

test("dot-path field resolution works", () => {
	const input = baseInput({ symptom: { temperature_celsius: 38 } });
	const out = evaluate(input);
	// dot-path rule should match and set level 2
	expect(out.action_state.level).toBe(2);
});
