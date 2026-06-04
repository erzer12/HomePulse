import * as LucideIcons from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotionView } from "@/components/ui/MotionView";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { TACTILE } from "@/constants/motion";

interface SymptomIconProps {
	label: string;
	iconName: string;
	onPress?: () => void;
	selected?: boolean;
	delay?: number;
}

export function SymptomIcon({
	label,
	iconName,
	onPress,
	selected,
	delay = 0,
}: SymptomIconProps) {
	// Transform kebab-case (e.g. battery-low) to PascalCase (e.g. BatteryLow)
	const pascalName = iconName
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");

	// Dynamically resolve icon from lucide-react-native
	const IconComponent =
		((LucideIcons as Record<string, any>)[pascalName] as React.ElementType) ||
		LucideIcons.Activity;

	return (
		<MotionView delay={delay} style={styles.motionWrapper}>
			<Pressable
				onPress={onPress}
				accessibilityLabel={`${label} — tap to select`}
				accessibilityRole="button"
				style={({ pressed }) => [
					styles.container,
					selected && styles.selected,
					pressed && {
						opacity: 0.7,
						transform: [{ scale: TACTILE.activeScale }],
					},
				]}
			>
				<View
					style={[
						styles.iconContainer,
						selected && styles.selectedIconContainer,
					]}
				>
					<IconComponent
						size={32}
						strokeWidth={2.5}
						color={selected ? "#FFFFFF" : COLORS.primary}
					/>
				</View>
				<Text style={[styles.label, selected && styles.selectedLabel]}>
					{label}
				</Text>
			</Pressable>
		</MotionView>
	);
}

const styles = StyleSheet.create({
	motionWrapper: {
		width: "30%", // Grid-friendly
		marginBottom: SPACING.md,
	},
	container: {
		aspectRatio: 1,
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		justifyContent: "center",
		alignItems: "center",
		// Soft shadow
		shadowColor: COLORS.textPrimary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
		borderWidth: 2,
		borderColor: "transparent",
		width: "100%",
	},
	selected: {
		borderColor: COLORS.primary,
		backgroundColor: COLORS.state.monitor.surface,
	},
	iconContainer: {
		marginBottom: SPACING.sm,
	},
	selectedIconContainer: {
		backgroundColor: COLORS.primary,
		padding: 8,
		borderRadius: RADIUS.lg,
	},
	label: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.textPrimary,
		textAlign: "center",
	},
	selectedLabel: {
		color: COLORS.primary,
	},
});
