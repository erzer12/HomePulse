import { useRouter } from "expo-router";
import { Clock, Share2, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	Share,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { generateShareText } from "@/services/share";
import { getActiveTokensForCase, revokeToken } from "@/services/token";
import { useCaseStore } from "@/store/case";

type TokenEntry = {
	token: string;
	expires_at: number | null;
	created_at: number;
};

/**
 * Manage active share links for the current case.
 * Lists all non-revoked, non-expired tokens.
 * Allows the caregiver to share (resend) or revoke individual tokens.
 */
export default function ManageSharesScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const activeCase = useCaseStore((s) => s.activeCase);

	const [tokens, setTokens] = useState<TokenEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [revoking, setRevoking] = useState<string | null>(null);
	const [revokeTarget, setRevokeTarget] = useState<TokenEntry | null>(null);

	const load = useCallback(async () => {
		if (!activeCase) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const result = await getActiveTokensForCase(activeCase.id);
			setTokens(result);
		} catch (err) {
			console.error("Failed to load share tokens", err);
		} finally {
			setLoading(false);
		}
	}, [activeCase]);

	useEffect(() => {
		load();
	}, [load]);

	const handleShare = async (token: TokenEntry) => {
		const text = generateShareText(token.token, "Shared case — HomePulse");
		await Share.share({ message: text });
	};

	const handleRevokeConfirm = async () => {
		if (!revokeTarget) return;
		setRevoking(revokeTarget.token);
		setRevokeTarget(null);
		try {
			await revokeToken(revokeTarget.token);
			setTokens((prev) => prev.filter((t) => t.token !== revokeTarget.token));
		} catch {
			Alert.alert("Error", "Could not revoke this link. Please try again.");
		} finally {
			setRevoking(null);
		}
	};

	const formatExpiry = (ts: number | null) => {
		// null means stored as NULL in DB (until_resolved), same as MAX_SAFE_INTEGER sentinel
		if (ts === null || ts >= Number.MAX_SAFE_INTEGER - 1)
			return "Active until resolved";
		const diff = ts - Date.now();
		if (diff < 0) return "Expired";
		const hours = Math.floor(diff / 3600000);
		const mins = Math.floor((diff % 3600000) / 60000);
		if (hours > 0) return `${hours}h ${mins}m remaining`;
		return `${mins}m remaining`;
	};

	if (!activeCase) {
		return (
			<View
				style={[
					styles.container,
					{ paddingTop: insets.top, paddingBottom: insets.bottom },
				]}
			>
				<View style={styles.header}>
					<Text style={styles.title}>Active Share Links</Text>
					<Pressable onPress={() => router.back()} accessibilityRole="button">
						<Text style={styles.closeBtn}>Done</Text>
					</Pressable>
				</View>
				<View style={styles.center}>
					<Text style={styles.emptyText}>
						No active health cases. Start a case on the Home tab to share access
						with other caregivers.
					</Text>
					<Button
						title="Go Back"
						onPress={() => router.back()}
						style={styles.emptyBtn}
					/>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<Text style={styles.title}>Active Share Links</Text>
				<Pressable onPress={() => router.back()} accessibilityRole="button">
					<Text style={styles.closeBtn}>Done</Text>
				</Pressable>
			</View>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator color={COLORS.primary} />
				</View>
			) : tokens.length === 0 ? (
				<View style={styles.center}>
					<Text style={styles.emptyText}>
						No active share links for this case.
					</Text>
					<Button
						title="Generate Share Link"
						onPress={() => router.push("/caregiver-share/share-link")}
						style={styles.emptyBtn}
					/>
				</View>
			) : (
				<View style={{ flex: 1 }}>
					<ScrollView
						contentContainerStyle={[
							styles.scroll,
							{ paddingBottom: insets.bottom + 80 },
						]}
					>
						<Text style={styles.hint}>
							Tap "Revoke" to immediately invalidate a link. The caregiver using
							it will see an "Invalid Link" screen.
						</Text>

						{tokens.map((token) => (
							<View key={token.token} style={styles.card}>
								<View style={styles.cardHeader}>
									<Text style={styles.tokenId}>…{token.token.slice(-8)}</Text>
									<View style={styles.expiryRow}>
										<Clock size={13} color={COLORS.textSecondary} />
										<Text style={styles.expiryText}>
											{formatExpiry(token.expires_at)}
										</Text>
									</View>
								</View>

								<View style={styles.actions}>
									<Pressable
										style={styles.shareBtn}
										onPress={() => handleShare(token)}
										accessibilityRole="button"
										accessibilityLabel="Resend this share link"
									>
										<Share2 size={16} color={COLORS.primary} />
										<Text style={styles.shareBtnText}>Resend</Text>
									</Pressable>

									<Pressable
										style={[
											styles.revokeBtn,
											revoking === token.token && styles.revokingBtn,
										]}
										onPress={() => setRevokeTarget(token)}
										disabled={revoking === token.token}
										accessibilityRole="button"
										accessibilityLabel="Revoke this share link"
									>
										{revoking === token.token ? (
											<ActivityIndicator
												size="small"
												color={COLORS.state.urgent.primary}
											/>
										) : (
											<>
												<Trash2 size={16} color={COLORS.state.urgent.primary} />
												<Text style={styles.revokeBtnText}>Revoke</Text>
											</>
										)}
									</Pressable>
								</View>
							</View>
						))}
					</ScrollView>
					<View
						style={[
							styles.footer,
							{ paddingBottom: insets.bottom + SPACING.lg },
						]}
					>
						<Button
							title="Generate New Share Link"
							onPress={() => router.push("/caregiver-share/share-link")}
						/>
					</View>
				</View>
			)}

			<ConfirmDialog
				visible={!!revokeTarget}
				title="Revoke Link"
				message={`This will immediately invalidate the link ending in …${revokeTarget?.token.slice(-8)}. The caregiver using it will lose access.`}
				confirmLabel="Revoke"
				cancelLabel="Cancel"
				destructive
				onConfirm={handleRevokeConfirm}
				onCancel={() => setRevokeTarget(null)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: SPACING.screenEdge,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	title: { fontSize: 20, fontWeight: "800", color: COLORS.textPrimary },
	closeBtn: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: SPACING.screenEdge,
		gap: SPACING.lg,
	},
	emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: "center" },
	emptyBtn: { height: 50, paddingHorizontal: SPACING.xxl },
	scroll: { padding: SPACING.screenEdge },
	hint: {
		fontSize: 13,
		color: COLORS.textSecondary,
		lineHeight: 18,
		marginBottom: SPACING.xl,
	},
	card: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		padding: SPACING.xl,
		marginBottom: SPACING.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	tokenId: {
		fontSize: 13,
		fontFamily: "monospace",
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
	expiryRow: { flexDirection: "row", alignItems: "center", gap: 4 },
	expiryText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
	actions: { flexDirection: "row", gap: SPACING.md },
	shareBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: COLORS.state.monitor.surface,
		borderRadius: RADIUS.lg,
		paddingVertical: SPACING.md,
	},
	shareBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
	revokeBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		backgroundColor: COLORS.state.urgent.surface,
		borderRadius: RADIUS.lg,
		paddingVertical: SPACING.md,
	},
	revokingBtn: { opacity: 0.5 },
	revokeBtnText: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.state.urgent.primary,
	},
	footer: {
		backgroundColor: COLORS.background,
		padding: SPACING.screenEdge,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
});
