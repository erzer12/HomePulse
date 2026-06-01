import type { ActionStateLevel } from "../types/triage";

interface ExplanationTemplate {
	explanation: string;
	homeCareSteps?: string[];
}

const TEMPLATES: Record<string, ExplanationTemplate> = {
	"1_default": {
		explanation:
			"Symptoms are mild and can be observed at home. Keep monitoring and follow simple care steps.",
		homeCareSteps: ["Offer fluids regularly", "Check temperature twice daily"],
	},
	"2_default": {
		explanation:
			"Symptoms need active home care. Follow the steps and recheck at the recommended interval.",
		homeCareSteps: [
			"Ensure hydration",
			"Use antipyretic if recommended by provider",
		],
	},
	"3_default": {
		explanation:
			"Arrange a teleconsultation for clinical assessment. Bring recent symptom details to the call.",
	},
	"4_default": {
		explanation:
			"This situation requires immediate in-person care. Seek the nearest clinic or hospital now.",
	},
};

export function getExplanationTemplate(
	stateLevel: ActionStateLevel,
	key?: string,
): ExplanationTemplate {
	const composite = key ? `${stateLevel}_${key}` : undefined;
	return (
		(composite && TEMPLATES[composite]) ||
		TEMPLATES[`${stateLevel}_default`] ||
		TEMPLATES["1_default"]
	);
}
