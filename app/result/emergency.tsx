import { useFocusEffect, useRouter } from "expo-router";
import { BookOpen, HeartCrack, Phone } from "lucide-react-native";
import { useCallback } from "react";
import {
	Linking,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";

const FIRST_AID_TIPS = [
	"Keep the person calm and seated or lying down in a comfortable position.",
	"Do not give food or water unless they are fully conscious.",
	"Monitor breathing — if they stop breathing, begin CPR and call 112.",
	"Do not leave the person alone.",
];

/**
 * Level 4 Emergency Screen.
 * Full-screen red. Routes here immediately after triage evaluation returns Level 4.
 * Case stays open — primary caregiver must manually resolve.
 * No explanation screen in between (per spec).
 */
export default function EmergencyScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const activeCase = useCaseStore((s) => s.activeCase);

	// Suppress system back gesture — Level 4 is an explicit dead-end until caregiver acts
	useFocusEffect(
		useCallback(() => {
			// nothing to clean up; just prevent accidental back navigation
		}, []),
	);

	const call112 = () => Linking.openURL("tel:112");

	const handleAcknowledge = () => {
		// Return to home — case stays active
		router.replace("/(tabs)/home");
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingBottom: insets.bottom + SPACING.xxl },
				]}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.iconCircle}>
						<HeartCrack size={48} color="#FFFFFF" strokeWidth={2} />
					</View>
					<Text style={styles.levelBadge}>LEVEL 4 — URGENT CARE</Text>
					<Text style={styles.title}>Seek Emergency Care Now</Text>
					<Text style={styles.body}>
						Based on current symptoms, this person needs immediate medical
						attention. Call emergency services right away.
					</Text>
				</View>

				{/* Primary CTA */}
				<Pressable
					style={styles.dialBtn}
					onPress={call112}
					accessibilityRole="button"
					accessibilityLabel="Call 112 emergency services"
				>
					<Phone size={28} color="#FFFFFF" />
					<Text style={styles.dialLabel}>Call 112</Text>
					<Text style={styles.dialSub}>Emergency Services</Text>
				</Pressable>

				{/* First aid holding tips */}
				<View style={styles.firstAidSection}>
					<View style={styles.sectionHeader}>
						<BookOpen size={18} color="#FFFFFF" />
						<Text style={styles.sectionTitle}>While Waiting for Help</Text>
					</View>
					{FIRST_AID_TIPS.map((tip, i) => (
						<View key={tip} style={styles.tip}>
							<View style={styles.tipBullet}>
								<Text style={styles.tipNum}>{i + 1}</Text>
							</View>
							<Text style={styles.tipText}>{tip}</Text>
						</View>
					))}
				</View>

				{/* Acknowledge — returns home, case stays open */}
				<Pressable
					style={styles.acknowledgeBtn}
					onPress={handleAcknowledge}
					accessibilityRole="button"
				>
					<Text style={styles.acknowledgeText}>
						I understand — keep monitoring
					</Text>
				</Pressable>

				{activeCase && (
					<Text style={styles.caseNote}>
						Case #{activeCase.id.slice(0, 8)} is open and will not auto-resolve.
					</Text>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.criticalRed,
	},
	scroll: {
		padding: SPACING.screenEdge,
	},
	header: {
		alignItems: "center",
		paddingVertical: SPACING.xxl,
	},
	iconCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "rgba(255,255,255,0.15)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.xl,
	},
	levelBadge: {
		fontSize: 11,
		fontWeight: "800",
		color: "rgba(255,255,255,0.7)",
		letterSpacing: 2,
		textTransform: "uppercase",
		marginBottom: SPACING.sm,
	},
	title: {
		fontSize: 30,
		fontWeight: "900",
		color: "#FFFFFF",
		textAlign: "center",
		marginBottom: SPACING.lg,
		letterSpacing: -0.5,
	},
	body: {
		fontSize: 16,
		color: "rgba(255,255,255,0.85)",
		textAlign: "center",
		lineHeight: 24,
	},
	dialBtn: {
		backgroundColor: "#FFFFFF",
		borderRadius: RADIUS.xxl,
		padding: SPACING.xxl,
		alignItems: "center",
		marginBottom: SPACING.xxl,
		gap: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.05,
		shadowRadius: 12,
		elevation: 4,
	},
	dialLabel: {
		fontSize: 36,
		fontWeight: "900",
		color: COLORS.criticalRed,
		letterSpacing: -0.5,
	},
	dialSub: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.criticalRed,
	},
	firstAidSection: {
		backgroundColor: "rgba(255,255,255,0.12)",
		borderRadius: RADIUS.xl,
		padding: SPACING.xl,
		marginBottom: SPACING.xl,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		marginBottom: SPACING.lg,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "800",
		color: "#FFFFFF",
	},
	tip: {
		flexDirection: "row",
		gap: SPACING.md,
		marginBottom: SPACING.md,
	},
	tipBullet: {
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
		flexShrink: 0,
	},
	tipNum: {
		fontSize: 12,
		fontWeight: "800",
		color: "#FFFFFF",
	},
	tipText: {
		flex: 1,
		fontSize: 14,
		color: "rgba(255,255,255,0.9)",
		lineHeight: 20,
	},
	acknowledgeBtn: {
		borderWidth: 2,
		borderColor: "rgba(255,255,255,0.4)",
		borderRadius: RADIUS.xl,
		padding: SPACING.lg,
		alignItems: "center",
		marginBottom: SPACING.md,
	},
	acknowledgeText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	caseNote: {
		fontSize: 11,
		color: "rgba(255,255,255,0.5)",
		textAlign: "center",
		fontFamily: "monospace",
	},
});
