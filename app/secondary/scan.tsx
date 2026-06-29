import { Camera, CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { PermissionPromptModal } from "@/components/ui/PermissionPromptModal";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";

/**
 * Secondary Caregiver QR Scanner.
 * Allows scanning primary caregiver's sharing QR code to gain instant read-only access.
 */
export default function QRScannerScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [scanned, setScanned] = useState(false);
	const [prePromptVisible, setPrePromptVisible] = useState(true);

	useEffect(() => {
		// Check current permission status silently
		Camera.getCameraPermissionsAsync().then(({ status }) => {
			if (status === "granted") {
				setHasPermission(true);
				setPrePromptVisible(false);
			}
		});
	}, []);

	const handleRequestPermission = async () => {
		setPrePromptVisible(false);
		const { status } = await Camera.requestCameraPermissionsAsync();
		setHasPermission(status === "granted");
	};

	const handleBarCodeScanned = ({ data }: { data: string }) => {
		if (scanned) return;
		setScanned(true);

		// Validate deep link format: homepulse://case/<token>
		const match = data.match(/homepulse:\/\/case\/([a-f0-9]{32})/i);
		if (match) {
			const token = match[1];
			// Route to the index gate for validation
			router.replace({
				pathname: "/secondary",
				params: { token },
			});
		} else {
			Alert.alert(
				"Invalid QR Code",
				"This QR code does not belong to a HomePulse care sharing session.",
				[{ text: "Scan Again", onPress: () => setScanned(false) }],
			);
		}
	};

	if (prePromptVisible) {
		return (
			<View style={[styles.container, styles.center]}>
				<Stack.Screen options={{ headerShown: false }} />
				<PermissionPromptModal
					visible={prePromptVisible}
					type="camera"
					reason="We need camera access to scan your partner's QR token and sync their care desk."
					onAllow={handleRequestPermission}
					onCancel={() => router.back()}
				/>
			</View>
		);
	}

	if (hasPermission === null) {
		return (
			<View style={[styles.container, styles.center]}>
				<Text style={styles.text}>Requesting camera permission...</Text>
			</View>
		);
	}

	if (hasPermission === false) {
		return (
			<View style={[styles.container, styles.center, { padding: SPACING.xl }]}>
				<Stack.Screen options={{ headerShown: true, title: "Scan QR Code" }} />
				<Text style={styles.errorText}>
					Camera permission is required to scan QR codes. Please enable camera
					access in your device settings.
				</Text>
				<Button
					title="Go Back"
					onPress={() => router.back()}
					style={styles.backBtn}
				/>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Stack.Screen options={{ headerShown: false }} />

			<CameraView
				onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
				barcodeScannerSettings={{
					barcodeTypes: ["qr"],
				}}
				style={StyleSheet.absoluteFill}
			/>

			{/* Custom Scanner Frame HUD Overlay */}
			<View style={styles.hudOverlay}>
				<View
					style={[styles.headerRow, { paddingTop: insets.top + SPACING.md }]}
				>
					<Pressable
						onPress={() => router.back()}
						style={styles.closeBtn}
						accessibilityRole="button"
						accessibilityLabel="Close camera scanner"
					>
						<X size={20} color="#FFFFFF" />
					</Pressable>
					<Text style={styles.hudTitle}>Scan Care QR</Text>
					<View style={styles.spacer} />
				</View>

				<View style={styles.scannerBox}>
					<View style={styles.scannerBorder} />
					<Text style={styles.scannerHint}>Align QR code inside the box</Text>
				</View>

				<View style={styles.hudFooter}>
					<Text style={styles.hudDesc}>
						Scanning registers this device as a secondary caregiver.
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		fontSize: 15,
		color: COLORS.textSecondary,
	},
	errorText: {
		fontSize: 15,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: SPACING.xl,
	},
	backBtn: {
		paddingHorizontal: SPACING.xl,
	},
	hudOverlay: {
		flex: 1,
		justifyContent: "space-between",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: SPACING.xl,
	},
	closeBtn: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "rgba(0,0,0,0.6)",
		borderWidth: 0,
		justifyContent: "center",
		alignItems: "center",
	},
	hudTitle: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "800",
	},
	spacer: {
		width: 44,
	},
	scannerBox: {
		alignSelf: "center",
		alignItems: "center",
		gap: SPACING.xl,
	},
	scannerBorder: {
		width: 240,
		height: 240,
		borderWidth: 3,
		borderColor: COLORS.primary,
		borderRadius: RADIUS.xl,
		backgroundColor: "transparent",
	},
	scannerHint: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "600",
		backgroundColor: "rgba(0,0,0,0.7)",
		paddingHorizontal: SPACING.lg,
		paddingVertical: 6,
		borderRadius: RADIUS.lg,
		overflow: "hidden",
	},
	hudFooter: {
		paddingHorizontal: SPACING.xxl,
		paddingBottom: SPACING.xxxl,
		alignItems: "center",
	},
	hudDesc: {
		color: "rgba(255, 255, 255, 0.7)",
		fontSize: 13,
		textAlign: "center",
		lineHeight: 18,
	},
});
