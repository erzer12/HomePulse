/**
 * WHO IMCI-grounded test cases for the HomePulse triage engine.
 * These 5 cases must all pass before any rule config update is shipped.
 */

import type { TriageInput } from "../../types/triage";
import { evaluate } from "../index";

const baseHousehold = {
	has_thermometer: true,
	has_oximeter: false,
	transport_available: true,
	pharmacy_distance_km: 3,
	overnight_caregiver: true,
	medicine_stock: true,
};

describe("Triage Engine — WHO IMCI Test Cases", () => {
	test("TC-01: Mild fever, short duration, capable household → State 1 Monitor", () => {
		const input: TriageInput = {
			patient: { age_group: "child", chronic_conditions: [] },
			symptom: {
				id: "tc01",
				case_id: "c1",
				timestamp: Date.now(),
				category: "fever",
				duration_hours: 4,
				temperature_celsius: 38.2,
				hydration_status: "normal",
				consciousness: "alert",
				breathing_difficulty: false,
			},
			symptom_history: [],
			household: baseHousehold,
		};
		const result = evaluate(input);
		expect(result.action_state.level).toBe(1);
		expect(result.red_flag_triggered).toBe(false);
	});

	test("TC-02: Moderate fever, reduced hydration, transport limited → State 2 Guided Home Care", () => {
		const input: TriageInput = {
			patient: { age_group: "child", chronic_conditions: [] },
			symptom: {
				id: "tc02",
				case_id: "c1",
				timestamp: Date.now(),
				category: "fever",
				duration_hours: 8,
				temperature_celsius: 38.8,
				hydration_status: "reduced",
				consciousness: "alert",
				breathing_difficulty: false,
			},
			symptom_history: [],
			household: { ...baseHousehold, transport_available: false },
		};
		const result = evaluate(input);
		expect(result.action_state.level).toBe(2);
	});

	test("TC-03: Any fever in infant < 3 months → State 4 (Red Flag)", () => {
		const input: TriageInput = {
			patient: { age_group: "infant", age_months: 2, chronic_conditions: [] },
			symptom: {
				id: "tc03",
				case_id: "c1",
				timestamp: Date.now(),
				category: "fever",
				duration_hours: 2,
				temperature_celsius: 38.0,
				hydration_status: "normal",
				consciousness: "alert",
				breathing_difficulty: false,
			},
			symptom_history: [],
			household: baseHousehold,
		};
		const result = evaluate(input);
		expect(result.action_state.level).toBe(4);
		expect(result.red_flag_triggered).toBe(true);
	});

	test("TC-04: SpO2 < 94% → State 4 immediate (Red Flag)", () => {
		const input: TriageInput = {
			patient: { age_group: "adult", chronic_conditions: ["asthma"] },
			symptom: {
				id: "tc04",
				case_id: "c1",
				timestamp: Date.now(),
				category: "respiratory",
				duration_hours: 3,
				spo2_percent: 91,
				hydration_status: "normal",
				consciousness: "alert",
				breathing_difficulty: true,
			},
			symptom_history: [],
			household: baseHousehold,
		};
		const result = evaluate(input);
		expect(result.action_state.level).toBe(4);
		expect(result.red_flag_triggered).toBe(true);
	});

	test("TC-05: Worsening across 3+ dimensions in recheck → State 4 auto-escalation", () => {
		const prev = {
			id: "tc05-prev",
			case_id: "c1",
			timestamp: Date.now() - 7200000,
			category: "fever" as const,
			duration_hours: 6,
			temperature_celsius: 38.5,
			hydration_status: "reduced" as const,
			consciousness: "drowsy" as const,
			breathing_difficulty: false,
		};
		const input: TriageInput = {
			patient: { age_group: "child", chronic_conditions: [] },
			symptom: {
				id: "tc05",
				case_id: "c1",
				timestamp: Date.now(),
				category: "fever",
				duration_hours: 8,
				temperature_celsius: 39.6,
				hydration_status: "poor",
				consciousness: "confused",
				breathing_difficulty: false,
			},
			symptom_history: [prev],
			household: baseHousehold,
		};
		const result = evaluate(input);
		expect(result.action_state.level).toBe(4);
	});
});
