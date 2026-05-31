export const APP_CONFIG = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  groqApiUrl: process.env.EXPO_PUBLIC_GROQ_API_URL ?? '',
  posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '',
  aiExplanationsEnabled: process.env.EXPO_PUBLIC_AI_EXPLANATIONS_ENABLED === 'true',
  realtimeSyncEnabled: process.env.EXPO_PUBLIC_REALTIME_SYNC_ENABLED === 'true',
} as const;
