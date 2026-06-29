import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { APP_CONFIG } from "@/constants/config";
import { buildActionState } from "@/engine";

// Handle redirection completion
WebBrowser.maybeCompleteAuthSession();

export const supabase = createClient(
	APP_CONFIG.supabaseUrl,
	APP_CONFIG.supabaseAnonKey,
	{
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
	},
);

/**
 * Initiates the Google OAuth Sign-in flow.
 * Opens the system browser and redirects back to homepulse://auth/callback.
 * Uses skipBrowserRedirect: true so that React Native (which has no
 * window.location) never sees the redirect — we open it ourselves via
 * WebBrowser.openAuthSessionAsync.
 */
export async function signInWithGoogle() {
	const redirectUrl = Linking.createURL("auth/callback");
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: redirectUrl,
			skipBrowserRedirect: true,
		},
	});
	if (error) throw error;
	if (data?.url) {
		await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
	}
	return data;
}

export interface CaseSummary {
	token: string;
	case_id: string;
	created_at: number;
	state_level: number;
	patient_name?: string;
	tasks?: { id: string; title: string; status: string }[];
	expires_at?: number;
}

export async function publishCaseSummary(summary: CaseSummary): Promise<void> {
	// Clamp state_level to the valid 1–4 range before calling buildActionState.
	// Without this, any value outside [1,4] (future triage level, DB glitch, etc.)
	// makes buildActionState return undefined, and reading .label immediately throws.
	const clampedLevel = Math.max(1, Math.min(4, summary.state_level)) as
		| 1
		| 2
		| 3
		| 4;
	const canonicalState = buildActionState(clampedLevel);
	const action_title = canonicalState.label;
	const recheck_interval_minutes = canonicalState.recheckIntervalMinutes;

	const { error } = await supabase.from("case_summaries").upsert({
		token: summary.token,
		case_id: summary.case_id,
		created_at: summary.created_at,
		triage_level: summary.state_level,
		patient_name: summary.patient_name ?? "Family Member",
		action_title,
		recheck_interval_minutes,
		summary_text: `Triage evaluation result: Level ${summary.state_level}. Vitals monitored offline.`,
		tasks: summary.tasks || [],
		expires_at: summary.expires_at ?? Date.now() + 48 * 3600 * 1000,
	});
	if (error) throw error;
}

export async function getCaseSummary(
	token: string,
): Promise<CaseSummary | null> {
	const { data, error } = await supabase
		.from("case_summaries")
		.select("*")
		.eq("token", token)
		.single();

	if (error || !data) return null;
	return {
		token: data.token,
		case_id: data.case_id,
		created_at: data.created_at,
		state_level: data.triage_level ?? data.state_level,
		patient_name: data.patient_name,
		tasks: data.tasks,
	};
}

export async function updateTaskStatus(
	taskId: string,
	status: "pending" | "done",
	completedAt?: number | null,
) {
	const completed_at = status === "done" ? (completedAt ?? Date.now()) : null;

	// Try using the atomic database RPC first to prevent lost update races.
	// If the database has been updated with the latest schema setup, this runs atomically.
	const { error: rpcErr } = await supabase.rpc("update_task_status_atomic", {
		p_task_id: taskId,
		p_status: status,
		p_completed_at: completed_at,
	});

	if (!rpcErr) return;

	// Fallback to client-side read-modify-write if RPC is not deployed in older/un-migrated setups
	// 1. Update the tasks table (safely, checking error to avoid silent failures)
	const { data, error: updateError } = await supabase
		.from("tasks")
		.update({ status, completed_at })
		.eq("id", taskId)
		.select();

	if (updateError) throw updateError;

	// If the row doesn't exist yet, insert a new record for this task status
	if (!data || data.length === 0) {
		const { error: insertError } = await supabase
			.from("tasks")
			.insert({ id: taskId, status, completed_at });
		if (insertError) throw insertError;
	}

	// 2. Update the denormalized JSON tasks snapshot in all matching case_summaries
	const { data: summaries, error: fetchErr } = await supabase
		.from("case_summaries")
		.select("token, tasks")
		.contains("tasks", [{ id: taskId }]);

	if (fetchErr) throw fetchErr;

	if (summaries && summaries.length > 0) {
		for (const summary of summaries) {
			if (Array.isArray(summary.tasks)) {
				const rawTasks = summary.tasks as NonNullable<CaseSummary["tasks"]>;
				const updatedTasks = rawTasks.map((t) =>
					t.id === taskId ? { ...t, status, completed_at } : t,
				);
				const { error: writeErr } = await supabase
					.from("case_summaries")
					.update({ tasks: updatedTasks })
					.eq("token", summary.token);

				if (writeErr) throw writeErr;
			}
		}
	}
}
