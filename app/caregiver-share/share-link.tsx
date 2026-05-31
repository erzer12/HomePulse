import { Stack, useRouter } from "expo-router";
import { Copy, Info } from "lucide-react-native";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";

export default function ShareLinkScreen() {
	const router = useRouter();
	const shareUrl = "homepulse://case/abc123_demo";

	const onShare = async () => {
		try {
			await Share.share({
				message: `Help me monitor Rohan's health on HomePulse: ${shareUrl}`,
			});
		} catch (error) {
			console.log(error.message);
		}
	};

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					title: "Share Care",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
				}}
			/>

			<View style={styles.content}>
				<View style={styles.header}>
					<Text style={styles.title}>Invite a Caregiver</Text>
					<Text style={styles.subtitle}>
						Share a secure, read-only link so others can help monitor Rohan.
					</Text>
				</View>

				<Card variant="elevated" style={styles.qrCard}>
					<View style={styles.qrPlaceholder}>
						<QRCode
							value={shareUrl}
							size={180}
							color={COLORS.textPrimary}
							backgroundColor="#FFFFFF"
						/>
					</View>
					<Text style={styles.qrHint}>Scan to open shared view</Text>
				</Card>

				<Card style={styles.linkCard}>
					<View style={styles.linkRow}>
						<Text style={styles.url} numberOfLines={1}>
							{shareUrl}
						</Text>
						<Pressable style={styles.copyButton}>
							<Copy size={20} color={COLORS.primary} />
						</Pressable>
					</View>
				</Card>

				<View style={styles.infoBox}>
					<Info size={20} color={COLORS.state.monitor.text} />
					<Text style={styles.infoText}>
						Links expire in 24 hours. You can revoke access at any time.
					</Text>
				</View>

				<View style={styles.footer}>
					<Button
						title="Send Share Link"
						onPress={onShare}
						style={styles.mainButton}
					/>
					<Button
						title="Done"
						variant="outline"
						onPress={() => router.back()}
					/>
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
	content: {
		padding: SPACING.screenEdge,
		flex: 1,
	},
	header: {
		marginBottom: SPACING.sectionGap,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.textPrimary,
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		lineHeight: 22,
		marginTop: 8,
	},
	qrCard: {
		alignItems: "center",
		padding: SPACING.xxl,
		marginBottom: SPACING.lg,
	},
	qrPlaceholder: {
		padding: SPACING.lg,
		backgroundColor: "#FFFFFF",
		borderRadius: RADIUS.lg,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	qrHint: {
		marginTop: SPACING.md,
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.textSecondary,
	},
	linkCard: {
		backgroundColor: COLORS.surface,
		marginBottom: SPACING.lg,
	},
	linkRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	url: {
		flex: 1,
		fontSize: 14,
		color: COLORS.textSecondary,
		fontStyle: "italic",
	},
	copyButton: {
		padding: 8,
	},
	infoBox: {
		flexDirection: "row",
		backgroundColor: COLORS.state.monitor.surface,
		padding: SPACING.md,
		borderRadius: RADIUS.lg,
		alignItems: "center",
	},
	infoText: {
		flex: 1,
		fontSize: 13,
		color: COLORS.state.monitor.text,
		marginLeft: SPACING.md,
		lineHeight: 18,
	},
	footer: {
		marginTop: "auto",
	},
	mainButton: {
		marginBottom: SPACING.md,
	},
});
