import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import type { ActionState } from "@/types/triage";

const LEVEL_COLORS: Record<
	number,
	{ bg: string; text: string; label: string }
> = {
	1: {
		bg: COLORS.state.monitor.surface,
		text: COLORS.state.monitor.text,
		label: "Monitor",
	},
	2: {
		bg: COLORS.state.care.surface,
		text: COLORS.state.care.text,
		label: "Home Care",
	},
	3: {
		bg: COLORS.state.teleconsult.surface,
		text: COLORS.state.teleconsult.text,
		label: "Teleconsult",
	},
	4: {
		bg: COLORS.state.urgent.surface,
		text: COLORS.state.urgent.text,
		label: "Urgent",
	},
};

interface ActiveCaseBannerProps {
	state: ActionState;
	patientName: string;
	recheckLabel?: string;
	onPress?: () => void;
}

/**
 * Compact status strip shown at the top of Home State B.
 * Displays the current triage level, patient name, and recheck label.
 */
export function ActiveCaseBanner({
	state,
	patientName,
	recheckLabel,
	onPress,
}: ActiveCaseBannerProps) {
	const theme = LEVEL_COLORS[state.level] ?? LEVEL_COLORS[1];

	return (
		<Pressable
			style={[styles.banner, { backgroundColor: theme.bg }]}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={`Active case: Level ${state.level} — ${state.label} for ${patientName}`}
		>
			<View style={styles.pill}>
				<Text style={[styles.pillText, { color: theme.text }]}>
					L{state.level} · {theme.label}
				</Text>
			</View>
			<View style={styles.info}>
				<Text style={[styles.name, { color: theme.text }]}>{patientName}</Text>
				{recheckLabel ? (
					<Text style={[styles.recheck, { color: theme.text }]}>
						{recheckLabel}
					</Text>
				) : null}
			</View>
			{onPress && <ChevronRight size={18} color={theme.text} />}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: RADIUS.xl,
		padding: SPACING.md,
		gap: SPACING.md,
		marginBottom: SPACING.lg,
	},
	pill: {
		backgroundColor: "rgba(0,0,0,0.08)",
		borderRadius: RADIUS.full,
		paddingHorizontal: SPACING.md,
		paddingVertical: 4,
	},
	pillText: {
		fontSize: 12,
		fontWeight: "800",
		letterSpacing: 0.3,
	},
	info: {
		flex: 1,
	},
	name: {
		fontSize: 15,
		fontWeight: "700",
	},
	recheck: {
		fontSize: 12,
		fontWeight: "500",
		opacity: 0.75,
		marginTop: 1,
	},
});
