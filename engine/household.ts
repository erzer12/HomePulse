import type { TriageInput } from "../types/triage";
import { getCachedRuleConfig } from "./rulesLoader";

export function applyHouseholdModifiers(
	state: number,
	input: TriageInput,
): { state: 1 | 2 | 3 | 4; modifiers: string[] } {
	const modifiers: string[] = [];
	let adjusted = state;

	const h = input.household;
	const { age_group } = input.patient;

	// Apply rule-config household modifiers when available
	const cached = getCachedRuleConfig();
	if (
		cached?.verified &&
		cached.config &&
		Array.isArray(cached.config.household_modifiers)
	) {
		for (const mod of cached.config.household_modifiers) {
			const cond = mod.condition as Record<string, unknown>;
			let matches = true;
			if (
				(cond as Record<string, unknown>).transport_available === false &&
				h.transport_available === true
			)
				matches = false;
			if (
				cond.applicable_age_groups &&
				Array.isArray(cond.applicable_age_groups)
			) {
				if (!(cond.applicable_age_groups as unknown[]).includes(age_group))
					matches = false;
			}
			if (matches) {
				adjusted = Math.min(
					4,
					Math.max(
						1,
						adjusted + (mod.state_adjustment || 0),
					),
				);
				modifiers.push(mod.reason_key || mod.id);
			}
		}
	}

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
