import { Stack, useRouter } from "expo-router";
import { CheckCircle2, ChevronRight, Clock, Share2 } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { ActionStateCard } from "@/components/triage/ActionStateCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";
import type { ActionState } from "@/types/triage";

export default function ActionStateScreen() {
	const router = useRouter();
	const activeCase = useCaseStore((s) => s.activeCase);
	
	// Use the engine-provided state data from the store
	const stateData = activeCase?.triage_output?.action_state;
	const triageOutput = activeCase?.triage_output;

	if (!stateData) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>No care plan found for this case.</Text>
				<Button title="Go Home" onPress={() => router.replace("/(tabs)/home")} />
			</View>
		);
	}
	
	// Format interval for display
	const formatInterval = (minutes: number) => {
		if (minutes === 0) return "Immediately";
		if (minutes < 60) return `${minutes} minutes`;
		const hours = Math.floor(minutes / 60);
		return `${hours} hour${hours > 1 ? 's' : ''}`;
	};

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
				<ActionStateCard state={stateData} />

				<View style={styles.recheckCard}>
					<Clock size={20} color={COLORS.state.care.text} />
					<Text style={styles.recheckText}>
						Recheck condition in{" "}
						<Text style={styles.bold}>{formatInterval(stateData.recheckIntervalMinutes)}</Text>
					</Text>
				</View>

				{triageOutput?.care_instructions && triageOutput.care_instructions.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Immediate Care Steps</Text>
						{triageOutput.care_instructions.map((step: string, index: number) => (
							<Card key={`step-${index}`} style={styles.stepCard}>
								<View style={styles.stepIcon}>
									<CheckCircle2 size={20} color={COLORS.state.care.primary} />
								</View>
								<Text style={styles.stepTitle}>{step}</Text>
							</Card>
						))}
					</View>
				)}

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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	errorText: {
		fontSize: 18,
		textAlign: "center",
		marginTop: 100,
		color: COLORS.textSecondary,
		marginBottom: 20,
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
