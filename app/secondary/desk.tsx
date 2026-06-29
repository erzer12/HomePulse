import { useLocalSearchParams } from "expo-router";
import { ClipboardList, Clock, User } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { supabase, updateTaskStatus } from "@/services/supabase";
import { validateToken } from "@/services/token";

type CaseSummary = {
	patient_name: string;
	triage_level: number;
	action_title: string;
	recheck_interval_minutes: number;
	tasks: { id: string; title: string; status: string }[];
	summary_text: string;
	created_at: number;
};

/**
 * Secondary Caregiver Desk — shared case view.
 * Fetches the shared case summary from Supabase using the deep-link token.
 * Secondary caregivers can toggle caregiver task status (done ↔ pending).
 * The token is validated on every load, making the route self-defending against
 * direct deep-link access with an expired or revoked token.
 */
export default function SecondaryDeskScreen() {
	const { token } = useLocalSearchParams<{ token: string }>();
	const insets = useSafeAreaInsets();

	const [loading, setLoading] = useState(true);
	const [summary, setSummary] = useState<CaseSummary | null>(null);
	const [error, setError] = useState<string | null>(null);

	const loadData = useCallback(async () => {
		if (!token) return;
		setLoading(true);
		setError(null);
		try {
			// Validate the token before fetching any case data.
			// This makes the desk screen self-defending: even if the user
			// navigates directly to this route (bypassing secondary/index),
			// a revoked or expired token is rejected here.
			const status = await validateToken(token);
			if (status === "expired") {
				setError(
					"This link has expired. Ask the primary caregiver to share a new one.",
				);
				return;
			}
			if (status === "network_error") {
				setError(
					"Connection error. Please check your internet connection and try again.",
				);
				return;
			}
			if (status !== "valid") {
				setError(
					"This link is no longer valid. The case may have been closed.",
				);
				return;
			}

			const { data: summaryData, error: fetchErr } = await supabase
				.from("case_summaries")
				.select(
					"patient_name, triage_level, action_title, recheck_interval_minutes, tasks, summary_text, created_at",
				)
				.eq("token", token)
				.single();
			if (fetchErr || !summaryData) {
				setError("Unable to load case data. The link may have expired.");
			} else {
				// Merge task statuses from the tasks table to avoid reverting on reload
				const rawTasks = (summaryData.tasks as CaseSummary["tasks"]) || [];
				if (rawTasks.length > 0) {
					const taskIds = rawTasks.map((t) => t.id).filter(Boolean);
					if (taskIds.length > 0) {
						const { data: tasksData, error: tasksErr } = await supabase
							.from("tasks")
							.select("id, status")
							.in("id", taskIds);
						if (!tasksErr && tasksData) {
							const statusMap = new Map(tasksData.map((t) => [t.id, t.status]));
							summaryData.tasks = rawTasks.map((t) => ({
								...t,
								status: statusMap.get(t.id) ?? t.status,
							}));
						}
					}
				}
				setSummary(summaryData as CaseSummary);
			}
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleToggleTask = async (taskId: string, currentStatus: string) => {
		if (!summary) return;
		const nextStatus = currentStatus === "done" ? "pending" : "done";

		// Optimistically update local state
		setSummary((prev) => {
			if (!prev) return null;
			return {
				...prev,
				tasks: prev.tasks.map((t) =>
					t.id === taskId ? { ...t, status: nextStatus } : t,
				),
			};
		});

		try {
			await updateTaskStatus(taskId, nextStatus, Date.now());
		} catch (err) {
			console.error(
				"Failed to update task status from secondary caregiver",
				err,
			);
			// Rollback on failure
			setSummary((prev) => {
				if (!prev) return null;
				return {
					...prev,
					tasks: prev.tasks.map((t) =>
						t.id === taskId ? { ...t, status: currentStatus } : t,
					),
				};
			});
		}
	};

	if (loading) {
		return (
			<View style={[styles.center, { paddingTop: insets.top }]}>
				<ActivityIndicator size="large" color={COLORS.primary} />
				<Text style={styles.loadingText}>Loading shared case…</Text>
			</View>
		);
	}

	if (error || !summary) {
		const isNetwork =
			error?.toLowerCase().includes("connection") ||
			error?.toLowerCase().includes("network");
		return (
			<View
				style={[
					styles.center,
					{ paddingTop: insets.top, paddingHorizontal: SPACING.screenEdge },
				]}
			>
				<Text
					style={[
						styles.errorText,
						{ marginBottom: SPACING.lg, textAlign: "center" },
					]}
				>
					{error ?? "Unknown error"}
				</Text>
				{isNetwork && (
					<Button
						title="Retry Connection"
						onPress={loadData}
						style={{ width: "80%" }}
					/>
				)}
			</View>
		);
	}

	const sharedAt = new Date(summary.created_at).toLocaleString();

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingBottom: insets.bottom + SPACING.xxl },
				]}
			>
				{/* Shared view banner — secondary caregivers can toggle task status */}
				<View style={styles.readOnlyBadge}>
					<Text style={styles.readOnlyText}>
						Shared view · Shared {sharedAt}
					</Text>
				</View>

				{/* Patient header */}
				<View style={styles.patientCard}>
					<View style={styles.avatar}>
						<User size={24} color={COLORS.primary} />
					</View>
					<View>
						<Text style={styles.patientName}>{summary.patient_name}</Text>
						<Text style={styles.levelText}>
							Level {summary.triage_level} — {summary.action_title}
						</Text>
					</View>
				</View>

				{/* Summary */}
				{summary.summary_text ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Summary</Text>
						<View style={styles.textCard}>
							<Text style={styles.summaryText}>{summary.summary_text}</Text>
						</View>
					</View>
				) : null}

				{/* Recheck info */}
				<View style={styles.recheckCard}>
					<Clock size={18} color={COLORS.textSecondary} />
					<Text style={styles.recheckText}>
						Recheck every {summary.recheck_interval_minutes} minutes
					</Text>
				</View>

				{/* Tasks */}
				{summary.tasks?.length > 0 && (
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<ClipboardList size={16} color={COLORS.textSecondary} />
							<Text style={styles.sectionTitle}>Tasks</Text>
						</View>
						{summary.tasks.map((task) => (
							<Pressable
								key={task.id || task.title}
								onPress={() =>
									task.id && handleToggleTask(task.id, task.status)
								}
								style={styles.taskRow}
								accessibilityRole="checkbox"
								accessibilityState={{ checked: task.status === "done" }}
								accessibilityLabel={`Mark task ${task.title} as ${task.status === "done" ? "pending" : "done"}`}
							>
								<View
									style={[
										styles.taskDot,
										task.status === "done" && styles.taskDotDone,
									]}
								/>
								<Text
									style={[
										styles.taskText,
										task.status === "done" && styles.taskTextDone,
									]}
								>
									{task.title}
								</Text>
							</Pressable>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	center: {
		flex: 1,
		backgroundColor: COLORS.background,
		justifyContent: "center",
		alignItems: "center",
		padding: SPACING.screenEdge,
		gap: SPACING.lg,
	},
	loadingText: { fontSize: 14, color: COLORS.textSecondary },
	errorText: {
		fontSize: 15,
		color: COLORS.state.urgent.text,
		textAlign: "center",
		lineHeight: 22,
	},
	scroll: { padding: SPACING.screenEdge },
	readOnlyBadge: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.lg,
		padding: SPACING.md,
		alignItems: "center",
		marginBottom: SPACING.xl,
	},
	readOnlyText: {
		fontSize: 12,
		color: COLORS.textSecondary,
		fontWeight: "600",
	},
	patientCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.lg,
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xxl,
		padding: SPACING.xl,
		marginBottom: SPACING.xl,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	avatar: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: COLORS.state.monitor.surface,
		justifyContent: "center",
		alignItems: "center",
	},
	patientName: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
	levelText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
	section: { marginBottom: SPACING.xl },
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: SPACING.md,
	},
	sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
	textCard: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		padding: SPACING.xl,
	},
	summaryText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
	recheckCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.lg,
		padding: SPACING.lg,
		marginBottom: SPACING.xl,
	},
	recheckText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
	taskRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		paddingVertical: SPACING.sm,
	},
	taskDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.primary,
	},
	taskDotDone: { backgroundColor: COLORS.border },
	taskText: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
	taskTextDone: {
		color: COLORS.textSecondary,
		textDecorationLine: "line-through",
	},
});
