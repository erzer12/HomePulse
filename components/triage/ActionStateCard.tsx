import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import type { ActionState } from "@/types/triage";

interface ActionStateCardProps {
	state: ActionState;
	showExplanation?: boolean;
}

export function ActionStateCard({
	state,
	showExplanation = true,
}: ActionStateCardProps) {
	const getTheme = () => {
		switch (state.level) {
			case 1:
				return COLORS.state.monitor;
			case 2:
				return COLORS.state.care;
			case 3:
				return COLORS.state.teleconsult;
			case 4:
				return {
					primary: "#FFFFFF",
					surface: COLORS.criticalRed,
					text: "#FFFFFF",
				};
			default:
				return COLORS.state.monitor;
		}
	};

	const theme = getTheme();

	return (
		<View style={[styles.card, { backgroundColor: theme.surface }]}>
			<View style={styles.header}>
				<View style={[styles.indicator, { backgroundColor: theme.primary }]} />
				<Text style={[styles.label, { color: theme.text }]}>{state.label}</Text>
			</View>

			{showExplanation && (
				<Text style={[styles.explanation, { color: theme.text }]}>
					{state.explanation}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: RADIUS.xxl,
		padding: SPACING.lg,
		width: "100%",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.sm,
	},
	indicator: {
		width: 12,
		height: 12,
		borderRadius: RADIUS.full,
		marginRight: SPACING.sm,
	},
	label: {
		fontSize: 20,
		fontWeight: "700",
	},
	explanation: {
		fontSize: 16,
		lineHeight: 24,
		opacity: 0.9,
	},
});
