import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { MotionView } from "@/components/ui/MotionView";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { DURATION } from "@/constants/motion";
import { buildActionState } from "@/engine";
import { useCaseStore } from "@/store/case";
import type { ActionState, SymptomEntry, TriageOutput } from "@/types/triage";
import { safeParseJson } from "@/utils/json";

export default function HistoryScreen() {
	const insets = useSafeAreaInsets();
	const activeCase = useCaseStore((s) => s.activeCase);
	const loadLatestActiveCase = useCaseStore((s) => s.loadLatestActiveCase);
	const [entries, setEntries] = useState<SymptomEntry[]>([]);

	useFocusEffect(
		useCallback(() => {
			loadLatestActiveCase();
			(async () => {
				try {
					const { getDb } = require("@/db/connection");
					const db = await getDb();
					const rows = await db.getAllAsync(
						"SELECT * FROM symptom_entries ORDER BY timestamp ASC",
					);
					setEntries(rows as SymptomEntry[]);
				} catch (err) {
					console.error("Failed to load symptom history", err);
				}
			})();
		}, [loadLatestActiveCase]),
	);

	const getActionStateTheme = (level: number) => {
		switch (level) {
			case 4:
				return COLORS.state.urgent;
			case 3:
				return COLORS.state.teleconsult;
			case 2:
				return COLORS.state.care;
			default:
				return COLORS.state.monitor;
		}
	};

	const formatTimestamp = (ts: number) => {
		const date = new Date(ts);
		return date.toLocaleString([], {
			weekday: "short",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const renderItem = ({
		item,
		index,
	}: {
		item: SymptomEntry;
		index: number;
	}) => {
		const triage = safeParseJson<TriageOutput | null>(item.triage_output, null);
		const stateData: ActionState = triage?.action_state || buildActionState(1);
		const theme = getActionStateTheme(stateData.level);

		return (
			<MotionView
				delay={index * DURATION.stagger}
				style={styles.entryContainer}
			>
				<View style={styles.timelineLineContainer}>
					<View
						style={[styles.timelineLine, index === 0 && styles.timelineLineTop]}
					/>
					<View
						style={[styles.timelineDot, { backgroundColor: theme.primary }]}
					/>
				</View>

				<Card variant="elevated" style={styles.entryCard}>
					<View style={styles.entryHeader}>
						<Text style={styles.timestamp}>
							{formatTimestamp(item.timestamp)}
						</Text>
						<View style={[styles.badge, { backgroundColor: theme.surface }]}>
							<Text style={[styles.badgeText, { color: theme.text }]}>
								{stateData.label}
							</Text>
						</View>
					</View>

					<View style={styles.vitalsRow}>
						<View style={styles.vitalItem}>
							<Text style={styles.vitalLabel}>Temp</Text>
							<View style={styles.vitalValueContainer}>
								<Text style={styles.vitalValue}>
									{item.temperature_celsius
										? `${item.temperature_celsius}°C`
										: "N/A"}
								</Text>
							</View>
						</View>
						<View style={styles.vitalItem}>
							<Text style={styles.vitalLabel}>Symptom</Text>
							<View style={styles.vitalValueContainer}>
								<Text style={styles.vitalValue}>
									{item.category.charAt(0).toUpperCase() +
										item.category.slice(1)}
								</Text>
							</View>
						</View>
					</View>

					{triage?.reasoning && (
						<Text style={styles.notes} numberOfLines={3}>
							{triage.reasoning}
						</Text>
					)}
				</Card>
			</MotionView>
		);
	};

	const timeline = entries;
	const currentActionState = activeCase?.current_action_state;

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<Stack.Screen
				options={{
					title: "History",
					headerLargeTitle: true,
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
					headerShown: false,
				}}
			/>

			<FlatList
				data={[...timeline].reverse()} // Show latest first
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={() => (
					<MotionView>
						<Card style={styles.summaryCard}>
							<Text style={styles.summaryTitle}>Active Case Summary</Text>
							<Text style={styles.summaryDetail}>
								{activeCase ? `Ongoing Journey` : "No active case"}
							</Text>
							{activeCase && currentActionState && (
								<View style={styles.summaryStateRow}>
									<Text style={styles.summaryStateLabel}>Status:</Text>
									<Text
										style={[
											styles.summaryStateValue,
											{ color: COLORS.state.care.text },
										]}
									>
										{currentActionState.label}
									</Text>
								</View>
							)}
						</Card>
					</MotionView>
				)}
				ListEmptyComponent={() => (
					<View style={styles.emptyState}>
						<Text style={styles.emptyText}>
							No history entries recorded yet.
						</Text>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	listContent: {
		padding: SPACING.screenEdge,
		paddingBottom: 100,
	},
	summaryCard: {
		backgroundColor: COLORS.state.care.surface,
		borderColor: "transparent",
		marginBottom: SPACING.sectionGap,
	},
	summaryTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textSecondary,
		textTransform: "uppercase",
		marginBottom: 4,
	},
	summaryDetail: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.textPrimary,
		marginBottom: 8,
	},
	summaryStateRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	summaryStateLabel: {
		fontSize: 14,
		color: COLORS.textSecondary,
		marginRight: 4,
	},
	summaryStateValue: {
		fontSize: 14,
		fontWeight: "700",
	},
	entryContainer: {
		flexDirection: "row",
	},
	timelineLineContainer: {
		width: 32,
		alignItems: "center",
	},
	timelineLine: {
		position: "absolute",
		width: 2,
		height: "100%",
		backgroundColor: COLORS.border,
	},
	timelineLineTop: {
		top: 24,
	},
	timelineDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginTop: 24,
		zIndex: 1,
		borderWidth: 2,
		borderColor: COLORS.background,
	},
	entryCard: {
		flex: 1,
		marginBottom: SPACING.lg,
		marginLeft: SPACING.sm,
	},
	entryHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SPACING.md,
	},
	timestamp: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.textSecondary,
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: RADIUS.full,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: "700",
	},
	vitalsRow: {
		flexDirection: "row",
		marginBottom: SPACING.md,
		backgroundColor: COLORS.background,
		padding: SPACING.md,
		borderRadius: RADIUS.lg,
	},
	vitalItem: {
		marginRight: SPACING.xl,
	},
	vitalLabel: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginBottom: 2,
	},
	vitalValueContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	vitalValue: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textPrimary,
		marginRight: 4,
	},
	notes: {
		fontSize: 14,
		lineHeight: 20,
		color: COLORS.textPrimary,
		fontStyle: "italic",
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: SPACING.xxxxl,
	},
	emptyText: {
		color: COLORS.textSecondary,
		fontSize: 16,
	},
});
