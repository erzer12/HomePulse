import type { TriageOutput } from '@/types/triage';
import { createAIClient } from './ai/client';

const groqUrl = process.env.EXPO_PUBLIC_GROQ_API_URL;
const client = createAIClient(groqUrl);

export async function generateExplanation(output: TriageOutput): Promise<string> {
  return client.generateExplanation(output);
}
