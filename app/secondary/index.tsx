import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { type TokenStatus, validateToken } from "@/services/token";

/**
 * Secondary Caregiver Entry Gate.
 * Opened via deep link: homepulse://case/<token>
 * Routes to:
 *  valid   → /secondary/desk?token=…
 *  expired → /secondary/token-expired
 *  invalid → /secondary/token-invalid
 */
export default function SecondaryIndexScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { token } = useLocalSearchParams<{ token: string }>();
	const [status, setStatus] = useState<"checking" | TokenStatus>("checking");

	const checkToken = useCallback(async () => {
		if (!token) {
			setStatus("invalid");
			router.replace("/secondary/token-invalid");
			return;
		}

		setStatus("checking");
		try {
			const result = await validateToken(token);
			setStatus(result);
			if (result === "valid") {
				router.replace({ pathname: "/secondary/desk", params: { token } });
			} else if (result === "expired") {
				router.replace("/secondary/token-expired");
			} else if (result === "invalid") {
				router.replace("/secondary/token-invalid");
			}
		} catch (_err) {
			setStatus("network_error");
		}
	}, [token, router]);

	useEffect(() => {
		checkToken();
	}, [checkToken]);

	if (status === "network_error") {
		return (
			<View
				style={[
					styles.container,
					{ paddingTop: insets.top, paddingBottom: insets.bottom },
				]}
			>
				<View style={styles.errorCard}>
					<Text style={styles.errorTitle}>Connection Error</Text>
					<Text style={styles.errorSubtitle}>
						Unable to validate the access link. Please verify your internet
						connection and try again.
					</Text>
					<Button
						title="Retry Connection"
						onPress={checkToken}
						style={styles.retryBtn}
					/>
					<Button
						title="Cancel"
						variant="outline"
						onPress={() => router.replace("/")}
					/>
				</View>
			</View>
		);
	}

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ActivityIndicator size="large" color={COLORS.primary} />
			<Text style={styles.text}>
				{status === "checking" ? "Validating access link…" : "Redirecting…"}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
		justifyContent: "center",
		alignItems: "center",
		gap: SPACING.lg,
		padding: SPACING.screenEdge,
	},
	text: {
		fontSize: 15,
		color: COLORS.textSecondary,
		textAlign: "center",
	},
	errorCard: {
		width: "100%",
		padding: SPACING.xl,
		borderRadius: RADIUS.xl,
		backgroundColor: COLORS.surfaceElevated,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	errorTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: COLORS.textPrimary,
		marginBottom: 8,
		textAlign: "center",
	},
	errorSubtitle: {
		fontSize: 14,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: SPACING.xl,
	},
	retryBtn: {
		width: "100%",
		marginBottom: SPACING.md,
	},
});
