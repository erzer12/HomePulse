import { useLocalSearchParams } from "expo-router";
import { ClipboardList, Clock, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { supabase, updateTaskStatus } from "@/services/supabase";

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
 * Secondary Caregiver Desk — read-only case view.
 * Fetches the shared case summary from Supabase using the deep-link token.
 * No write actions — display only.
 */
export default function SecondaryDeskScreen() {
	const { token } = useLocalSearchParams<{ token: string }>();
	const insets = useSafeAreaInsets();

	const [loading, setLoading] = useState(true);
	const [summary, setSummary] = useState<CaseSummary | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!token) return;
		(async () => {
			try {
				const { data, error: fetchErr } = await supabase
					.from("case_summaries")
					.select(
						"patient_name, triage_level, action_title, recheck_interval_minutes, tasks, summary_text, created_at",
					)
					.eq("token", token)
					.single();
				if (fetchErr || !data) {
					setError("Unable to load case data. The link may have expired.");
				} else {
					setSummary(data as CaseSummary);
				}
			} catch {
				setError("Network error. Please check your connection and try again.");
			} finally {
				setLoading(false);
			}
		})();
	}, [token]);

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
		return (
			<View style={[styles.center, { paddingTop: insets.top }]}>
				<Text style={styles.errorText}>{error ?? "Unknown error"}</Text>
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
				{/* Read-only banner */}
				<View style={styles.readOnlyBadge}>
					<Text style={styles.readOnlyText}>
						Read-only view · Shared {sharedAt}
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
