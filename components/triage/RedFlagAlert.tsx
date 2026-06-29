import { AlertTriangle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";

interface RedFlagAlertProps {
	message: string;
	/** If provided, renders a tappable CTA (e.g. "Call 112") */
	actionLabel?: string;
	onAction?: () => void;
}

/**
 * Inline escalation warning shown during recheck or result screens.
 * Used when a specific clinical red-flag is triggered but we're not yet
 * routing to the full emergency screen.
 */
export function RedFlagAlert({
	message,
	actionLabel,
	onAction,
}: RedFlagAlertProps) {
	return (
		<View style={styles.container}>
			<View style={styles.iconWrap}>
				<AlertTriangle size={20} color="#FFFFFF" />
			</View>
			<View style={styles.content}>
				<Text style={styles.message}>{message}</Text>
				{actionLabel && onAction && (
					<Pressable onPress={onAction} accessibilityRole="button">
						<Text style={styles.action}>{actionLabel}</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		backgroundColor: COLORS.criticalRed,
		borderRadius: RADIUS.lg,
		padding: SPACING.lg,
		gap: SPACING.md,
	},
	iconWrap: {
		marginTop: 2,
	},
	content: {
		flex: 1,
	},
	message: {
		fontSize: 14,
		color: "#FFFFFF",
		fontWeight: "700",
		lineHeight: 20,
	},
	action: {
		marginTop: 6,
		fontSize: 13,
		fontWeight: "800",
		color: "#FFFFFF",
		textDecorationLine: "underline",
	},
});
