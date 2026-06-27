import type { TriageInput, TriageOutput } from "../types/triage";
import { buildActionState, evaluateTriage } from "./evaluator";
import { loadBundledRuleConfig } from "./rulesLoader";

// Ensure rule config is loaded/verified once at startup (async). Evaluations are synchronous
// and use the cached config loaded by `rulesLoader`.
loadBundledRuleConfig().catch(() => {
	/* ignore load errors here; evaluator will fallback */
});

export { buildActionState };

export function evaluate(input: TriageInput): TriageOutput {
	// evaluator is deterministic and pure; it may use cached rules via rulesLoader
	try {
		return evaluateTriage(input);
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		// eslint-disable-next-line no-console
		console.error("Engine evaluate() top-level error:", msg);
		// Return conservative fallback
		return {
			action_state: {
				level: 3,
				label: "Arrange Teleconsultation",
				explanation: "An internal error occurred; please seek clinical advice.",
				triggers: [],
				redFlags: [],
				recheckIntervalMinutes: 240,
			},
			rule_version: "unknown",
			evaluated_at: Date.now(),
			red_flag_triggered: false,
			household_modifiers_applied: [],
			error: `Engine top-level error: ${msg}`,
		};
	}
}
