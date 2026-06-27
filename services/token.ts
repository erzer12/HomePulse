import { supabase } from "./supabase";

export type TokenStatus = "valid" | "expired" | "invalid";

const EXPIRY_OPTIONS_MS: Record<string, number> = {
	"6h": 6 * 3600 * 1000,
	"24h": 24 * 3600 * 1000,
	"48h": 48 * 3600 * 1000,
	until_resolved: Number.MAX_SAFE_INTEGER,
};

/**
 * Returns the ms TTL for a given expiry option key.
 * Defaults to 48h if the key is unrecognised.
 */
export function resolveExpiryMs(
	option: "6h" | "24h" | "48h" | "until_resolved",
): number {
	return EXPIRY_OPTIONS_MS[option] ?? EXPIRY_OPTIONS_MS["48h"];
}

/**
 * Validates a share token against Supabase:
 * - "valid"   — token exists, not expired, not revoked
 * - "expired" — token exists but `expires_at` has passed
 * - "invalid" — token not found or was explicitly revoked
 *
 * All paths return a status; they never throw to the caller.
 */
export async function validateToken(token: string): Promise<TokenStatus> {
	try {
		const { data, error } = await supabase
			.from("case_summaries")
			.select("token, expires_at, revoked")
			.eq("token", token)
			.single();

		if (error || !data) return "invalid";
		if (data.revoked) return "invalid";
		if (data.expires_at !== null && Date.now() > data.expires_at)
			return "expired";
		return "valid";
	} catch {
		// Network or unexpected error — treat as invalid rather than crashing
		return "invalid";
	}
}

/**
 * Revokes a share token by setting `revoked = true` on Supabase.
 * Throws on network or permission failure.
 */
export async function revokeToken(token: string): Promise<void> {
	const { error } = await supabase
		.from("case_summaries")
		.update({ revoked: true })
		.eq("token", token);
	if (error) throw error;
}

/**
 * Fetches all active (non-revoked, non-expired) tokens for a case.
 */
export async function getActiveTokensForCase(
	caseId: string,
): Promise<{ token: string; expires_at: number; created_at: number }[]> {
	const now = Date.now();
	const { data, error } = await supabase
		.from("case_summaries")
		.select("token, expires_at, created_at")
		.eq("case_id", caseId)
		.eq("revoked", false)
		.gt("expires_at", now);

	if (error || !data) return [];
	return data as { token: string; expires_at: number; created_at: number }[];
}
