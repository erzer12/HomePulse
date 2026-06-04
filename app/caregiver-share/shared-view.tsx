import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TaskList } from "@/components/caregiver/TaskList";
import { ActionStateCard } from "@/components/triage/ActionStateCard";
import { Card } from "@/components/ui/Card";
import { COLORS, SPACING } from "@/constants/colors";
import { useState, useEffect } from "react";
import { getCaseSummary } from "@/services/supabase";
import type { CaseSummary } from "@/services/supabase";
import { buildActionState } from "@/engine";

export default function SharedViewScreen() {
	const insets = useSafeAreaInsets();
	const { token } = useLocalSearchParams();
	const [summary, setSummary] = useState<CaseSummary | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (token) {
			fetchSummary();
		}
	}, [token]);

	const fetchSummary = async () => {
		setLoading(true);
		try {
			const data = await getCaseSummary(token as string);
			setSummary(data);
		} catch (e) {
			console.error("Failed to fetch shared summary", e);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	if (!summary) {
		return (
			<View style={[styles.container, styles.center]}>
				<Text style={styles.errorText}>Shared case not found or link expired.</Text>
			</View>
		);
	}

	const updatedTime = new Date(summary.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: "Shared Monitoring View",
					headerStyle: { backgroundColor: COLORS.background },
					headerTitleStyle: { color: COLORS.textPrimary, fontWeight: "700" },
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Patient Summary Card */}
				<Card variant="elevated" style={styles.summaryCard}>
					<Text style={styles.summaryLabel}>Patient Summary View</Text>
					<Text style={styles.summaryTimestamp}>Last updated: {updatedTime}</Text>
				</Card>

				<View style={styles.section}>
					<ActionStateCard state={buildActionState(summary.state_level as 1 | 2 | 3 | 4)} />
				</View>

				{summary.tasks && summary.tasks.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Assigned Tasks</Text>
						<TaskList tasks={summary.tasks.map(t => ({ id: t.id, title: t.title, done: t.status === "done" }))} />
					</View>
				)}

				<View style={styles.footer}>
					<Text style={styles.disclaimer}>
						This is a shared view. All medical decisions remain with the primary
						caregiver.
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
	center: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	scrollContent: {
		padding: SPACING.screenEdge,
		paddingBottom: 40,
	},
	summaryCard: {
		marginBottom: SPACING.sectionGap,
	},
	summaryLabel: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.textPrimary,
		marginBottom: 4,
	},
	summaryTimestamp: {
		fontSize: 14,
		color: COLORS.textSecondary,
	},
	section: {
		marginBottom: SPACING.sectionGap,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: COLORS.textPrimary,
		marginBottom: SPACING.lg,
	},
	footer: {
		marginTop: SPACING.xl,
		paddingTop: SPACING.xl,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	disclaimer: {
		fontSize: 14,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 20,
	},
	errorText: {
		fontSize: 16,
		color: COLORS.textSecondary,
		textAlign: 'center',
		padding: SPACING.xl,
	},
});
