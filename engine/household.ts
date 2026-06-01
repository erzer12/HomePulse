import type { TriageInput } from "../types/triage";

export function applyHouseholdModifiers(
	state: number,
	input: TriageInput,
): { state: 1 | 2 | 3 | 4; modifiers: string[] } {
	const modifiers: string[] = [];
	let adjusted = state;

	const h = input.household;
	const { age_group } = input.patient;

	if (!h.transport_available && adjusted === 2) {
		modifiers.push("Transport unavailable — teleconsult recommended over wait");
	}

	if (
		!h.overnight_caregiver &&
		(age_group === "elderly" || age_group === "infant")
	) {
		adjusted = Math.min(adjusted + 1, 4);
		modifiers.push("No overnight caregiver — elevated monitoring required");
	}

	if (!h.has_thermometer) {
		modifiers.push(
			"No thermometer — cannot verify fever trend; conservative guidance applied",
		);
	}

	return {
		state: Math.max(1, Math.min(4, adjusted)) as 1 | 2 | 3 | 4,
		modifiers,
	};
}
