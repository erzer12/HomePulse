import { Bell, Camera } from "lucide-react-native";
import { Modal, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { Button } from "./Button";

interface PermissionPromptModalProps {
	visible: boolean;
	type: "camera" | "notifications";
	reason: string;
	onAllow: () => void;
	onCancel: () => void;
}

/**
 * Branded pre-permission overlay.
 * Explains the clinical or functional utility in a reassuring way
 * before triggering harsh native OS dialogs.
 */
export function PermissionPromptModal({
	visible,
	type,
	reason,
	onAllow,
	onCancel,
}: PermissionPromptModalProps) {
	const isCamera = type === "camera";

	return (
		<Modal transparent visible={visible} animationType="slide">
			<View style={styles.overlay}>
				<View style={styles.card}>
					<View
						style={[
							styles.iconCircle,
							isCamera ? styles.cameraBG : styles.bellBG,
						]}
					>
						{isCamera ? (
							<Camera
								size={36}
								color={COLORS.state.monitor.primary}
								strokeWidth={2}
							/>
						) : (
							<Bell
								size={36}
								color={COLORS.state.care.primary}
								strokeWidth={2}
							/>
						)}
					</View>

					<Text style={styles.title}>
						{isCamera ? "Enable Camera Access" : "Enable Health Nudges"}
					</Text>
					<Text style={styles.body}>{reason}</Text>

					<View style={styles.actions}>
						<Button title="Continue" onPress={onAllow} style={styles.btn} />
						<Button
							title="Not Now"
							variant="outline"
							onPress={onCancel}
							style={{ ...styles.btn, ...styles.cancelBtn }}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(46, 42, 39, 0.45)", // Semi-transparent Charcoal Ink
		justifyContent: "flex-end",
	},
	card: {
		backgroundColor: COLORS.background, // Paper-like
		borderTopLeftRadius: RADIUS.xxl,
		borderTopRightRadius: RADIUS.xxl,
		padding: SPACING.xl,
		paddingBottom: SPACING.xxxl,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.1,
		shadowRadius: 20,
		elevation: 10,
	},
	iconCircle: {
		width: 72,
		height: 72,
		borderRadius: 36,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.xl,
	},
	cameraBG: {
		backgroundColor: COLORS.state.monitor.surface,
	},
	bellBG: {
		backgroundColor: COLORS.state.care.surface,
	},
	title: {
		fontSize: 22,
		fontWeight: "800",
		color: COLORS.textPrimary,
		textAlign: "center",
		marginBottom: SPACING.md,
	},
	body: {
		fontSize: 15,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 22,
		paddingHorizontal: SPACING.lg,
		marginBottom: SPACING.xxl,
	},
	actions: {
		width: "100%",
		gap: SPACING.md,
	},
	btn: {
		height: 52,
	},
	cancelBtn: {
		borderWidth: 0,
	},
});
