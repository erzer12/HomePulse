import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "@/constants/colors";

/**
 * Deep link routing gateway.
 * Catches links matching: homepulse://case/<token>
 * Automatically forwards them to the secondary caregiver index gate.
 */
export default function CaseDeepLinkRedirect() {
	const { token } = useLocalSearchParams<{ token: string }>();
	const router = useRouter();

	useEffect(() => {
		if (token) {
			router.replace({
				pathname: "/secondary",
				params: { token },
			});
		} else {
			router.replace("/");
		}
	}, [token, router]);

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={COLORS.primary} />
			<Text style={styles.text}>Routing deep link...</Text>
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
	},
	text: {
		fontSize: 14,
		color: COLORS.textSecondary,
	},
});
