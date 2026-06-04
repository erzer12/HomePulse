import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft, X } from "lucide-react-native";
import { useRef, useState, useEffect } from "react";
import {
	Animated,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";
import { createUuid } from "@/utils/ids";
import type { SymptomEntry } from "@/types/triage";

export default function QuestionnaireScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const insets = useSafeAreaInsets();
	
	const activeCase = useCaseStore((s) => s.activeCase);
	const profiles = usePatientStore((s) => s.profiles);
	const appendSymptomEntry = useCaseStore((s) => s.appendSymptomEntry);
	const evaluateCase = useCaseStore((s) => s.evaluateCase);

	const [patientName, setPatientName] = useState("the person");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
	const [inputValue, setInputValue] = useState("");

	useEffect(() => {
		if (activeCase && profiles.length > 0) {
			const patient = profiles.find((p) => p.id === activeCase.patient_id);
			if (patient) setPatientName(patient.name);
		}
	}, [activeCase, profiles]);

	const QUESTIONS = [
		{
			id: "duration",
			text: `How long has the symptom been present?`,
			hint: "Count from the very first time you noticed it.",
			type: "choice",
			options: [
				{ label: "Less than 2 days", value: "<2d" },
				{ label: "2 to 5 days", value: "2-5d" },
				{ label: "More than 5 days", value: ">5d" },
			],
		},
		{
			id: "temperature",
			text: "What is the temperature reading?",
			hint: "If you have a thermometer, enter the reading here.",
			type: "numeric",
			unit: "°C",
		},
		{
			id: "is_drinking",
			text: `Is ${patientName} drinking fluids normally?`,
			hint: "Offer a few sips of water to check.",
			type: "choice",
			options: [
				{ label: "Yes, normally", value: "normal" },
				{ label: "Less than usual", value: "reduced" },
				{ label: "No, not at all", value: "poor" },
			],
		},
		{
			id: "breathing_diff",
			text: "Is there any difficulty breathing?",
			hint: `Look at ${patientName}'s chest — is it moving faster than usual?`,
			type: "boolean",
		},
		{
			id: "alertness",
			text: `How alert is ${patientName} right now?`,
			hint: "Try calling their name or touching their shoulder.",
			type: "choice",
			options: [
				{ label: "Fully Alert", value: "alert" },
				{ label: "Sleepy / Drowsy", value: "lethargic" },
				{ label: "Confused", value: "confused" },
				{ label: "Unresponsive", value: "unconscious" },
			],
		},
	];

	// Animation state
	const contentFade = useRef(new Animated.Value(1)).current;

	const currentQuestion = QUESTIONS[currentIndex];
	const progress = (currentIndex + 1) / QUESTIONS.length;

	const transitionToNext = (nextIndex: number) => {
		Animated.timing(contentFade, {
			toValue: 0,
			duration: 150,
			useNativeDriver: true,
		}).start(() => {
			setCurrentIndex(nextIndex);
			setInputValue("");
			Animated.timing(contentFade, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		});
	};

	const handleNext = async () => {
		// If numeric, save input first
		if (currentQuestion.type === "numeric" && inputValue) {
			setAnswers(prev => ({ ...prev, [currentQuestion.id]: Number.parseFloat(inputValue) }));
		}

		if (currentIndex < QUESTIONS.length - 1) {
			transitionToNext(currentIndex + 1);
		} else {
			await finishAssessment();
		}
	};

	const finishAssessment = async () => {
		if (!activeCase) return;

		const entry: SymptomEntry = {
			id: createUuid(),
			case_id: activeCase.id,
			timestamp: Date.now(),
			category: (params.category as any) || "fever",
			duration_hours: answers.duration === "<2d" ? 24 : answers.duration === "2-5d" ? 72 : 144,
			temperature_celsius: answers.temperature as number || undefined,
			hydration_status: (answers.is_drinking as any) || "normal",
			consciousness: (answers.alertness as any) || "alert",
			breathing_difficulty: !!answers.breathing_diff,
		};

		try {
			await appendSymptomEntry(entry);
			await evaluateCase(activeCase.id);
			router.push("/symptom-check/household-check");
		} catch (e) {
			console.error("Failed to save assessment", e);
		}
	};

	const handleBack = () => {
		if (currentIndex > 0) {
			transitionToNext(currentIndex - 1);
		} else {
			router.back();
		}
	};

	const saveAnswer = (value: string | number | boolean) => {
		setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
		if (currentQuestion.type !== "numeric") {
			setTimeout(handleNext, 300);
		}
	};

	const isAnswered =
		answers[currentQuestion.id] !== undefined || inputValue !== "";

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={[styles.container, { paddingTop: insets.top }]}
		>
			<View style={styles.topBar}>
				<Pressable onPress={() => router.back()} style={styles.iconButton}>
					<X color={COLORS.textPrimary} size={24} />
				</Pressable>
				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>
						Step {currentIndex + 1} of {QUESTIONS.length}
					</Text>
					<ProgressBar
						progress={progress}
						color={COLORS.primary}
						style={styles.progressBar}
					/>
				</View>
				<Pressable onPress={handleBack} style={styles.iconButton}>
					<ChevronLeft color={COLORS.textPrimary} size={24} />
				</Pressable>
			</View>

			<Animated.ScrollView
				style={{
					opacity: contentFade,
					transform: [
						{
							translateY: contentFade.interpolate({
								inputRange: [0, 1],
								outputRange: [10, 0],
							}),
						},
					],
				}}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.questionSection}>
					<Text style={styles.questionText}>{currentQuestion.text}</Text>
					{currentQuestion.hint && (
						<Text style={styles.hintText}>{currentQuestion.hint}</Text>
					)}
				</View>

				<View style={styles.inputSection}>
					{currentQuestion.type === "boolean" && (
						<View style={styles.booleanContainer}>
							<Pressable
								onPress={() => saveAnswer(true)}
								style={[
									styles.booleanButton,
									answers[currentQuestion.id] === true && styles.booleanActive,
								]}
							>
								<Text
									style={[
										styles.booleanLabel,
										answers[currentQuestion.id] === true && styles.textWhite,
									]}
								>
									YES
								</Text>
							</Pressable>
							<Pressable
								onPress={() => saveAnswer(false)}
								style={[
									styles.booleanButton,
									answers[currentQuestion.id] === false &&
										styles.booleanNoActive,
								]}
							>
								<Text
									style={[
										styles.booleanLabel,
										answers[currentQuestion.id] === false && styles.textWhite,
									]}
								>
									NO
								</Text>
							</Pressable>
						</View>
					)}

					{currentQuestion.type === "choice" && (
						<View style={styles.choiceContainer}>
							{currentQuestion.options?.map((opt) => (
								<Pressable
									key={opt.value}
									onPress={() => saveAnswer(opt.value)}
									style={[
										styles.choiceItem,
										answers[currentQuestion.id] === opt.value &&
											styles.choiceActive,
									]}
								>
									<Text
										style={[
											styles.choiceLabel,
											answers[currentQuestion.id] === opt.value &&
												styles.textPrimary,
										]}
									>
										{opt.label}
									</Text>
									{answers[currentQuestion.id] === opt.value && (
										<Check size={20} color={COLORS.primary} />
									)}
								</Pressable>
							))}
						</View>
					)}

					{currentQuestion.type === "numeric" && (
						<View style={styles.numericContainer}>
							<Card variant="elevated" style={styles.numericDisplay}>
								<TextInput
									style={styles.numericInput}
									value={inputValue}
									onChangeText={setInputValue}
									placeholder="0.0"
									keyboardType="decimal-pad"
									autoFocus
								/>
								<Text style={styles.unitText}>{currentQuestion.unit}</Text>
							</Card>
							<Text style={styles.numericHint}>
								Enter reading from your device
							</Text>
						</View>
					)}
				</View>
			</Animated.ScrollView>

			<View
				style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}
			>
				<Button
					title={
						currentIndex === QUESTIONS.length - 1
							? "Finish Assessment"
							: "Next Question"
					}
					onPress={handleNext}
					disabled={!isAnswered && currentQuestion.type === "numeric"}
				/>
				<Pressable onPress={handleBack} style={styles.prevLink}>
					<Text style={styles.prevLinkText}>Previous Question</Text>
				</Pressable>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
	},
	iconButton: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
	},
	progressContainer: {
		flex: 1,
		alignItems: "center",
		paddingHorizontal: SPACING.xl,
	},
	progressText: {
		fontSize: 12,
		fontWeight: "700",
		color: COLORS.textSecondary,
		textTransform: "uppercase",
		marginBottom: 4,
	},
	progressBar: { height: 6, width: "100%" },
	scrollContent: { padding: SPACING.screenEdge, paddingBottom: 120 },
	questionSection: { marginTop: SPACING.xl, marginBottom: SPACING.xxxl },
	questionText: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.textPrimary,
		lineHeight: 36,
	},
	hintText: {
		fontSize: 16,
		color: COLORS.textSecondary,
		marginTop: SPACING.md,
		lineHeight: 22,
	},
	inputSection: { flex: 1 },
	booleanContainer: { gap: SPACING.md },
	booleanButton: {
		height: 70,
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: COLORS.border,
	},
	booleanActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	booleanNoActive: {
		backgroundColor: COLORS.textSecondary,
		borderColor: COLORS.textSecondary,
	},
	booleanLabel: { fontSize: 20, fontWeight: "800", color: COLORS.textPrimary },
	textWhite: { color: "#FFFFFF" },
	choiceContainer: { gap: SPACING.md },
	choiceItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: SPACING.xl,
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		borderWidth: 2,
		borderColor: "transparent",
		elevation: 2,
	},
	choiceActive: {
		borderColor: COLORS.primary,
		backgroundColor: COLORS.state.monitor.surface,
	},
	choiceLabel: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
	textPrimary: { color: COLORS.primary },
	numericContainer: { alignItems: "center" },
	numericDisplay: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: SPACING.xxxl,
		width: "100%",
		marginBottom: SPACING.lg,
	},
	numericInput: {
		fontSize: 56,
		fontWeight: "800",
		color: COLORS.textPrimary,
		textAlign: "center",
	},
	unitText: {
		fontSize: 24,
		fontWeight: "600",
		color: COLORS.textSecondary,
		marginLeft: 8,
		marginTop: 16,
	},
	numericHint: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
	footer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: COLORS.background,
		padding: SPACING.screenEdge,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	prevLink: { marginTop: SPACING.lg, alignItems: "center" },
	prevLinkText: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.textSecondary,
		textDecorationLine: "underline",
	},
});
