import { HeartPulse } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";

interface TriageProcessingOverlayProps {
	visible: boolean;
	message?: string;
}

/**
 * Branded full-screen loading overlay.
 * Tactile pulsing logo preventing double-taps or interactions while the clinical engine evaluates.
 */
export function TriageProcessingOverlay({
	visible,
	message = "Analyzing vitals...",
}: TriageProcessingOverlayProps) {
	const pulse = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		let animation: Animated.CompositeAnimation | null = null;
		if (visible) {
			animation = Animated.loop(
				Animated.sequence([
					Animated.timing(pulse, {
						toValue: 1.25,
						duration: 600,
						useNativeDriver: true,
					}),
					Animated.timing(pulse, {
						toValue: 1,
						duration: 600,
						useNativeDriver: true,
					}),
				]),
			);
			animation.start();
		} else {
			pulse.setValue(1);
		}
		return () => {
			if (animation) animation.stop();
		};
	}, [visible, pulse]);

	return (
		<Modal transparent visible={visible} animationType="fade">
			<View style={styles.overlay}>
				<View style={styles.card}>
					<Animated.View style={{ transform: [{ scale: pulse }] }}>
						<View style={styles.iconCircle}>
							<HeartPulse size={48} color={COLORS.primary} strokeWidth={2.5} />
						</View>
					</Animated.View>
					<Text style={styles.message}>{message}</Text>
					<Text style={styles.subtext}>Securing clinical recommendation</Text>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(46, 42, 39, 0.45)", // Semi-transparent Charcoal Ink
		justifyContent: "center",
		alignItems: "center",
		padding: SPACING.xl,
	},
	card: {
		backgroundColor: COLORS.background, // Paper-like
		borderRadius: RADIUS.xxl,
		padding: SPACING.xxl,
		alignItems: "center",
		width: "80%",
		maxWidth: 320,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 10,
	},
	iconCircle: {
		width: 88,
		height: 88,
		borderRadius: 44,
		backgroundColor: COLORS.state.monitor.surface,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	message: {
		fontSize: 18,
		fontWeight: "800",
		color: COLORS.textPrimary,
		textAlign: "center",
		marginBottom: 4,
	},
	subtext: {
		fontSize: 12,
		color: COLORS.textSecondary,
		textAlign: "center",
		fontWeight: "500",
		opacity: 0.8,
	},
});
