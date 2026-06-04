import {
	Pressable,
	StyleSheet,
	Text,
	type TextStyle,
	type ViewStyle,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { TACTILE } from "@/constants/motion";

interface ButtonProps {
	title: string;
	onPress?: () => void;
	variant?: "primary" | "secondary" | "urgent" | "outline";
	size?: "normal" | "large";
	fullWidth?: boolean;
	style?: ViewStyle;
	disabled?: boolean;
}

export function Button({
	title,
	onPress,
	variant = "primary",
	size = "large",
	fullWidth = true,
	style,
	disabled = false,
}: ButtonProps) {
	const getVariantStyles = () => {
		if (disabled) return { backgroundColor: COLORS.disabledBG };
		switch (variant) {
			case "secondary":
				return { backgroundColor: COLORS.state.care.primary };
			case "urgent":
				return { backgroundColor: COLORS.state.urgent.primary };
			case "outline":
				return {
					backgroundColor: "transparent",
					borderWidth: 2,
					borderColor: COLORS.border,
				};
			default:
				return { backgroundColor: COLORS.primary };
		}
	};

	const getTextStyle = (): TextStyle => ({
		color: disabled
			? COLORS.textSecondary
			: variant === "outline"
				? COLORS.textPrimary
				: "#FFFFFF",
		fontSize: size === "large" ? 18 : 16,
		fontWeight: "600",
		textAlign: "center",
	});

	return (
		<Pressable
			onPress={disabled ? undefined : onPress}
			accessibilityLabel={title}
			accessibilityRole="button"
			disabled={disabled}
			style={({ pressed }) => [
				styles.base,
				getVariantStyles(),
				size === "large" && styles.large,
				fullWidth && styles.fullWidth,
				pressed && !disabled && {
					opacity: 0.7,
					transform: [{ scale: TACTILE.activeScale }],
				},
				style,
			]}
		>
			<Text style={getTextStyle()}>{title}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	base: {
		borderRadius: RADIUS.xl,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: SPACING.xl,
	},
	large: {
		height: 60, // Tappable 60px height as per design system
	},
	fullWidth: {
		width: "100%",
	},
});
