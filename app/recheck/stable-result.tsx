import { useRouter } from "expo-router";
import { CheckCircle2, TrendingDown } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";

/**
 * Recheck Outcome A — Stable or Improving.
 * Green "patient stable" result screen shown after a recheck where symptoms
 * have not worsened. Resets the timer and returns to Home State B.
 */
export default function StableResultScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const activeCase = useCaseStore((s) => s.activeCase);
	const level = activeCase?.triage_output?.action_state?.level ?? 1;

	const handleDismiss = () => {
		router.replace("/(tabs)/home");
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
					<CheckCircle2
						size={56}
						color={COLORS.state.monitor.primary}
						strokeWidth={2}
					/>
				</View>

				<Text style={styles.title}>Patient is Stable</Text>
				<Text style={styles.subtitle}>
					No worsening symptoms detected since the last check.
				</Text>

				<View style={styles.card}>
					<View style={styles.cardRow}>
						<TrendingDown size={18} color={COLORS.state.monitor.primary} />
						<Text style={styles.cardText}>
							Continue Level {level} care. Monitor for any changes.
						</Text>
					</View>
				</View>

				<Text style={styles.note}>The next recheck timer has been reset.</Text>
			</View>

			<View style={styles.footer}>
				<Button title="Back to Monitoring" onPress={handleDismiss} />
				<Pressable
					style={styles.historyLink}
					onPress={() => router.push("/(tabs)/history")}
					accessibilityRole="link"
				>
					<Text style={styles.historyText}>View case history</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.state.monitor.surface,
		padding: SPACING.screenEdge,
		justifyContent: "space-between",
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
		backgroundColor: "#FFFFFF",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.xxl,
		shadowColor: COLORS.state.monitor.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 20,
		elevation: 8,
	},
	title: {
		fontSize: 30,
		fontWeight: "800",
		color: COLORS.state.monitor.text,
		textAlign: "center",
		marginBottom: SPACING.md,
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.state.monitor.text,
		opacity: 0.8,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: SPACING.xxl,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: RADIUS.xl,
		padding: SPACING.xl,
		width: "100%",
		marginBottom: SPACING.xl,
	},
	cardRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
	},
	cardText: {
		flex: 1,
		fontSize: 15,
		fontWeight: "600",
		color: COLORS.state.monitor.text,
		lineHeight: 22,
	},
	note: {
		fontSize: 13,
		color: COLORS.state.monitor.text,
		opacity: 0.6,
	},
	footer: {
		gap: SPACING.md,
	},
	historyLink: {
		alignItems: "center",
	},
	historyText: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.state.monitor.text,
		textDecorationLine: "underline",
	},
});
