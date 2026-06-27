import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING } from "@/constants/colors";
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

	useEffect(() => {
		if (!token) {
			setStatus("invalid");
			router.replace("/secondary/token-invalid");
			return;
		}

		validateToken(token).then((result) => {
			setStatus(result);
			if (result === "valid") {
				router.replace({ pathname: "/secondary/desk", params: { token } });
			} else if (result === "expired") {
				router.replace("/secondary/token-expired");
			} else {
				router.replace("/secondary/token-invalid");
			}
		});
	}, [token, router]);

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
});
