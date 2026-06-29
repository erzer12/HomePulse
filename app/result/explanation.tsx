import { Stack, useRouter } from "expo-router";
import {
	AlertTriangle,
	ChevronLeft,
	Home,
	Lightbulb,
	Search,
	Share2,
} from "lucide-react-native";
import {
	Pressable,
	ScrollView,
	Share,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";
import type { TriageOutput } from "@/types/triage";
import { safeParseJson } from "@/utils/json";

export default function ExplanationScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const activeCase = useCaseStore((s) => s.activeCase);
	const profiles = usePatientStore((s) => s.profiles);

	// Get latest triage output and patient info
	const latestEntry = activeCase?.timeline?.[activeCase.timeline.length - 1];
	const triageOutput = safeParseJson<TriageOutput | null>(
		latestEntry?.triage_output,
		null,
	);
	const patient = profiles.find((p) => p.id === activeCase?.patient_id);
	const patientName = patient?.name || "the person";

	const getActionStateInfo = (level: number) => {
		switch (level) {
			case 4:
				return { label: "Urgent Care", theme: COLORS.state.urgent };
			case 3:
				return { label: "Consultation", theme: COLORS.state.teleconsult };
			case 2:
				return { label: "Guided Care", theme: COLORS.state.care };
			default:
				return { label: "Monitor", theme: COLORS.state.monitor };
		}
	};

	const stateInfo = getActionStateInfo(triageOutput?.action_state?.level || 1);

	const assessments = [
		{
			label: "Temperature",
			value: latestEntry?.temperature_celsius
				? `${latestEntry.temperature_celsius}°C`
				: "Not taken",
			status:
				latestEntry?.temperature_celsius &&
				latestEntry.temperature_celsius >= 38
					? "high"
					: "normal",
		},
		{
			label: "Symptom",
			value: latestEntry?.category
				? latestEntry.category.charAt(0).toUpperCase() +
					latestEntry.category.slice(1)
				: "None",
			status: "normal",
		},
		{
			label: "Hydration",
			value: latestEntry?.hydration_status || "Normal",
			status: latestEntry?.hydration_status === "poor" ? "high" : "normal",
		},
		{
			label: "Alertness",
			value: latestEntry?.consciousness || "Alert",
			status: latestEntry?.consciousness !== "alert" ? "high" : "normal",
		},
	];

	const onShareReasoning = async () => {
		try {
			const message =
				`HomePulse Clinical Reasoning for ${patientName}:\n\n` +
				`Current Recommendation: ${stateInfo.label} (Level ${triageOutput?.action_state?.level || 1})\n\n` +
				`Reasoning:\n${triageOutput?.reasoning || "No details"}\n\n` +
				`Assessments:\n` +
				assessments.map((item) => `• ${item.label}: ${item.value}`).join("\n");

			await Share.share({ message });
		} catch (error) {
			console.error("Failed to share clinical reasoning", error);
		}
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<Stack.Screen
				options={{
					title: "Clinical Reasoning",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
					headerLeft: () => (
						<Pressable onPress={() => router.back()} style={styles.headerIcon}>
							<ChevronLeft color={COLORS.textPrimary} size={28} />
						</Pressable>
					),
					headerRight: () => (
						<Pressable
							onPress={onShareReasoning}
							style={styles.headerIcon}
							accessibilityRole="button"
							accessibilityLabel="Share Clinical Reasoning"
						>
							<Share2 color={COLORS.primary} size={24} />
						</Pressable>
					),
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Status Summary */}
				<View
					style={[
						styles.statusBanner,
						{ backgroundColor: stateInfo.theme.surface },
					]}
				>
					<View
						style={[
							styles.statusDot,
							{ backgroundColor: stateInfo.theme.primary },
						]}
					/>
					<Text style={[styles.statusText, { color: stateInfo.theme.text }]}>
						{stateInfo.label} (Level {triageOutput?.action_state?.level || 1})
					</Text>
				</View>

				{/* Section 1: What we assessed */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Search size={20} color={COLORS.primary} />
						<Text style={styles.sectionTitle}>What we assessed</Text>
					</View>
					<Card variant="elevated" style={styles.contentCard}>
						{assessments.map((item, i) => (
							<View
								key={item.label}
								style={[styles.assessmentRow, i === 0 && styles.noBorder]}
							>
								<Text style={styles.assessmentLabel}>{item.label}</Text>
								<Text
									style={[
										styles.assessmentValue,
										item.status === "high" && styles.textUrgent,
									]}
								>
									{item.value}
								</Text>
							</View>
						))}
					</Card>
				</View>

				{/* Section 2: Why this recommendation */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Lightbulb size={20} color={COLORS.primary} />
						<Text style={styles.sectionTitle}>Why this recommendation</Text>
					</View>
					<Card variant="elevated" style={styles.contentCard}>
						<Text style={styles.reasoningText}>
							{triageOutput?.reasoning ||
								`Based on the assessment, ${patientName} should be monitored closely for any worsening symptoms.`}
						</Text>
					</Card>
				</View>

				{/* Section 3: Home Care Steps */}
				{triageOutput?.care_instructions &&
					triageOutput.care_instructions.length > 0 && (
						<View style={styles.section}>
							<View style={styles.sectionHeader}>
								<Home size={20} color={COLORS.primary} />
								<Text style={styles.sectionTitle}>Home Care Steps</Text>
							</View>
							<Card variant="elevated" style={styles.contentCard}>
								{triageOutput.care_instructions.map(
									(step: string, i: number) => (
										<View key={step} style={styles.listRow}>
											<View style={styles.listNumber}>
												<Text style={styles.listNumberText}>{i + 1}</Text>
											</View>
											<Text style={styles.listText}>{step}</Text>
										</View>
									),
								)}
							</Card>
						</View>
					)}

				{/* Section 4: When to seek higher care */}
				{triageOutput?.red_flags && triageOutput.red_flags.length > 0 && (
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<AlertTriangle size={20} color={COLORS.state.urgent.primary} />
							<Text
								style={[
									styles.sectionTitle,
									{ color: COLORS.state.urgent.primary },
								]}
							>
								When to seek higher care
							</Text>
						</View>
						<Card style={[styles.contentCard, styles.urgentCard]}>
							{triageOutput.red_flags.map((trigger: string) => (
								<View key={trigger} style={styles.triggerRow}>
									<View style={styles.triggerDot} />
									<Text style={styles.triggerText}>{trigger}</Text>
								</View>
							))}
						</Card>
					</View>
				)}

				<View style={styles.footer}>
					<Button
						title="Go Back"
						variant="outline"
						style={styles.printButton}
						onPress={() => router.back()}
					/>
					<Text style={styles.disclaimer}>
						This clinical reasoning is based on the information provided and
						standard triage protocols. Always trust your intuition and seek care
						if you are worried.
					</Text>
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
	headerIcon: {
		padding: 8,
	},
	scrollContent: {
		padding: SPACING.screenEdge,
		paddingBottom: 40,
	},
	statusBanner: {
		flexDirection: "row",
		alignItems: "center",
		padding: SPACING.md,
		borderRadius: RADIUS.lg,
		marginBottom: SPACING.sectionGap,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: SPACING.sm,
	},
	statusText: {
		fontSize: 14,
		fontWeight: "700",
		textTransform: "uppercase",
	},
	section: {
		marginBottom: SPACING.sectionGap,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.md,
		paddingLeft: SPACING.xs,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: COLORS.textPrimary,
		marginLeft: SPACING.sm,
	},
	contentCard: {
		padding: SPACING.lg,
	},
	noBorder: {
		borderTopWidth: 0,
	},
	assessmentRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: SPACING.md,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	assessmentLabel: {
		fontSize: 16,
		color: COLORS.textSecondary,
		fontWeight: "500",
	},
	assessmentValue: {
		fontSize: 16,
		color: COLORS.textPrimary,
		fontWeight: "700",
	},
	textUrgent: {
		color: COLORS.state.urgent.primary,
	},
	reasoningText: {
		fontSize: 16,
		lineHeight: 24,
		color: COLORS.textPrimary,
	},
	listRow: {
		flexDirection: "row",
		marginBottom: SPACING.lg,
	},
	listNumber: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: COLORS.state.monitor.surface,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.md,
		marginTop: 2,
	},
	listNumberText: {
		fontSize: 12,
		fontWeight: "800",
		color: COLORS.state.monitor.text,
	},
	listText: {
		flex: 1,
		fontSize: 16,
		lineHeight: 22,
		color: COLORS.textPrimary,
	},
	urgentCard: {
		backgroundColor: COLORS.state.urgent.surface,
		borderColor: "transparent",
	},
	triggerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.md,
	},
	triggerDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: COLORS.state.urgent.primary,
		marginRight: SPACING.md,
	},
	triggerText: {
		flex: 1,
		fontSize: 15,
		fontWeight: "600",
		color: COLORS.state.urgent.text,
	},
	footer: {
		marginTop: SPACING.md,
		alignItems: "center",
	},
	printButton: {
		width: "100%",
		marginBottom: SPACING.lg,
	},
	disclaimer: {
		fontSize: 13,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 18,
		fontStyle: "italic",
	},
});
