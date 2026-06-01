import { createClient } from "@supabase/supabase-js";
import { APP_CONFIG } from "@/constants/config";

export const supabase = createClient(
	APP_CONFIG.supabaseUrl,
	APP_CONFIG.supabaseAnonKey,
	{
		auth: { persistSession: false },
	},
);

export interface CaseSummary {
	token: string;
	case_id: string;
	created_at: number;
	state_level: number;
	tasks?: { id: string; title: string; status: string }[];
}

export async function publishCaseSummary(summary: CaseSummary): Promise<void> {
	const { error } = await supabase.from("case_summaries").upsert(
		{
			token: summary.token,
			case_id: summary.case_id,
			created_at: summary.created_at,
			state_level: summary.state_level,
			tasks: summary.tasks || [],
			expires_at: Date.now() + 48 * 3600 * 1000,
		},
		{ returning: "minimal" },
	);
	if (error) throw error;
}

export async function updateTaskStatus(
	taskId: string,
	status: "pending" | "done",
) {
	const { error } = await supabase
		.from("tasks")
		.update({ status, completed_at: status === "done" ? Date.now() : null })
		.eq("id", taskId);
	if (error) throw error;
}
