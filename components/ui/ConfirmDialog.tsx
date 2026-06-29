import { useState } from "react";
import {
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { Button } from "./Button";

interface BaseConfirmDialogProps {
	visible: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
	onCancel: () => void;
}

interface SimpleConfirmDialogProps extends BaseConfirmDialogProps {
	/** When provided, the user must type this string exactly before confirming. */
	requiresTyping?: undefined;
	onConfirm: () => void;
}

interface TypeConfirmDialogProps extends BaseConfirmDialogProps {
	/** When provided, the user must type this string exactly before confirming. */
	requiresTyping: string;
	onConfirm: () => void;
}

type ConfirmDialogProps = SimpleConfirmDialogProps | TypeConfirmDialogProps;

/**
 * A modal confirmation dialog.
 * When `requiresTyping` is set, the confirm button is disabled until the user
 * has typed that exact string (e.g. "WIPE" for the data wipe flow).
 */
export function ConfirmDialog({
	visible,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	destructive = false,
	requiresTyping,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const [typed, setTyped] = useState("");

	const canConfirm = requiresTyping ? typed === requiresTyping : true;

	const handleCancel = () => {
		setTyped("");
		onCancel();
	};

	const handleConfirm = () => {
		if (!canConfirm) return;
		setTyped("");
		onConfirm();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={handleCancel}
		>
			<Pressable style={styles.backdrop} onPress={handleCancel}>
				<Pressable style={styles.sheet} onPress={() => {}}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.message}>{message}</Text>

					{requiresTyping && (
						<>
							<Text style={styles.typeHint}>
								Type <Text style={styles.typeWord}>"{requiresTyping}"</Text> to
								confirm:
							</Text>
							<TextInput
								style={styles.typeInput}
								value={typed}
								onChangeText={setTyped}
								placeholder={requiresTyping}
								placeholderTextColor={COLORS.textSecondary}
								autoCapitalize="characters"
								autoCorrect={false}
								accessibilityLabel={`Type ${requiresTyping} to confirm`}
							/>
						</>
					)}

					<View style={styles.actions}>
						<Button
							title={cancelLabel}
							variant="outline"
							style={styles.actionBtn}
							onPress={handleCancel}
						/>
						<Button
							title={confirmLabel}
							variant={destructive ? "urgent" : "primary"}
							style={styles.actionBtn}
							disabled={!canConfirm}
							onPress={handleConfirm}
						/>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
		padding: SPACING.xl,
	},
	sheet: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xxl,
		padding: SPACING.xxl,
		width: "100%",
		maxWidth: 380,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 12,
	},
	title: {
		fontSize: 20,
		fontWeight: "800",
		color: COLORS.textPrimary,
		marginBottom: SPACING.sm,
	},
	message: {
		fontSize: 15,
		color: COLORS.textSecondary,
		lineHeight: 22,
		marginBottom: SPACING.lg,
	},
	typeHint: {
		fontSize: 13,
		color: COLORS.textSecondary,
		marginBottom: SPACING.sm,
	},
	typeWord: {
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
	typeInput: {
		backgroundColor: COLORS.background,
		borderRadius: RADIUS.lg,
		padding: SPACING.lg,
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textPrimary,
		borderWidth: 1.5,
		borderColor: COLORS.border,
		marginBottom: SPACING.xl,
		letterSpacing: 2,
	},
	actions: {
		flexDirection: "row",
		gap: SPACING.md,
	},
	actionBtn: {
		flex: 1,
		height: 50,
	},
});
