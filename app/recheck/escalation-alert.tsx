import { Stack, useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionStateCard } from "@/components/triage/ActionStateCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, SPACING } from "@/constants/colors";

const MOCK_CHANGES = [
	{ label: "Temperature", from: "38.2°C", to: "39.6°C", icon: "🌡️" },
	{ label: "Hydration", from: "Normal", to: "Poor", icon: "💧" },
	{ label: "Consciousness", from: "Alert", to: "Drowsy", icon: "🧠" },
];

const STATE_URGENT = {
	level: 4,
	label: "Seek Urgent Care Now",
	explanation:
		"Condition has worsened significantly. Immediate medical attention is required.",
};

export default function EscalationAlertScreen() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<Stack.Screen options={{ headerShown: false }} />

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<AlertCircle
						size={80}
						color={COLORS.state.urgent.primary}
						strokeWidth={2.5}
					/>
					<Text style={styles.title}>Condition has worsened</Text>
					<Text style={styles.summary}>
						Rohan's condition has changed significantly since the last check-in.
					</Text>
				</View>

				<Card variant="elevated" style={styles.changesCard}>
					<Text style={styles.cardTitle}>Key Changes Detected</Text>
					{MOCK_CHANGES.map((change) => (
						<View key={change.label} style={styles.changeRow}>
							<Text style={styles.changeIcon}>{change.icon}</Text>
							<View style={styles.changeText}>
								<Text style={styles.changeLabel}>{change.label}</Text>
								<Text style={styles.changeValue}>
									{change.from} → <Text style={styles.bold}>{change.to}</Text>
								</Text>
							</View>
						</View>
					))}
				</Card>

				<ActionStateCard state={STATE_URGENT} />

				<View style={styles.actions}>
					<Button
						title="I understand — Seek care now"
						variant="urgent"
						onPress={() => router.push("/recheck/check-in")} // Placeholder for locator
					/>
					<Button
						title="View full clinical details"
						variant="outline"
						style={styles.secondaryAction}
					/>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.state.urgent.surface,
	},
	scrollContent: {
		padding: SPACING.screenEdge,
		paddingTop: 80,
		paddingBottom: 40,
		alignItems: "center",
	},
	header: {
		alignItems: "center",
		marginBottom: SPACING.sectionGap,
	},
	title: {
		fontSize: 32,
		fontWeight: "800",
		color: COLORS.state.urgent.primary,
		textAlign: "center",
		marginTop: SPACING.lg,
		marginBottom: SPACING.sm,
	},
	summary: {
		fontSize: 18,
		color: COLORS.textPrimary,
		textAlign: "center",
		lineHeight: 26,
		paddingHorizontal: SPACING.md,
	},
	changesCard: {
		marginBottom: SPACING.sectionGap,
		width: "100%",
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textSecondary,
		marginBottom: SPACING.md,
		textTransform: "uppercase",
	},
	changeRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.md,
	},
	changeIcon: {
		fontSize: 24,
		marginRight: SPACING.md,
	},
	changeText: {
		flex: 1,
	},
	changeLabel: {
		fontSize: 14,
		color: COLORS.textSecondary,
	},
	changeValue: {
		fontSize: 18,
		color: COLORS.textPrimary,
	},
	bold: {
		fontWeight: "700",
		color: COLORS.state.urgent.primary,
	},
	actions: {
		width: "100%",
		marginTop: SPACING.xl,
	},
	secondaryAction: {
		marginTop: SPACING.md,
		borderWidth: 0,
	},
});
