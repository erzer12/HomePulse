import { Stack } from "expo-router";
import { Minus, TrendingDown, TrendingUp } from "lucide-react-native";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { MotionView } from "@/components/ui/MotionView";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { DURATION } from "@/constants/motion";

const MOCK_HISTORY = [
	{
		id: "1",
		timestamp: "Today, 10:30 AM",
		state: { level: 2, label: "Home Care", theme: COLORS.state.care },
		vitals: [
			{ label: "Temp", value: "39.2°C", trend: "up" },
			{ label: "Hydration", value: "Normal", trend: "stable" },
		],
		notes:
			"Fever has increased since morning. Administered Paracetamol. Child is slightly more lethargic.",
	},
	{
		id: "2",
		timestamp: "Today, 07:00 AM",
		state: { level: 1, label: "Monitor", theme: COLORS.state.monitor },
		vitals: [
			{ label: "Temp", value: "38.5°C", trend: "down" },
			{ label: "Hydration", value: "Good", trend: "stable" },
		],
		notes: "Morning check-up. Alert and drinking fluids well.",
	},
	{
		id: "3",
		timestamp: "Yesterday, 09:00 PM",
		state: { level: 2, label: "Home Care", theme: COLORS.state.care },
		vitals: [
			{ label: "Temp", value: "38.8°C", trend: "up" },
			{ label: "Hydration", value: "Normal", trend: "stable" },
		],
		notes: "Slight fever spike before bed. Resting quietly.",
	},
];

export default function HistoryScreen() {
	const insets = useSafeAreaInsets();

	const renderItem = ({
		item,
		index,
	}: {
		item: (typeof MOCK_HISTORY)[0];
		index: number;
	}) => (
		<MotionView delay={index * DURATION.stagger} style={styles.entryContainer}>
			{/* Vertical Timeline Line */}
			<View style={styles.timelineLineContainer}>
				<View
					style={[styles.timelineLine, index === 0 && styles.timelineLineTop]}
				/>
				<View
					style={[
						styles.timelineDot,
						{ backgroundColor: item.state.theme.primary },
					]}
				/>
			</View>

			<Card variant="elevated" style={styles.entryCard}>
				<View style={styles.entryHeader}>
					<Text style={styles.timestamp}>{item.timestamp}</Text>
					<View
						style={[
							styles.badge,
							{ backgroundColor: item.state.theme.surface },
						]}
					>
						<Text style={[styles.badgeText, { color: item.state.theme.text }]}>
							{item.state.label}
						</Text>
					</View>
				</View>

				<View style={styles.vitalsRow}>
					{item.vitals.map((vital) => (
						<View key={vital.label} style={styles.vitalItem}>
							<Text style={styles.vitalLabel}>{vital.label}</Text>
							<View style={styles.vitalValueContainer}>
								<Text style={styles.vitalValue}>{vital.value}</Text>
								{vital.trend === "up" && (
									<TrendingUp size={16} color={COLORS.state.urgent.primary} />
								)}
								{vital.trend === "down" && (
									<TrendingDown size={16} color={COLORS.state.monitor.primary} />
								)}
								{vital.trend === "stable" && (
									<Minus size={16} color={COLORS.textSecondary} />
								)}
							</View>
						</View>
					))}
				</View>

				{item.notes && (
					<Text style={styles.notes} numberOfLines={3}>
						{item.notes}
					</Text>
				)}
			</Card>
		</MotionView>
	);

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
				data={MOCK_HISTORY}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={() => (
					<MotionView>
						<Card style={styles.summaryCard}>
							<Text style={styles.summaryTitle}>Active Case Summary</Text>
							<Text style={styles.summaryDetail}>Started 2 days ago</Text>
							<View style={styles.summaryStateRow}>
								<Text style={styles.summaryStateLabel}>Current State:</Text>
								<Text
									style={[
										styles.summaryStateValue,
										{ color: COLORS.state.care.text },
									]}
								>
									Guided Home Care (Level 2)
								</Text>
							</View>
						</Card>
					</MotionView>
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
});
