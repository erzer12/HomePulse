import { Stack, useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionStateCard } from "@/components/triage/ActionStateCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, SPACING } from "@/constants/colors";
import { buildActionState } from "@/engine";
import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";

export default function EscalationAlertScreen() {
	const router = useRouter();
	const activeCase = useCaseStore((s) => s.activeCase);
	const profiles = usePatientStore((s) => s.profiles);

	const [patientName, setPatientName] = useState("the person");

	useEffect(() => {
		if (activeCase && profiles.length > 0) {
			const patient = profiles.find((p) => p.id === activeCase.patient_id);
			if (patient) setPatientName(patient.name);
		}
	}, [activeCase, profiles]);

	const latestEntry = activeCase?.timeline?.[activeCase.timeline.length - 1];
	const previousEntry = activeCase?.timeline?.[activeCase.timeline.length - 2];

	const changes = [];
	if (latestEntry && previousEntry) {
		if (latestEntry.temperature_celsius !== previousEntry.temperature_celsius) {
			changes.push({
				label: "Temperature",
				from: previousEntry.temperature_celsius
					? `${previousEntry.temperature_celsius}°C`
					: "--",
				to: latestEntry.temperature_celsius
					? `${latestEntry.temperature_celsius}°C`
					: "--",
				icon: "🌡️",
			});
		}
		if (latestEntry.hydration_status !== previousEntry.hydration_status) {
			changes.push({
				label: "Hydration",
				from: previousEntry.hydration_status,
				to: latestEntry.hydration_status,
				icon: "💧",
			});
		}
		if (latestEntry.consciousness !== previousEntry.consciousness) {
			changes.push({
				label: "Consciousness",
				from: previousEntry.consciousness,
				to: latestEntry.consciousness,
				icon: "🧠",
			});
		}
	}

	const getActionState = () => {
		if (activeCase?.triage_output?.action_state) {
			return activeCase.triage_output.action_state;
		}
		const rawState = activeCase?.current_action_state;
		const level = typeof rawState === "object" ? rawState.level : rawState || 4;
		return buildActionState(level as 1 | 2 | 3 | 4);
	};

	const stateData = getActionState();

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
						{patientName}'s condition has changed significantly since the last
						check-in.
					</Text>
				</View>

				{changes.length > 0 && (
					<Card variant="elevated" style={styles.changesCard}>
						<Text style={styles.cardTitle}>Key Changes Detected</Text>
						{changes.map((change) => (
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
				)}

				<ActionStateCard state={stateData} />

				<View style={styles.actions}>
					<Button
						title="I understand — Seek care now"
						variant="urgent"
						onPress={() => router.replace("/(tabs)/home")}
					/>
					<Button
						title="View full clinical details"
						variant="outline"
						style={styles.secondaryAction}
						onPress={() => router.push("/result/explanation")}
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
