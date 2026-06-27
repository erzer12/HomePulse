import type { TriageInput } from "../../types/triage";
import { checkRedFlags } from "../red-flags";

const baseInput: TriageInput = {
	patient: { age_group: "adult", chronic_conditions: [] },
	symptom: {
		id: "s1",
		case_id: "c1",
		timestamp: 1700000000000,
		category: "respiratory",
		duration_hours: 2,
		hydration_status: "normal",
		consciousness: "alert",
		breathing_difficulty: false,
	},
	symptom_history: [],
	household: {
		has_thermometer: true,
		has_oximeter: true,
		transport_available: true,
		pharmacy_distance_km: 1,
		overnight_caregiver: true,
		medicine_stock: true,
	},
};

describe("checkRedFlags", () => {
	it("triggers for low SpO2", () => {
		const result = checkRedFlags({
			...baseInput,
			symptom: { ...baseInput.symptom, spo2_percent: 90 },
		});

		expect(result.triggered).toBe(true);
	});

	it("does not trigger for stable mild symptoms", () => {
		const result = checkRedFlags({
			...baseInput,
			symptom: { ...baseInput.symptom, temperature_celsius: 37.1 },
		});

		expect(result.triggered).toBe(false);
	});
});
