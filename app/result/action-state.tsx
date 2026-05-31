import { Stack, useRouter } from "expo-router";
import { CheckCircle2, ChevronRight, Clock, Share2 } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionStateCard } from "@/components/triage/ActionStateCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";

// Mock data for State 2 (Guided Home Care)
const MOCK_RESULT = {
	state: {
		level: 2,
		label: "Guided Home Care",
		explanation:
			"Rohan's symptoms require active management at home. Follow the care steps below and recheck in 4 hours.",
	},
	nextSteps: [
		{
			id: "1",
			title: "Administer Paracetamol (as per weight)",
			icon: <CheckCircle2 size={20} color={COLORS.state.care.primary} />,
		},
		{
			id: "2",
			title: "Ensure frequent sips of ORS or water",
			icon: <CheckCircle2 size={20} color={COLORS.state.care.primary} />,
		},
		{
			id: "3",
			title: "Keep room well-ventilated and cool",
			icon: <CheckCircle2 size={20} color={COLORS.state.care.primary} />,
		},
	],
	recheckInterval: "4 hours",
};

export default function ActionStateScreen() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					title: "Care Plan",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
					headerRight: () => (
						<Share2
							size={24}
							color={COLORS.primary}
							style={{ marginRight: SPACING.md }}
						/>
					),
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<ActionStateCard state={MOCK_RESULT.state} />

				<View style={styles.recheckCard}>
					<Clock size={20} color={COLORS.state.care.text} />
					<Text style={styles.recheckText}>
						Recheck condition in{" "}
						<Text style={styles.bold}>{MOCK_RESULT.recheckInterval}</Text>
					</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Immediate Care Steps</Text>
					{MOCK_RESULT.nextSteps.map((step) => (
						<Card key={step.id} style={styles.stepCard}>
							<View style={styles.stepIcon}>{step.icon}</View>
							<Text style={styles.stepTitle}>{step.title}</Text>
						</Card>
					))}
				</View>

				<Pressable
					style={styles.detailsButton}
					onPress={() => router.push("/result/explanation")}
				>
					<Text style={styles.detailsText}>Why this recommendation?</Text>
					<ChevronRight size={20} color={COLORS.textSecondary} />
				</Pressable>

				<View style={styles.footer}>
					<Button
						title="Go to Home"
						variant="primary"
						onPress={() => router.replace("/(tabs)/home")}
					/>
				</View>
			</ScrollView>
		</View>
	);
}

// Re-defining Pressable style for inline component
import { Pressable } from "react-native";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	scrollContent: {
		padding: SPACING.screenEdge,
		paddingBottom: 40,
	},
	recheckCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.state.care.surface,
		padding: SPACING.lg,
		borderRadius: RADIUS.lg,
		marginTop: SPACING.lg,
		marginBottom: SPACING.sectionGap,
	},
	recheckText: {
		fontSize: 16,
		color: COLORS.state.care.text,
		marginLeft: SPACING.md,
	},
	bold: {
		fontWeight: "700",
	},
	section: {
		marginBottom: SPACING.sectionGap,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.textPrimary,
		marginBottom: SPACING.lg,
	},
	stepCard: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.md,
		padding: SPACING.lg,
		backgroundColor: COLORS.surfaceElevated,
	},
	stepIcon: {
		marginRight: SPACING.md,
	},
	stepTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.textPrimary,
		flex: 1,
	},
	detailsButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: SPACING.xl,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: COLORS.border,
		marginBottom: SPACING.sectionGap,
	},
	detailsText: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.textSecondary,
	},
	footer: {
		marginTop: "auto",
	},
});
