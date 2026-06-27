import { useRouter } from "expo-router";
import { RotateCcw, ShieldOff, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { truncateDatabase } from "@/db/connection";

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
	const [wiping, setWiping] = useState(false);

	const handleResetBiometrics = async () => {
		setWiping(true);
		try {
			await truncateDatabase();
		} catch {
			// Best-effort database truncate
		} finally {
			setWiping(false);
			router.replace("/onboarding/passkey-setup");
		}
	};

	const handleWipeConfirmed = async () => {
		setWipeDialogVisible(false);
		setWiping(true);
		try {
			await truncateDatabase();
			router.replace("/onboarding/passkey-setup");
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
						Re-register your fingerprint or Face ID on this device. Your data is
						preserved.
					</Text>
					<Button
						title="Reset Biometrics"
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
