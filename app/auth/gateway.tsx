import { useRouter } from "expo-router";
import { Fingerprint, HeartPulse, Phone } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	Animated,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { signInWithGoogle } from "@/services/supabase";

// Dynamic import — expo-local-authentication is not available in all envs
const getLocalAuth = () => {
	try {
		return require("expo-local-authentication");
	} catch {
		return null;
	}
};

const MAX_ATTEMPTS = 3;

/**
 * Auth Gateway screen.
 * Phase 1 → Auth Gateway:
 *  Path A — biometric success → replace to /(tabs)/home
 *  Path B — fail ×3 → push to /auth/lockout
 *  Path C — "Emergency" button (always visible) → push to /auth/emergency-bypass
 */
export default function GatewayScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [biometricsAvailable, setBiometricsAvailable] = useState<
		boolean | null
	>(null);
	const [status, setStatus] = useState<
		"idle" | "authenticating" | "success" | "failed"
	>("idle");
	const [attempts, setAttempts] = useState<number>(0);
	const { isConnected } = useNetworkStatus();

	// Pulse animation for the fingerprint icon
	const pulse = useRef(new Animated.Value(1)).current;

	const startPulse = useCallback(() => {
		Animated.sequence([
			Animated.timing(pulse, {
				toValue: 1.15,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(pulse, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}),
		]).start();
	}, [pulse]);

	const authenticate = useCallback(async () => {
		const LocalAuth = getLocalAuth();
		if (!LocalAuth) {
			// Simulator / no biometrics — bypass directly (dev mode)
			router.replace("/(tabs)/home");
			return;
		}

		setStatus("authenticating");
		startPulse();

		try {
			const result = await LocalAuth.authenticateAsync({
				promptMessage: "Unlock HomePulse",
				cancelLabel: "Cancel",
				disableDeviceFallback: false,
			});

			if (result.success) {
				router.replace("/(tabs)/home");
			} else {
				const nextAttempts = attempts + 1;
				setAttempts(nextAttempts);
				setStatus("failed");

				if (nextAttempts >= MAX_ATTEMPTS) {
					router.push("/auth/lockout");
				}
			}
		} catch {
			setStatus("failed");
		}
	}, [router, attempts, startPulse]);

	const handleGoogleLogin = async () => {
		if (!isConnected) {
			Alert.alert(
				"Connection Required",
				"An active internet connection is required to complete Google Sign In. Please connect to the internet or unlock with biometrics.",
			);
			return;
		}

		try {
			await signInWithGoogle();
		} catch (e: unknown) {
			console.error("Google Sign-in failed", e);
			Alert.alert(
				"Sign In Failed",
				"Could not complete Google Sign-in. Please try again.",
			);
		}
	};

	useEffect(() => {
		const LocalAuth = getLocalAuth();
		if (!LocalAuth) {
			setBiometricsAvailable(false);
			return;
		}
		LocalAuth.hasHardwareAsync().then((hw: boolean) => {
			if (!hw) {
				setBiometricsAvailable(false);
				return;
			}
			LocalAuth.isEnrolledAsync().then((enrolled: boolean) => {
				setBiometricsAvailable(enrolled);
			});
		});
	}, []);

	useEffect(() => {
		if (biometricsAvailable) authenticate();
	}, [biometricsAvailable, authenticate]);

	return (
		<View
			style={[
				styles.container,
				{ paddingTop: insets.top, paddingBottom: insets.bottom },
			]}
		>
			{/* Emergency bypass — always visible, no auth needed */}
			<Pressable
				style={styles.emergencyBtn}
				onPress={() => router.push("/auth/emergency-bypass")}
				accessibilityRole="button"
				accessibilityLabel="Emergency — open dialer and first aid cards"
			>
				<Phone size={16} color={COLORS.state.urgent.text} />
				<Text style={styles.emergencyText}>Emergency</Text>
			</Pressable>

			<View style={styles.center}>
				<View style={styles.iconCircle}>
					<HeartPulse size={52} color={COLORS.primary} strokeWidth={2.5} />
				</View>
				<Text style={styles.title}>HomePulse</Text>
				<Text style={styles.subtitle}>Your household health companion</Text>

				<Animated.View
					style={[styles.fingerprintWrap, { transform: [{ scale: pulse }] }]}
				>
					<Pressable
						onPress={authenticate}
						style={styles.fingerprintBtn}
						accessibilityRole="button"
						accessibilityLabel="Authenticate with biometrics"
					>
						<Fingerprint
							size={64}
							color={
								status === "failed"
									? COLORS.state.urgent.primary
									: COLORS.primary
							}
							strokeWidth={1.5}
						/>
					</Pressable>
				</Animated.View>

				{status === "idle" || status === "authenticating" ? (
					<Text style={styles.hint}>
						{biometricsAvailable === false
							? "Biometrics not enrolled — tap to continue"
							: "Touch the sensor or use Face ID"}
					</Text>
				) : (
					<View style={styles.failedWrap}>
						<Text style={styles.failedText}>
							Authentication failed.{" "}
							{MAX_ATTEMPTS - attempts > 0
								? `${MAX_ATTEMPTS - attempts} attempt${MAX_ATTEMPTS - attempts === 1 ? "" : "s"} remaining.`
								: ""}
						</Text>
						<Button
							title="Try Again"
							variant="outline"
							style={styles.retryBtn}
							onPress={authenticate}
						/>
					</View>
				)}

				<View style={styles.separator}>
					<View style={styles.line} />
					<Text style={styles.orText}>OR</Text>
					<View style={styles.line} />
				</View>

				<Button
					title="Continue with Google"
					variant="outline"
					onPress={handleGoogleLogin}
					style={styles.googleBtn}
				/>

				<Button
					title="Scan Care QR"
					variant="outline"
					onPress={() => router.push("/secondary/scan")}
					style={styles.qrScanBtn}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
		padding: SPACING.screenEdge,
	},
	emergencyBtn: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-end",
		backgroundColor: COLORS.state.urgent.surface,
		paddingHorizontal: SPACING.lg,
		paddingVertical: SPACING.sm,
		borderRadius: RADIUS.full,
		gap: 6,
	},
	emergencyText: {
		fontSize: 13,
		fontWeight: "700",
		color: COLORS.state.urgent.text,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	iconCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: COLORS.surfaceElevated,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.xl,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 20,
		elevation: 8,
	},
	title: {
		fontSize: 36,
		fontWeight: "900",
		color: COLORS.textPrimary,
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: 15,
		color: COLORS.textSecondary,
		marginTop: 6,
		marginBottom: SPACING.xxxl,
	},
	fingerprintWrap: {
		marginBottom: SPACING.xl,
	},
	fingerprintBtn: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: COLORS.surfaceElevated,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
	},
	hint: {
		fontSize: 14,
		color: COLORS.textSecondary,
		textAlign: "center",
	},
	failedWrap: {
		alignItems: "center",
		gap: SPACING.md,
	},
	failedText: {
		fontSize: 14,
		color: COLORS.state.urgent.text,
		textAlign: "center",
		fontWeight: "600",
	},
	retryBtn: {
		height: 48,
		paddingHorizontal: SPACING.xxl,
	},
	separator: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: SPACING.xl,
		width: "80%",
		gap: SPACING.md,
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: COLORS.border,
	},
	orText: {
		fontSize: 12,
		fontWeight: "700",
		color: COLORS.textSecondary,
		textTransform: "uppercase",
	},
	googleBtn: {
		width: "80%",
		height: 52,
		borderRadius: RADIUS.xl,
	},
	qrScanBtn: {
		width: "80%",
		height: 52,
		borderRadius: RADIUS.xl,
		marginTop: SPACING.md,
		borderWidth: 0,
	},
});
