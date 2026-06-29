import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { RotateCcw, ShieldOff, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { truncateDatabase } from "@/db/connection";
import { cancelAllNotifications } from "@/services/notifications";

/**
 * Auth Lockout screen — shown after 3 consecutive biometric failures.
 *
 * Two options (from spec):
 *  A. Reset biometrics → re-register on same device → push to /onboarding/passkey-setup
 *  B. Wipe & restart → full data wipe → replace to /onboarding/passkey-setup (fresh start)
 */
export default function LockoutScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [wipeDialogVisible, setWipeDialogVisible] = useState(false);
	const [resetDialogVisible, setResetDialogVisible] = useState(false);
	const [wiping, setWiping] = useState(false);

	const handleResetBiometrics = () => {
		setResetDialogVisible(true);
	};

	const handleResetBiometricsConfirmed = async () => {
		setResetDialogVisible(false);
		setWiping(true);
		try {
			// Cancel all OS-scheduled recheck alarms before wiping so stale
			// notifications don't fire pointing at deleted cases.
			await cancelAllNotifications().catch(() => {});
			await truncateDatabase();
			setWiping(false);
			// Soft reset: navigate directly to the passkey re-enrollment screen
			// so the user re-registers their biometrics on the same device.
			// The JS runtime is NOT restarted — in-memory stores clear on navigation.
			router.replace("/onboarding/passkey-setup");
		} catch {
			// Truncation failed — stay on lockout screen so the user knows
			// their data was NOT cleared, matching the behaviour of Wipe & Restart.
			setWiping(false);
		}
	};

	const handleWipeConfirmed = async () => {
		setWipeDialogVisible(false);
		setWiping(true);
		try {
			// Cancel all OS-scheduled recheck alarms before wiping so stale
			// notifications don't fire pointing at deleted cases.
			await cancelAllNotifications().catch(() => {});
			await truncateDatabase();
			// Reload the JS runtime so all Zustand stores start fresh.
			await Updates.reloadAsync();
		} catch {
			setWiping(false);
		}
	};

	return (
		<View
			style={[
				styles.container,
				{ paddingTop: insets.top, paddingBottom: insets.bottom },
			]}
		>
			<View style={styles.content}>
				<View style={styles.iconCircle}>
					<ShieldOff
						size={48}
						color={COLORS.state.urgent.primary}
						strokeWidth={2}
					/>
				</View>

				<Text style={styles.title}>Account Locked</Text>
				<Text style={styles.body}>
					Too many failed authentication attempts. Choose an option to regain
					access.
				</Text>

				<View style={styles.optionCard}>
					<View style={styles.optionHeader}>
						<RotateCcw size={20} color={COLORS.primary} />
						<Text style={styles.optionTitle}>Reset Biometrics</Text>
					</View>
					<Text style={styles.optionDesc}>
						Re-register your fingerprint or Face ID on this device. All local
						database records are cleared for security.
					</Text>
					<Button
						title={wiping ? "Resetting…" : "Reset Biometrics"}
						disabled={wiping}
						onPress={handleResetBiometrics}
						style={styles.optionBtn}
					/>
				</View>

				<View style={[styles.optionCard, styles.dangerCard]}>
					<View style={styles.optionHeader}>
						<Trash2 size={20} color={COLORS.state.urgent.primary} />
						<Text style={[styles.optionTitle, styles.dangerTitle]}>
							Wipe & Restart
						</Text>
					</View>
					<Text style={styles.optionDesc}>
						Permanently delete all local data and start fresh. This cannot be
						undone.
					</Text>
					<Button
						title={wiping ? "Wiping…" : "Wipe & Restart"}
						variant="urgent"
						disabled={wiping}
						onPress={() => setWipeDialogVisible(true)}
						style={styles.optionBtn}
					/>
				</View>
			</View>

			<ConfirmDialog
				visible={wipeDialogVisible}
				title="Wipe All Data"
				message="This will permanently delete all patient profiles, cases, and history. Type WIPE to confirm."
				requiresTyping="WIPE"
				confirmLabel="Wipe Everything"
				cancelLabel="Cancel"
				destructive
				onConfirm={handleWipeConfirmed}
				onCancel={() => setWipeDialogVisible(false)}
			/>

			<ConfirmDialog
				visible={resetDialogVisible}
				title="Reset Biometrics"
				message="To re-register biometrics, all local database records must be cleared for security. Type RESET to confirm."
				requiresTyping="RESET"
				confirmLabel="Reset & Clear Data"
				cancelLabel="Cancel"
				destructive
				onConfirm={handleResetBiometricsConfirmed}
				onCancel={() => setResetDialogVisible(false)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
		padding: SPACING.screenEdge,
	},
	content: {
		flex: 1,
		justifyContent: "center",
	},
	iconCircle: {
		width: 88,
		height: 88,
		borderRadius: 44,
		backgroundColor: COLORS.state.urgent.surface,
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "center",
		marginBottom: SPACING.xxl,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.textPrimary,
		textAlign: "center",
		marginBottom: SPACING.md,
	},
	body: {
		fontSize: 15,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: SPACING.xxl,
	},
	optionCard: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xxl,
		padding: SPACING.xl,
		marginBottom: SPACING.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	dangerCard: {
		borderWidth: 1.5,
		borderColor: COLORS.state.urgent.surface,
	},
	optionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		marginBottom: SPACING.sm,
	},
	optionTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
	dangerTitle: {
		color: COLORS.state.urgent.primary,
	},
	optionDesc: {
		fontSize: 13,
		color: COLORS.textSecondary,
		lineHeight: 18,
		marginBottom: SPACING.lg,
	},
	optionBtn: {
		height: 50,
	},
});
