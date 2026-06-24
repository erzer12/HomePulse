import { Stack, useRouter, useFocusEffect } from "expo-router";
import { CheckCircle, Circle, ClipboardList, History, Plus, Users } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionStateCard } from "@/components/triage/ActionStateCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";
import { useTasksStore } from "@/store/tasks";
import type { ActionState } from "@/types/triage";

export default function HomeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	
	const activeCase = useCaseStore((s) => s.activeCase);
	const loadLatestActiveCase = useCaseStore((s) => s.loadLatestActiveCase);
	const profiles = usePatientStore((s) => s.profiles);
	const loadPatients = usePatientStore((s) => s.loadPatients);
	const tasks = useTasksStore((s) => s.tasks);
	const loadTasksForCase = useTasksStore((s) => s.loadTasksForCase);
	const markDone = useTasksStore((s) => s.markDone);
	const tasksLoading = useTasksStore((s) => s.loading);

	const [patientName, setPatientName] = useState<string>("Unknown");

	useFocusEffect(
		useCallback(() => {
			loadLatestActiveCase();
			loadPatients();
		}, [loadLatestActiveCase, loadPatients])
	);

	useFocusEffect(
		useCallback(() => {
			if (activeCase && profiles.length > 0) {
				const patient = profiles.find(p => p.id === activeCase.patient_id);
				if (patient) setPatientName(patient.name);
			}
		}, [activeCase, profiles])
	);

	useFocusEffect(
		useCallback(() => {
			if (activeCase) {
				loadTasksForCase(activeCase.id);
			}
		}, [activeCase, loadTasksForCase])
	);

	const caseTasks = activeCase ? (tasks[activeCase.id] || []) : [];

	// Use engine-provided action state if available
	const stateData = activeCase?.triage_output?.action_state || activeCase?.current_action_state;

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<Stack.Screen
				options={{
					title: "HomePulse",
					headerLargeTitle: true,
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
					headerShown: false,
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.welcomeSection}>
					<Text style={styles.welcomeTitle}>Welcome back</Text>
					<Text style={styles.welcomeSubtitle}>
						Monitoring your household's health.
					</Text>
				</View>

				{activeCase ? (
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Active Case</Text>
							<Pressable onPress={() => router.push("/(tabs)/history")}>
								<Text style={styles.seeAll}>See Journey</Text>
							</Pressable>
						</View>
						<Card variant="elevated" style={styles.activeCaseCard}>
							<View style={styles.patientRow}>
								<View style={styles.avatar}>
									<Text style={styles.avatarText}>
										{patientName[0]}
									</Text>
								</View>
								<Text style={styles.patientName}>{patientName}</Text>
							</View>
							{stateData ? (
								<ActionStateCard
									state={stateData as ActionState}
									showExplanation={true}
								/>
							) : (
								<Text style={styles.emptyText}>Case started, no evaluation yet.</Text>
							)}
						</Card>

						{/* Caregiver Task Checklist */}
						<View style={styles.taskSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Caregiver Tasks</Text>
								{tasksLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
							</View>
							{caseTasks.length === 0 ? (
								<Card style={styles.emptyTaskCard}>
									<Text style={styles.emptyText}>No tasks yet for this case.</Text>
								</Card>
							) : (
								caseTasks.map((task) => (
									<Pressable
										key={task.id}
										style={[
											styles.taskRow,
											task.status === "done" && styles.taskRowDone,
										]}
										onPress={() => {
											if (task.status !== "done") {
												markDone(task.id, activeCase.id);
											}
										}}
										accessibilityRole="checkbox"
										accessibilityState={{ checked: task.status === "done" }}
										accessibilityLabel={task.title}
									>
										{task.status === "done" ? (
											<CheckCircle
												size={22}
												color={COLORS.state.care.primary}
											/>
										) : (
											<Circle
												size={22}
												color={COLORS.textSecondary}
											/>
										)}
										<View style={styles.taskTextWrap}>
											<Text
												style={[
													styles.taskTitle,
													task.status === "done" && styles.taskTitleDone,
												]}
											>
												{task.title}
											</Text>
											{task.description ? (
												<Text style={styles.taskDesc}>{task.description}</Text>
											) : null}
										</View>
									</Pressable>
								))
							)}
						</View>
					</View>
				) : (
					<Card style={styles.emptyCaseCard}>
						<ClipboardList size={40} color={COLORS.textSecondary} />
						<Text style={styles.emptyText}>No active health cases.</Text>
						<Button
							title="Start New Check-in"
							onPress={() => router.push("/symptom-check/select-symptom")}
							style={styles.emptyButton}
						/>
					</Card>
				)}

				<View style={styles.quickActions}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>
					<View style={styles.actionGrid}>
						<Pressable
							style={styles.actionTile}
							onPress={() => router.push("/symptom-check/select-symptom")}
						>
							<View
								style={[
									styles.iconBox,
									{ backgroundColor: COLORS.state.monitor.surface },
								]}
							>
								<Plus color={COLORS.state.monitor.primary} />
							</View>
							<Text style={styles.actionLabel}>New Check</Text>
						</Pressable>

						<Pressable
							style={styles.actionTile}
							onPress={() => router.push("/caregiver-share/shared-view")}
						>
							<View
								style={[
									styles.iconBox,
									{ backgroundColor: COLORS.state.teleconsult.surface },
								]}
							>
								<Users color={COLORS.state.teleconsult.primary} />
							</View>
							<Text style={styles.actionLabel}>Share Care</Text>
						</Pressable>

						<Pressable
							style={styles.actionTile}
							onPress={() => router.push("/onboarding/create-profile")}
						>
							<View
								style={[
									styles.iconBox,
									{ backgroundColor: COLORS.state.care.surface },
								]}
							>
								<History color={COLORS.state.care.primary} />
							</View>
							<Text style={styles.actionLabel}>Add Profile</Text>
						</Pressable>
					</View>
				</View>

				{activeCase && (
					<Card style={styles.tipCard}>
						<Text style={styles.tipTitle}>Caregiver Tip</Text>
						<Text style={styles.tipText}>
							Keep {patientName} hydrated with frequent small sips of water or ORS.
						</Text>
					</Card>
				)}
			</ScrollView>
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
		paddingBottom: 100,
	},
	welcomeSection: {
		marginBottom: SPACING.sectionGap,
	},
	welcomeTitle: {
		fontSize: 32,
		fontWeight: "800",
		color: COLORS.textPrimary,
	},
	welcomeSubtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		marginTop: 4,
	},
	section: {
		marginBottom: SPACING.sectionGap,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SPACING.md,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
	seeAll: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.primary,
	},
	activeCaseCard: {
		padding: SPACING.md,
	},
	patientRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.md,
		paddingHorizontal: SPACING.sm,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.md,
	},
	avatarText: {
		color: "#FFFFFF",
		fontWeight: "700",
		fontSize: 18,
	},
	patientName: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
	emptyCaseCard: {
		alignItems: "center",
		padding: SPACING.xxxxl,
		marginBottom: SPACING.sectionGap,
	},
	emptyText: {
		fontSize: 16,
		color: COLORS.textSecondary,
		marginTop: SPACING.md,
		marginBottom: SPACING.lg,
	},
	emptyButton: {
		width: "auto",
		paddingHorizontal: SPACING.xl,
	},
	quickActions: {
		marginBottom: SPACING.sectionGap,
	},
	actionGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: SPACING.md,
	},
	actionTile: {
		width: "30%",
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		padding: SPACING.md,
		alignItems: "center",
		elevation: 2,
	},
	iconBox: {
		width: 48,
		height: 48,
		borderRadius: RADIUS.lg,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
	},
	actionLabel: {
		fontSize: 12,
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
	tipCard: {
		backgroundColor: COLORS.state.monitor.surface,
		borderColor: "transparent",
	},
	tipTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.state.monitor.text,
		textTransform: "uppercase",
		marginBottom: 4,
	},
	tipText: {
		fontSize: 16,
		color: COLORS.state.monitor.text,
		lineHeight: 22,
	},
	taskSection: {
		marginTop: SPACING.sectionGap,
	},
	emptyTaskCard: {
		alignItems: "center",
		paddingVertical: SPACING.lg,
	},
	taskRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.lg,
		padding: SPACING.md,
		marginBottom: SPACING.sm,
		gap: SPACING.sm,
	},
	taskRowDone: {
		opacity: 0.55,
	},
	taskTextWrap: {
		flex: 1,
	},
	taskTitle: {
		fontSize: 15,
		fontWeight: "600",
		color: COLORS.textPrimary,
	},
	taskTitleDone: {
		textDecorationLine: "line-through",
		color: COLORS.textSecondary,
	},
	taskDesc: {
		fontSize: 13,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
});
