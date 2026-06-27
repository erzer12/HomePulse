import { analyzeTrajectory } from "../trajectory";

describe("analyzeTrajectory", () => {
	it("escalates when 3 dimensions worsen", () => {
		const previous = {
			id: "prev",
			case_id: "c1",
			timestamp: 1,
			category: "fever" as const,
			duration_hours: 4,
			temperature_celsius: 38.0,
			spo2_percent: 98,
			hydration_status: "normal" as const,
			consciousness: "alert" as const,
			breathing_difficulty: false,
		};

		const current = {
			...previous,
			id: "current",
			timestamp: 2,
			temperature_celsius: 39.0,
			spo2_percent: 95,
			hydration_status: "poor" as const,
			consciousness: "drowsy" as const,
		};

		const result = analyzeTrajectory(current, [previous]);
		expect(result.worsening).toBe(true);
		expect(result.dimensions_worsened.length).toBeGreaterThanOrEqual(3);
	});
});
