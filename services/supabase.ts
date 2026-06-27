import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { APP_CONFIG } from "@/constants/config";

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
 * Opens the system browser and redirects back to homepulse://auth-callback
 */
export async function signInWithGoogle() {
	const redirectUrl = Linking.createURL("auth-callback");
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: redirectUrl,
			skipBrowserRedirect: false,
		},
	});
	if (error) throw error;
	return data;
}

export interface CaseSummary {
	token: string;
	case_id: string;
	created_at: number;
	state_level: number;
	tasks?: { id: string; title: string; status: string }[];
}

export async function publishCaseSummary(summary: CaseSummary): Promise<void> {
	const actionTitles: Record<number, string> = {
		1: "Monitor at Home",
		2: "Guided Home Care",
		3: "Arrange Teleconsultation",
		4: "Seek Urgent Care Now",
	};
	const recheckIntervals: Record<number, number> = {
		1: 360,
		2: 120,
		3: 240,
		4: 0,
	};
	const action_title = actionTitles[summary.state_level] || "Monitor at Home";
	const recheck_interval_minutes = recheckIntervals[summary.state_level] ?? 360;

	const { error } = await supabase.from("case_summaries").upsert({
		token: summary.token,
		case_id: summary.case_id,
		created_at: summary.created_at,
		triage_level: summary.state_level,
		patient_name: "Family Member",
		action_title,
		recheck_interval_minutes,
		summary_text: `Triage evaluation result: Level ${summary.state_level}. Vitals monitored offline.`,
		tasks: summary.tasks || [],
		expires_at: Date.now() + 48 * 3600 * 1000,
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
		tasks: data.tasks,
	};
}

export async function updateTaskStatus(
	taskId: string,
	status: "pending" | "done",
	completedAt?: number | null,
) {
	const { error } = await supabase
		.from("tasks")
		.update({
			status,
			completed_at: status === "done" ? (completedAt ?? Date.now()) : null,
		})
		.eq("id", taskId);
	if (error) throw error;
}
