import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import {
	AlertTriangle,
	CheckCircle,
	Circle,
	ClipboardList,
	History,
	Plus,
	Users,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActiveCaseBanner } from "@/components/caregiver/ActiveCaseBanner";
import { ActionStateCard } from "@/components/triage/ActionStateCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SyncStatusBadge } from "@/components/ui/SyncStatusBadge";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { buildActionState } from "@/engine";
import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";
import { useSyncStore } from "@/store/sync";
import { useTasksStore } from "@/store/tasks";
import type { ActionState, ActionStateLevel } from "@/types/triage";

export default function HomeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const activeCase = useCaseStore((s) => s.activeCase);
	const activeCases = useCaseStore((s) => s.activeCases);
	const loadLatestActiveCase = useCaseStore((s) => s.loadLatestActiveCase);
	const loadActiveCases = useCaseStore((s) => s.loadActiveCases);
	const selectActiveCase = useCaseStore((s) => s.selectActiveCase);
	const closeCase = useCaseStore((s) => s.closeCase);

	const profiles = usePatientStore((s) => s.profiles);
	const loadPatients = usePatientStore((s) => s.loadPatients);

	const tasks = useTasksStore((s) => s.tasks);
	const loadTasksForCase = useTasksStore((s) => s.loadTasksForCase);
	const markDone = useTasksStore((s) => s.markDone);
	const createTask = useTasksStore((s) => s.createTask);
	const tasksLoading = useTasksStore((s) => s.loading);

	const [patientName, setPatientName] = useState<string>("Unknown");
	const [baselineSkipped, setBaselineSkipped] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [resolveDialogVisible, setResolveDialogVisible] = useState(false);
	const [simpleResolveVisible, setSimpleResolveVisible] = useState(false);
	const [caseClosedModalVisible, setCaseClosedModalVisible] = useState(false);
	const [resolvedPatientName, setResolvedPatientName] = useState("");

	useFocusEffect(
		useCallback(() => {
			if (!useCaseStore.getState().activeCase) {
				loadLatestActiveCase();
			}
			loadActiveCases();
			loadPatients();
			AsyncStorage.getItem("household_skipped").then((val) => {
				setBaselineSkipped(val === "1");
			});
		}, [loadLatestActiveCase, loadActiveCases, loadPatients]),
	);

	useFocusEffect(
		useCallback(() => {
			if (activeCase && profiles.length > 0) {
				const patient = profiles.find((p) => p.id === activeCase.patient_id);
				if (patient) setPatientName(patient.name);
			}
		}, [activeCase, profiles]),
	);

	useFocusEffect(
		useCallback(() => {
			if (activeCase) {
				loadTasksForCase(activeCase.id);
			}
		}, [activeCase, loadTasksForCase]),
	);

	const caseTasks = activeCase ? tasks[activeCase.id] || [] : [];

	// Use engine-provided action state if available
	const getActionState = (): ActionState | null => {
		if (activeCase?.triage_output?.action_state) {
			return activeCase.triage_output.action_state;
		}
		if (activeCase?.current_action_state != null) {
			const state = activeCase.current_action_state;
			const level = (
				typeof state === "object" ? state.level : state
			) as ActionStateLevel;
			return buildActionState(level);
		}
		return null;
	};

	const stateData = getActionState();

	const handleAddTask = async () => {
		if (!activeCase || !newTaskTitle.trim()) return;
		try {
			await createTask(activeCase.id, newTaskTitle.trim(), "");
			setNewTaskTitle("");
		} catch (e) {
			console.error("Failed to add task", e);
		}
	};

	const handleResolveCase = async () => {
		if (!activeCase) return;
		const count = await useSyncStore
			.getState()
			.checkPendingForCase(activeCase.id);
		if (count > 0) {
			setResolveDialogVisible(true);
		} else {
			setSimpleResolveVisible(true);
		}
	};

	const executeResolve = async () => {
		if (!activeCase) return;
		const name = patientName;
		try {
			await closeCase(activeCase.id);
			setResolveDialogVisible(false);
			setSimpleResolveVisible(false);
			setResolvedPatientName(name);
			setCaseClosedModalVisible(true);
		} catch (e) {
			console.error("Failed to resolve case", e);
			Alert.alert(
				"Resolution Failed",
				"Unable to resolve and close this case. Please try again.",
			);
		}
	};

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
				{/* Top Level Warnings */}
				<SyncStatusBadge onPress={() => router.push("/(tabs)/settings")} />

				{baselineSkipped && (
					<Card variant="default" style={styles.skippedWarningCard}>
						<View style={styles.warningHeader}>
							<AlertTriangle size={18} color={COLORS.state.care.text} />
							<Text style={styles.warningTitle}>
								Household resources setup skipped
							</Text>
						</View>
						<Text style={styles.warningDesc}>
							Care recommendations may not be tailored to your resources.
							Complete the setup for optimal care.
						</Text>
						<Pressable
							onPress={() => router.push("/(tabs)/settings")}
							style={styles.warningCta}
						>
							<Text style={styles.warningCtaText}>Complete Setup</Text>
						</Pressable>
					</Card>
				)}

				<View style={styles.welcomeSection}>
					<Text style={styles.welcomeTitle}>Welcome back</Text>
					<Text style={styles.welcomeSubtitle}>
						Monitoring your household's health.
					</Text>
				</View>

				{/* Multi-Active Case Selector */}
				{activeCases.length > 1 && (
					<View style={styles.selectorContainer}>
						<Text style={styles.selectorLabel}>Switch Patient Case:</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.selectorScroll}
						>
							{activeCases.map((c) => {
								const patient = profiles.find((p) => p.id === c.patient_id);
								const isSelected = c.id === activeCase?.id;
								return (
									<Pressable
										key={c.id}
										onPress={() => selectActiveCase(c.id)}
										style={[
											styles.selectorPill,
											isSelected && styles.selectorPillActive,
										]}
									>
										<Text
											style={[
												styles.selectorPillText,
												isSelected && styles.selectorPillTextActive,
											]}
										>
											{patient?.name || "Unknown"}
										</Text>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				)}

				{activeCase ? (
					<View style={styles.section}>
						{stateData && (
							<ActiveCaseBanner
								state={stateData as ActionState}
								patientName={patientName}
								recheckLabel={
									stateData.level === 4
										? "Immediate action required"
										: `Recheck timer: ${stateData.recheckIntervalMinutes} mins`
								}
								onPress={() => router.push("/(tabs)/history")}
							/>
						)}

						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Active Case Summary</Text>
							<Pressable onPress={() => router.push("/(tabs)/history")}>
								<Text style={styles.seeAll}>See Journey</Text>
							</Pressable>
						</View>
						<Card variant="elevated" style={styles.activeCaseCard}>
							<View style={styles.patientRow}>
								<View style={styles.avatar}>
									<Text style={styles.avatarText}>{patientName[0]}</Text>
								</View>
								<Text style={styles.patientName}>{patientName}</Text>
							</View>
							{stateData ? (
								<ActionStateCard
									state={stateData as ActionState}
									showExplanation={true}
								/>
							) : (
								<Text style={styles.emptyText}>
									Case started, no evaluation yet.
								</Text>
							)}
						</Card>

						{/* Caregiver Task Checklist */}
						<View style={styles.taskSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Caregiver Tasks</Text>
								{tasksLoading && (
									<ActivityIndicator size="small" color={COLORS.primary} />
								)}
							</View>

							{/* Add Custom Task Input */}
							<View style={styles.addTaskRow}>
								<TextInput
									value={newTaskTitle}
									onChangeText={setNewTaskTitle}
									placeholder="Add custom care task..."
									placeholderTextColor={COLORS.textSecondary}
									style={styles.taskInput}
								/>
								<Pressable
									onPress={handleAddTask}
									disabled={!newTaskTitle.trim()}
									style={[
										styles.addTaskBtn,
										!newTaskTitle.trim() && styles.addTaskBtnDisabled,
									]}
								>
									<Plus size={20} color="#FFFFFF" />
								</Pressable>
							</View>

							{caseTasks.length === 0 ? (
								<Card style={styles.emptyTaskCard}>
									<Text style={styles.emptyText}>
										No tasks yet for this case.
									</Text>
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
											<Circle size={22} color={COLORS.textSecondary} />
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

						<Button
							title="Resolve & Close Case"
							variant="outline"
							onPress={handleResolveCase}
							style={styles.closeCaseBtn}
						/>
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
							onPress={() => router.push("/caregiver-share/manage-shares")}
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
							Keep {patientName} hydrated with frequent small sips of water or
							ORS.
						</Text>
					</Card>
				)}
			</ScrollView>

			{/* Force Resolve Confirmation Dialog */}
			<ConfirmDialog
				visible={resolveDialogVisible}
				title="Pending Sync Operations"
				message="Some offline updates haven't synced to other caregivers. If you close the case now, other caregivers might see outdated status. Do you want to force resolve?"
				confirmLabel="Force Resolve"
				cancelLabel="Cancel"
				destructive
				onConfirm={executeResolve}
				onCancel={() => setResolveDialogVisible(false)}
			/>

			{/* Simple Resolve Confirmation Dialog */}
			<ConfirmDialog
				visible={simpleResolveVisible}
				title="Resolve Case?"
				message={`Are you sure you want to close this case for ${patientName}? All pending recheck alerts will be cancelled.`}
				confirmLabel="Resolve"
				cancelLabel="Cancel"
				onConfirm={executeResolve}
				onCancel={() => setSimpleResolveVisible(false)}
			/>

			{/* Case Closed Success Summary Dialog */}
			<ConfirmDialog
				visible={caseClosedModalVisible}
				title="Case Resolved Successfully"
				message={`${resolvedPatientName}'s care journey has ended. The full diagnostic history, symptom updates, and vitals have been successfully archived to the History tab.`}
				confirmLabel="View History"
				cancelLabel="Done"
				onConfirm={() => {
					setCaseClosedModalVisible(false);
					loadActiveCases();
					router.push("/(tabs)/history");
				}}
				onCancel={() => {
					setCaseClosedModalVisible(false);
					loadActiveCases();
				}}
			/>
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
		marginBottom: SPACING.lg,
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
	skippedWarningCard: {
		backgroundColor: COLORS.state.care.surface,
		borderColor: "transparent",
		marginBottom: SPACING.lg,
		padding: SPACING.lg,
	},
	warningHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		marginBottom: SPACING.xs,
	},
	warningTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.state.care.text,
	},
	warningDesc: {
		fontSize: 13,
		color: COLORS.state.care.text,
		lineHeight: 18,
		opacity: 0.9,
		marginBottom: SPACING.md,
	},
	warningCta: {
		alignSelf: "flex-start",
		backgroundColor: COLORS.state.care.primary,
		paddingHorizontal: SPACING.md,
		paddingVertical: 6,
		borderRadius: RADIUS.md,
	},
	warningCtaText: {
		color: "#FFFFFF",
		fontWeight: "700",
		fontSize: 13,
	},
	selectorContainer: {
		marginBottom: SPACING.lg,
	},
	selectorLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.textSecondary,
		marginBottom: SPACING.sm,
	},
	selectorScroll: {
		gap: SPACING.sm,
	},
	selectorPill: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.full,
		paddingHorizontal: SPACING.lg,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	selectorPillActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	selectorPillText: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.textPrimary,
	},
	selectorPillTextActive: {
		color: "#FFFFFF",
	},
	addTaskRow: {
		flexDirection: "row",
		gap: SPACING.sm,
		marginBottom: SPACING.md,
	},
	taskInput: {
		flex: 1,
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.lg,
		paddingHorizontal: SPACING.lg,
		fontSize: 14,
		color: COLORS.textPrimary,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	addTaskBtn: {
		backgroundColor: COLORS.primary,
		width: 48,
		height: 48,
		borderRadius: RADIUS.lg,
		justifyContent: "center",
		alignItems: "center",
	},
	addTaskBtnDisabled: {
		backgroundColor: COLORS.disabledBG,
	},
	closeCaseBtn: {
		marginTop: SPACING.md,
		height: 50,
	},
});
