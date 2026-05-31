import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";

interface TaskItemProps {
	task: {
		id: string;
		title: string;
		done: boolean;
	};
}

export function TaskItem({ task }: TaskItemProps) {
	return (
		<View style={styles.container}>
			<View style={styles.textContainer}>
				<Text style={[styles.title, task.done && styles.titleDone]}>
					{task.title}
				</Text>
			</View>

			{!task.done && (
				<Button
					title="Mark Done"
					variant="outline"
					size="normal"
					fullWidth={false}
					style={styles.button}
				/>
			)}

			{task.done && (
				<View style={styles.doneBadge}>
					<Text style={styles.doneText}>Completed</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		padding: SPACING.lg,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.md,
		// Soft shadow
		shadowColor: COLORS.textPrimary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	textContainer: {
		flex: 1,
		marginRight: SPACING.md,
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.textPrimary,
	},
	titleDone: {
		textDecorationLine: "line-through",
		opacity: 0.5,
	},
	button: {
		height: 44, // Tappable but smaller than primary CTAs
		paddingHorizontal: SPACING.lg,
	},
	doneBadge: {
		backgroundColor: COLORS.state.monitor.surface,
		paddingHorizontal: SPACING.md,
		paddingVertical: 6,
		borderRadius: RADIUS.full,
	},
	doneText: {
		color: COLORS.state.monitor.text,
		fontSize: 12,
		fontWeight: "700",
	},
});
