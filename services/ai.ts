import type { TriageOutput } from '@/types/triage';

const FALLBACK_TEMPLATES: Record<1 | 2 | 3 | 4, string> = {
  1: 'Symptoms appear mild. Continue home monitoring and follow recheck timing.',
  2: 'Provide guided home care, hydration, and symptom tracking.',
  3: 'Arrange teleconsultation or clinic review within a few hours.',
  4: 'Seek urgent in-person care immediately.',
};

export async function generateExplanation(output: TriageOutput): Promise<string> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
    if (!apiKey) throw new Error('Missing API key');

    // API integration intentionally optional and non-critical.
    throw new Error('API unavailable');
  } catch {
    return FALLBACK_TEMPLATES[output.action_state.level];
  }
}
