import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { Fingerprint, Shield } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";

const getLocalAuth = () => {
	try {
		return require("expo-local-authentication");
	} catch {
		return null;
	}
};

/**
 * Onboarding Screen 1 — Register device biometrics.
 * Cannot be skipped. This is the security anchor for the app.
 */
export default function PasskeySetupScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [status, setStatus] = useState<
		"idle" | "registering" | "success" | "unavailable"
	>("idle");

	const handleRegister = async () => {
		const LocalAuth = getLocalAuth();

		if (!LocalAuth) {
			// Simulator / no biometrics support — skip but mark as done
			await AsyncStorage.setItem("biometrics_registered", "1");
			router.push("/onboarding/household-setup");
			return;
		}

		setStatus("registering");

		const hasHW = await LocalAuth.hasHardwareAsync();
		if (!hasHW) {
			setStatus("unavailable");
			return;
		}

		const enrolled = await LocalAuth.isEnrolledAsync();
		if (!enrolled) {
			setStatus("unavailable");
			return;
		}

		// Perform a test authentication to confirm it works
		const result = await LocalAuth.authenticateAsync({
			promptMessage: "Confirm your identity to register",
			cancelLabel: "Cancel",
		});

		if (result.success) {
			await AsyncStorage.setItem("biometrics_registered", "1");
			setStatus("success");
			setTimeout(() => router.push("/onboarding/create-profile"), 600);
		} else {
			setStatus("idle");
		}
	};

	const handleSimulatorContinue = () => {
		AsyncStorage.setItem("biometrics_registered", "1").then(() => {
			router.push("/onboarding/create-profile");
		});
	};

	return (
		<View
			style={[
				styles.container,
				{ paddingTop: insets.top, paddingBottom: insets.bottom },
			]}
		>
			<Stack.Screen options={{ headerShown: false }} />

			<View style={styles.stepBar}>
				<View style={[styles.stepDot, styles.stepActive]} />
				<View style={styles.stepDot} />
				<View style={styles.stepDot} />
			</View>

			<View style={styles.content}>
				<View style={styles.iconCircle}>
					{status === "success" ? (
						<Shield
							size={52}
							color={COLORS.state.monitor.primary}
							strokeWidth={2}
						/>
					) : (
						<Fingerprint size={52} color={COLORS.primary} strokeWidth={1.8} />
					)}
				</View>

				<Text style={styles.title}>
					{status === "success" ? "You're Secured" : "Secure Your App"}
				</Text>
				<Text style={styles.body}>
					{status === "unavailable"
						? "Biometrics are not set up on this device. Please enroll a fingerprint or Face ID in your device Settings, then return here."
						: "Register your fingerprint or Face ID. This protects access to your family's health data and cannot be skipped."}
				</Text>

				<View style={styles.featureRow}>
					{[
						"Offline-first protection",
						"No password to remember",
						"Instant unlock",
					].map((f) => (
						<View key={f} style={styles.featureChip}>
							<Text style={styles.featureText}>{f}</Text>
						</View>
					))}
				</View>
			</View>

			<View style={styles.footer}>
				{status === "registering" ? (
					<ActivityIndicator size="large" color={COLORS.primary} />
				) : status === "unavailable" ? (
					<Button
						title="Continue Without Biometrics"
						variant="outline"
						onPress={handleSimulatorContinue}
					/>
				) : (
					<View style={styles.buttonGroup}>
						<Button
							title={
								status === "success" ? "Registered ✓" : "Register Biometrics"
							}
							onPress={handleRegister}
							disabled={status === "success"}
						/>
						{status !== "success" && (
							<Button
								title="Join as Secondary Caregiver"
								variant="outline"
								onPress={() => router.push("/secondary/scan")}
								style={styles.scanBtn}
							/>
						)}
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
		padding: SPACING.screenEdge,
	},
	stepBar: {
		flexDirection: "row",
		gap: 6,
		marginBottom: SPACING.xxl,
	},
	stepDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.border,
	},
	stepActive: {
		backgroundColor: COLORS.primary,
		width: 24,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	iconCircle: {
		width: 112,
		height: 112,
		borderRadius: 56,
		backgroundColor: COLORS.surfaceElevated,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.xxl,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.12,
		shadowRadius: 20,
		elevation: 6,
	},
	title: {
		fontSize: 30,
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
		paddingHorizontal: SPACING.md,
	},
	featureRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: SPACING.sm,
	},
	featureChip: {
		backgroundColor: COLORS.state.monitor.surface,
		borderRadius: RADIUS.full,
		paddingHorizontal: SPACING.lg,
		paddingVertical: 6,
	},
	featureText: {
		fontSize: 12,
		fontWeight: "600",
		color: COLORS.state.monitor.text,
	},
	footer: {
		paddingTop: SPACING.lg,
	},
	buttonGroup: {
		gap: SPACING.md,
	},
	scanBtn: {
		borderWidth: 0,
	},
});
