import { useRouter } from "expo-router";
import { ShieldX } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";

export default function TokenInvalidScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.container,
				{ paddingTop: insets.top, paddingBottom: insets.bottom },
			]}
		>
			<View style={styles.content}>
				<View style={styles.iconCircle}>
					<ShieldX
						size={48}
						color={COLORS.state.urgent.primary}
						strokeWidth={2}
					/>
				</View>
				<Text style={styles.title}>Invalid Link</Text>
				<Text style={styles.body}>
					This access link is no longer valid. It may have been revoked by the
					primary caregiver, or the link may be incorrect.
				</Text>
				<View style={styles.tipBox}>
					<Text style={styles.tipText}>
						🔗 Make sure you're using the latest link sent to you. Copied links
						can sometimes be truncated.
					</Text>
				</View>
			</View>
			<Button
				title="Close"
				variant="outline"
				onPress={() => router.replace("/")}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
		padding: SPACING.screenEdge,
		justifyContent: "space-between",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	iconCircle: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: COLORS.state.urgent.surface,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.xxl,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.textPrimary,
		marginBottom: SPACING.md,
	},
	body: {
		fontSize: 15,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: SPACING.xxl,
	},
	tipBox: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.lg,
		padding: SPACING.lg,
	},
	tipText: {
		fontSize: 13,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 20,
	},
});
