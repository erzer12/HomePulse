import { useRouter } from "expo-router";
import { Phone, X } from "lucide-react-native";
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

const FIRST_AID_CARDS = [
	{
		id: "choking",
		title: "Choking",
		steps: [
			"Ask: Are you choking? If they can't speak/cough — act now.",
			"Stand behind, give 5 firm back blows between shoulder blades.",
			"Give 5 abdominal thrusts (Heimlich): hands above navel, sharp inward-upward pull.",
			"Alternate back blows and thrusts until object dislodges.",
			"If unconscious, call 112 and begin CPR.",
		],
	},
	{
		id: "cpr",
		title: "CPR (Adult)",
		steps: [
			"Check for response — tap shoulders, shout.",
			"Call 112 immediately.",
			"30 chest compressions: heel of hand on centre of chest, push hard and fast.",
			"2 rescue breaths: tilt head, lift chin, pinch nose, seal mouth.",
			"Continue 30:2 until help arrives or person breathes normally.",
		],
	},
	{
		id: "fever",
		title: "High Fever",
		steps: [
			"Check temperature. Above 39.5°C in adults / 38.5°C in infants — seek care.",
			"Keep the person cool: remove excess clothing, cool damp cloth on forehead.",
			"Encourage fluids (water, ORS).",
			"Give paracetamol per label dosage if available.",
			"Call 112 if seizure, confusion, or difficulty breathing appears.",
		],
	},
	{
		id: "bleeding",
		title: "Severe Bleeding",
		steps: [
			"Apply direct pressure with a clean cloth or pad.",
			"Keep pressing — do not remove cloth (add more on top if soaked).",
			"Elevate the injured area above heart level if possible.",
			"Do not use a tourniquet unless bleeding is life-threatening and uncontrollable.",
			"Call 112 immediately.",
		],
	},
];

/**
 * Emergency Bypass screen — accessible PRE-AUTH, no PII exposed.
 * Shows 112 dialer button and offline first-aid cards.
 */
export default function EmergencyBypassScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const call112 = () => Linking.openURL("tel:112");

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* Close button — returns to gateway */}
			<Pressable
				style={styles.closeBtn}
				onPress={() => router.back()}
				accessibilityRole="button"
				accessibilityLabel="Close emergency screen"
			>
				<X size={22} color={COLORS.textPrimary} />
			</Pressable>

			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingBottom: insets.bottom + SPACING.xxl },
				]}
				showsVerticalScrollIndicator={false}
			>
				{/* Primary dial CTA */}
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

				<Text style={styles.sectionTitle}>Offline First Aid</Text>

				{FIRST_AID_CARDS.map((card) => (
					<View key={card.id} style={styles.card}>
						<Text style={styles.cardTitle}>{card.title}</Text>
						{card.steps.map((step, i) => (
							<View key={`${card.id}-${step}`} style={styles.step}>
								<Text style={styles.stepNum}>{i + 1}</Text>
								<Text style={styles.stepText}>{step}</Text>
							</View>
						))}
					</View>
				))}

				<Text style={styles.disclaimer}>
					This screen is available without login. No personal data is shown.
					These are general guidelines — always call 112 for emergencies.
				</Text>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	closeBtn: {
		position: "absolute",
		top: 56,
		right: SPACING.screenEdge,
		zIndex: 10,
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: COLORS.surfaceElevated,
		justifyContent: "center",
		alignItems: "center",
	},
	scroll: {
		padding: SPACING.screenEdge,
		paddingTop: SPACING.xl,
	},
	dialBtn: {
		backgroundColor: COLORS.criticalRed,
		borderRadius: RADIUS.xxl,
		padding: SPACING.xxl,
		alignItems: "center",
		marginBottom: SPACING.sectionGap,
		gap: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.05,
		shadowRadius: 12,
		elevation: 4,
	},
	dialLabel: {
		fontSize: 32,
		fontWeight: "900",
		color: "#FFFFFF",
		letterSpacing: -0.5,
	},
	dialSub: {
		fontSize: 14,
		color: "rgba(255,255,255,0.8)",
		fontWeight: "600",
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "800",
		color: COLORS.textPrimary,
		marginBottom: SPACING.lg,
	},
	card: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		padding: SPACING.xl,
		marginBottom: SPACING.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	cardTitle: {
		fontSize: 17,
		fontWeight: "800",
		color: COLORS.textPrimary,
		marginBottom: SPACING.lg,
	},
	step: {
		flexDirection: "row",
		gap: SPACING.md,
		marginBottom: SPACING.md,
	},
	stepNum: {
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: COLORS.state.monitor.surface,
		color: COLORS.state.monitor.text,
		fontSize: 12,
		fontWeight: "800",
		textAlign: "center",
		lineHeight: 22,
		flexShrink: 0,
	},
	stepText: {
		flex: 1,
		fontSize: 14,
		color: COLORS.textSecondary,
		lineHeight: 20,
	},
	disclaimer: {
		fontSize: 12,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 18,
		marginTop: SPACING.md,
		opacity: 0.7,
	},
});
