import { createClient } from "@supabase/supabase-js";
import { APP_CONFIG } from "@/constants/config";

export const supabase = createClient(
	APP_CONFIG.supabaseUrl,
	APP_CONFIG.supabaseAnonKey,
	{
		auth: { persistSession: false },
	},
);

export async function enqueueSync(): Promise<void> {
	return Promise.resolve();
}
