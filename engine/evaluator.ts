import { CLINICAL_THRESHOLDS } from "../constants/thresholds";
import type {
	ActionState,
	RuleConfig,
	TriageInput,
	TriageOutput,
	TriageRule,
} from "../types/triage";
import { getExplanationTemplate } from "./explanations";
import { applyHouseholdModifiers } from "./household";
import { checkRedFlags } from "./red-flags";
import { getCachedRuleConfig } from "./rulesLoader";
import { analyzeTrajectory } from "./trajectory";

const RULE_VERSION = "1.0.0";

export function evaluateTriage(input: TriageInput): TriageOutput {
	try {
		const evaluatedAt = input.symptom.timestamp;

		// If we have a verified rule config, try to match rules first (simple matcher)
		const cached = getCachedRuleConfig();
		if (cached?.verified && cached.config) {
			const rc = cached.config as RuleConfig;
			const matched = matchRules(rc.rules, input);
			if (matched) {
				const state = buildActionState(matched.output_state as 1 | 2 | 3 | 4);
				const tpl = getExplanationTemplate(
					matched.output_state as 1 | 2 | 3 | 4,
					matched.explanation_key,
				);
				state.explanation = tpl.explanation;
				return {
					action_state: state,
					rule_version: rc.version,
					evaluated_at: evaluatedAt,
					red_flag_triggered: false,
					household_modifiers_applied: [],
				};
			}
		}

		const redFlagResult = checkRedFlags(input);
		if (redFlagResult.triggered) {
			return {
				action_state: buildActionState(4),
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
				action_state: buildActionState(4),
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
			action_state: buildActionState(modifiedState),
			rule_version: RULE_VERSION,
			evaluated_at: evaluatedAt,
			red_flag_triggered: false,
			household_modifiers_applied: modifiers,
		};
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		// Log for engineering/analytics
		// eslint-disable-next-line no-console
		console.error("Engine evaluateTriage error:", msg);
		// Conservative fallback per ARCHITECTURE.md: teleconsult (level 3)
		return {
			action_state: buildActionState(3),
			rule_version: RULE_VERSION,
			evaluated_at: Date.now(),
			red_flag_triggered: false,
			household_modifiers_applied: [],
			error: `Engine error: ${msg}`,
		};
	}
}

function evaluateBaseState(input: TriageInput): 1 | 2 | 3 | 4 {
	const symptom = input.symptom;
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

export function buildActionState(level: 1 | 2 | 3 | 4): ActionState {
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

function matchRules(
	rules: TriageRule[] | undefined,
	input: TriageInput,
): TriageRule | null {
	if (!rules || rules.length === 0) return null;

	for (const rule of rules) {
		const cond = rule.conditions as Record<string, unknown> | undefined;
		if (!cond) continue;
		if (evaluateCondition(cond, input)) return rule;
	}
	return null;
}

function evaluateCondition(cond: unknown, input: TriageInput): boolean {
	// Logical combinators
	if (cond === null || cond === undefined) return false;
	if (typeof cond === "boolean") return cond;
	if (Array.isArray(cond)) {
		// default: AND semantics for array of conditions
		return cond.every((c) => evaluateCondition(c, input));
	}

	if (typeof cond === "object" && cond !== null) {
		const cn = cond as Record<string, unknown>;
		if (cn.and && Array.isArray(cn.and))
			return (cn.and as unknown[]).every((c) => evaluateCondition(c, input));
		if (cn.or && Array.isArray(cn.or))
			return (cn.or as unknown[]).some((c) => evaluateCondition(c, input));
		if (cn.not) return !evaluateCondition(cn.not as unknown, input);
	}

	// Leaf object: keys map to comparisons
	for (const key of Object.keys(cond)) {
		const val = (cond as Record<string, unknown>)[key];
		// handle special comparator suffixes
		const m = key.match(/(.+?)_(lt|lte|gt|gte|eq|ne|in|contains)$/);
		let fieldKey = key;
		let op: string | null = null;
		if (m) {
			fieldKey = m[1];
			op = m[2];
		}

		const actual = resolveField(fieldKey, input);

		if (op === "lt") {
			if (!(Number(actual) < Number(val))) return false;
			continue;
		}
		if (op === "lte") {
			if (!(Number(actual) <= Number(val))) return false;
			continue;
		}
		if (op === "gt") {
			if (!(Number(actual) > Number(val))) return false;
			continue;
		}
		if (op === "gte") {
			if (!(Number(actual) >= Number(val))) return false;
			continue;
		}
		if (op === "eq") {
			if (!(actual === val)) return false;
			continue;
		}
		if (op === "ne") {
			if (!(actual !== val)) return false;
			continue;
		}
		if (op === "in") {
			if (!Array.isArray(val)) return false;
			if (!(val as unknown[]).includes(actual)) return false;
			continue;
		}
		if (op === "contains") {
			if (!Array.isArray(actual)) return false;
			if (!(actual as unknown[]).includes(val)) return false;
			continue;
		}

		// No comparator: handle booleans, arrays and equality
		// Special-case `_any` semantics even when `val` is an array (arrays are objects)
		if (fieldKey.endsWith("_any") && Array.isArray(val)) {
			const baseKey = fieldKey.replace(/_any$/, "");
			const actualArr = resolveField(baseKey, input);
			if (!Array.isArray(actualArr)) return false;
			const anyMatch = (val as unknown[]).some((v) =>
				(actualArr as unknown[]).includes(v),
			);
			if (!anyMatch) return false;
			continue;
		}

		if (typeof val === "object" && val !== null) {
			// nested condition on sub-object — evaluate recursively
			if (!evaluateCondition(val, { ...input })) return false;
		} else {
			if (actual === undefined) return false;
			if (actual !== val) return false;
		}
	}
	return true;
}

function resolveField(fieldKey: string, input: TriageInput): unknown {
	// Dot paths supported: symptom.temperature_celsius
	if (fieldKey.includes(".")) {
		const parts = fieldKey.split(".");
		let cur: unknown = input as unknown;
		for (const p of parts) {
			if (cur == null) return undefined;
			cur = (cur as Record<string, unknown>)[p];
		}
		return cur;
	}

	// Try direct symptom, patient lookup
	// Common short names map to symptom fields
	const s = input.symptom as unknown as Record<string, unknown> | undefined;
	const p = input.patient as unknown as Record<string, unknown> | undefined;
	if (s && Object.hasOwn(s, fieldKey)) return s[fieldKey];
	if (p && Object.hasOwn(p, fieldKey)) return p[fieldKey];
	// fallback to top-level
	return (input as unknown as Record<string, unknown>)[fieldKey];
}
