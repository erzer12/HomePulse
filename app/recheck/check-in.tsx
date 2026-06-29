import { Stack, useRouter } from "expo-router";
import { Activity, Droplet, Thermometer } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TriageProcessingOverlay } from "@/components/ui/TriageProcessingOverlay";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";
import type { SymptomEntry } from "@/types/triage";
import { createUuid } from "@/utils/ids";

export default function CheckInScreen() {
	const router = useRouter();
	const activeCase = useCaseStore((s) => s.activeCase);
	const profiles = usePatientStore((s) => s.profiles);
	const appendSymptomEntry = useCaseStore((s) => s.appendSymptomEntry);
	const evaluateCase = useCaseStore((s) => s.evaluateCase);

	const [patientName, setPatientName] = useState("the person");
	const [temp, setTemp] = useState("");
	const [hydration, setHydration] = useState("normal");
	const [alertness, setAlertness] = useState("alert");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (activeCase && profiles.length > 0) {
			const patient = profiles.find((p) => p.id === activeCase.patient_id);
			if (patient) setPatientName(patient.name);
		}
	}, [activeCase, profiles]);

	const handleAnalyze = async () => {
		if (!activeCase) return;

		setLoading(true);
		const previousLevel =
			typeof activeCase.current_action_state === "object"
				? activeCase.current_action_state.level
				: activeCase.current_action_state || 1;

		const latestEntry = activeCase.timeline?.[activeCase.timeline.length - 1];

		const entry: SymptomEntry = {
			id: createUuid(),
			case_id: activeCase.id,
			timestamp: Date.now(),
			category: latestEntry?.category || "general",
			duration_hours: latestEntry?.duration_hours || 0,
			temperature_celsius: temp ? Number.parseFloat(temp) : undefined,
			hydration_status: hydration as SymptomEntry["hydration_status"],
			consciousness: alertness as SymptomEntry["consciousness"],
			breathing_difficulty: !!latestEntry?.breathing_difficulty,
		};

		try {
			await appendSymptomEntry(entry);
			const output = await evaluateCase(activeCase.id);

			if (output.action_state.level === 4) {
				router.replace("/result/emergency");
			} else if (output.action_state.level > previousLevel) {
				router.push("/recheck/escalation-alert");
			} else {
				router.push("/recheck/stable-result");
			}
		} catch (e) {
			console.error("Failed to save recheck", e);
		} finally {
			setLoading(false);
		}
	};

	const latestEntry = activeCase?.timeline?.[activeCase.timeline.length - 1];

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					title: "Condition Recheck",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Text style={styles.title}>Update {patientName}'s Status</Text>
					<Text style={styles.subtitle}>
						Let's see if the symptoms have changed.
					</Text>
				</View>

				{latestEntry && (
					<Card variant="default" style={styles.previousVitalsCard}>
						<Text style={styles.previousVitalsTitle}>Previous Vitals</Text>
						<Text style={styles.previousVitalsText}>
							Recorded:{" "}
							{new Date(latestEntry.timestamp).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</Text>
						<View style={styles.vitalsGrid}>
							<View style={styles.vitalStat}>
								<Text style={styles.statLabel}>Temp</Text>
								<Text style={styles.statVal}>
									{latestEntry.temperature_celsius
										? `${latestEntry.temperature_celsius}°C`
										: "N/A"}
								</Text>
							</View>
							<View style={styles.vitalStat}>
								<Text style={styles.statLabel}>Hydration</Text>
								<Text style={styles.statVal}>
									{latestEntry.hydration_status.charAt(0).toUpperCase() +
										latestEntry.hydration_status.slice(1)}
								</Text>
							</View>
							<View style={styles.vitalStat}>
								<Text style={styles.statLabel}>Alertness</Text>
								<Text style={styles.statVal}>
									{latestEntry.consciousness.charAt(0).toUpperCase() +
										latestEntry.consciousness.slice(1)}
								</Text>
							</View>
						</View>
					</Card>
				)}

				<Card variant="elevated" style={styles.vitalCard}>
					<View style={styles.cardHeader}>
						<View
							style={[
								styles.iconBox,
								{ backgroundColor: COLORS.state.urgent.surface },
							]}
						>
							<Thermometer color={COLORS.state.urgent.primary} />
						</View>
						<Text style={styles.label}>Current Temperature</Text>
					</View>
					<View style={styles.inputRow}>
						<TextInput
							style={styles.tempInput}
							value={temp}
							onChangeText={setTemp}
							keyboardType="decimal-pad"
							placeholder="--"
						/>
						<Text style={styles.unit}>°C</Text>
					</View>
				</Card>

				<Card style={styles.choiceCard}>
					<View style={styles.cardHeader}>
						<View
							style={[
								styles.iconBox,
								{ backgroundColor: COLORS.state.monitor.surface },
							]}
						>
							<Droplet color={COLORS.state.monitor.primary} />
						</View>
						<Text style={styles.label}>Hydration Level</Text>
					</View>
					<View style={styles.optionGrid}>
						{[
							{ id: "normal", label: "Normal" },
							{ id: "reduced", label: "Reduced" },
							{ id: "poor", label: "Poor" },
						].map((opt) => (
							<Button
								key={opt.id}
								title={opt.label}
								variant={hydration === opt.id ? "primary" : "outline"}
								size="normal"
								onPress={() => setHydration(opt.id)}
								style={styles.optionButton}
								fullWidth={false}
							/>
						))}
					</View>
				</Card>

				<Card style={styles.choiceCard}>
					<View style={styles.cardHeader}>
						<View
							style={[
								styles.iconBox,
								{ backgroundColor: COLORS.state.teleconsult.surface },
							]}
						>
							<Activity color={COLORS.state.teleconsult.primary} />
						</View>
						<Text style={styles.label}>Alertness</Text>
					</View>
					<View style={styles.optionGrid}>
						{[
							{ id: "alert", label: "Alert" },
							{ id: "lethargic", label: "Sleepy" },
							{ id: "confused", label: "Confused" },
						].map((opt) => (
							<Button
								key={opt.id}
								title={opt.label}
								variant={alertness === opt.id ? "primary" : "outline"}
								size="normal"
								onPress={() => setAlertness(opt.id)}
								style={styles.optionButton}
								fullWidth={false}
							/>
						))}
					</View>
				</Card>

				<View style={styles.footer}>
					<Button
						title={loading ? "Analyzing..." : "Analyze Update"}
						onPress={handleAnalyze}
						disabled={loading}
					/>
				</View>
			</ScrollView>

			<TriageProcessingOverlay visible={loading} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	scrollContent: {
		padding: SPACING.screenEdge,
		paddingBottom: 40,
	},
	header: {
		marginBottom: SPACING.sectionGap,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.textPrimary,
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		marginTop: 4,
	},
	vitalCard: {
		padding: SPACING.xl,
		marginBottom: SPACING.lg,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	iconBox: {
		width: 40,
		height: 40,
		borderRadius: RADIUS.lg,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.md,
	},
	label: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.background,
		padding: SPACING.xl,
		borderRadius: RADIUS.xl,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	tempInput: {
		fontSize: 48,
		fontWeight: "800",
		color: COLORS.textPrimary,
		textAlign: "center",
		minWidth: 100,
	},
	unit: {
		fontSize: 24,
		fontWeight: "600",
		color: COLORS.textSecondary,
		marginLeft: 8,
		marginTop: 12,
	},
	choiceCard: {
		marginBottom: SPACING.lg,
	},
	optionGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	optionButton: {
		flex: 1,
		minWidth: "30%",
		height: 48,
	},
	footer: {
		marginTop: SPACING.xl,
	},
	previousVitalsCard: {
		marginBottom: SPACING.lg,
		backgroundColor: COLORS.surfaceElevated,
		borderColor: COLORS.border,
		padding: SPACING.lg,
	},
	previousVitalsTitle: {
		fontSize: 15,
		fontWeight: "800",
		color: COLORS.textPrimary,
		marginBottom: 2,
	},
	previousVitalsText: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginBottom: SPACING.md,
	},
	vitalsGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: COLORS.background,
		borderRadius: RADIUS.md,
		padding: SPACING.md,
	},
	vitalStat: {
		alignItems: "center",
		flex: 1,
	},
	statLabel: {
		fontSize: 11,
		color: COLORS.textSecondary,
		fontWeight: "600",
		textTransform: "uppercase",
		marginBottom: 2,
	},
	statVal: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
});
