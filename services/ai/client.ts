import type { TriageOutput } from "@/types/triage";

const FALLBACK_TEMPLATES: Record<1 | 2 | 3 | 4, string> = {
	1: "Symptoms appear mild. Continue home monitoring and follow recheck timing.",
	2: "Provide guided home care, hydration, and symptom tracking.",
	3: "Arrange teleconsultation or clinic review within a few hours.",
	4: "Seek urgent in-person care immediately.",
};

export function createAIClient(groqUrl?: string) {
	const groqEndpoint = groqUrl ?? process.env.EXPO_PUBLIC_GROQ_API_URL;

	async function generateExplanation(output: TriageOutput): Promise<string> {
		const level = output.action_state.level as 1 | 2 | 3 | 4;

		// Optional free/public GROQ-like endpoint: expect `?level=` or POST body
		if (groqEndpoint) {
			try {
				// Try GET first: groq endpoint may support query param
				const getUrl = `${groqEndpoint.replace(/\/?$/, "")}?level=${level}`;
				const resp = await fetch(getUrl, { method: "GET" });
				if (resp.ok) {
					const data = await resp.json();
					return data?.text ?? FALLBACK_TEMPLATES[level];
				}

				// Fallback to POST with a GROQ-style query payload
				const postResp = await fetch(groqEndpoint, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						query: `*[_type == 'explanation' && level == ${level}][0]{text}`,
					}),
				});
				if (postResp.ok) {
					const data = await postResp.json();
					return data?.text ?? FALLBACK_TEMPLATES[level];
				}
			} catch {
				// fall through to fallback templates
			}
		}

		// 3) Final fallback: local templates (always available)
		return FALLBACK_TEMPLATES[level];
	}

	return { generateExplanation };
}
