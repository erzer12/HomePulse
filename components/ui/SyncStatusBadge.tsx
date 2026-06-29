import { AlertTriangle, CloudOff } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useSyncStore } from "@/store/sync";

interface SyncStatusBadgeProps {
	/** Called when the user taps the badge to get more context. */
	onPress?: () => void;
}

/**
 * Shown on the Home screen (State B) when the sync queue has items that have
 * permanently failed (retry_count >= max_retries).
 * Renders nothing when there are no failures.
 */
export function SyncStatusBadge({ onPress }: SyncStatusBadgeProps) {
	const { pendingCount, isSyncing, error } = useSyncStore();

	// Only surface badge if there's a reported error OR items are stuck in the
	// queue and NOT currently being flushed. Suppresses false-positive warnings
	// during a normal in-progress background sync.
	if (!error && (pendingCount === 0 || isSyncing)) return null;

	return (
		<Pressable
			style={styles.badge}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel="Sync issue — some updates may not have reached other caregivers"
		>
			<View style={styles.iconWrap}>
				{error ? (
					<AlertTriangle size={16} color={COLORS.state.teleconsult.text} />
				) : (
					<CloudOff size={16} color={COLORS.state.teleconsult.text} />
				)}
			</View>
			<Text style={styles.text}>
				Sync issue — some updates may not have reached other caregivers
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	badge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.state.teleconsult.surface,
		borderRadius: RADIUS.lg,
		padding: SPACING.md,
		gap: SPACING.sm,
		marginBottom: SPACING.lg,
	},
	iconWrap: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: `${COLORS.state.teleconsult.primary}20`,
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		flex: 1,
		fontSize: 13,
		color: COLORS.state.teleconsult.text,
		fontWeight: "600",
		lineHeight: 18,
	},
});
