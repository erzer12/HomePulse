import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymptomIcon } from "@/components/icons/SymptomIcon";
import { Button } from "@/components/ui/Button";
import { MotionView } from "@/components/ui/MotionView";
import { COLORS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";

const SYMPTOM_CATEGORIES = [
	{ id: "fever", label: "Fever", icon: "Thermometer" },
	{ id: "breathing", label: "Breathing", icon: "Lungs" },
	{ id: "stomach", label: "Stomach", icon: "Droplets" },
	{ id: "hydration", label: "Dehydration", icon: "Droplet" },
	{ id: "confusion", label: "Confusion", icon: "Brain" },
	{ id: "pain", label: "Pain", icon: "Activity" },
	{ id: "weakness", label: "Weakness", icon: "Moon" },
];

export default function SelectSymptomScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const activeCase = useCaseStore((s) => s.activeCase);
	const profiles = usePatientStore((s) => s.profiles);
	const [patientName, setPatientName] = useState("the person");

	useEffect(() => {
		if (activeCase && profiles.length > 0) {
			const patient = profiles.find((p) => p.id === activeCase.patient_id);
			if (patient) setPatientName(patient.name);
		}
	}, [activeCase, profiles]);

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<Stack.Screen
				options={{
					headerShown: false,
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<MotionView duration={400}>
					<View style={styles.header}>
						<Text style={styles.question}>What is {patientName} experiencing?</Text>
						<View style={styles.disclaimer}>
							<Text style={styles.disclaimerText}>
								This app guides you through common symptoms. In case of a
								life-threatening emergency, call 112 immediately.
							</Text>
						</View>
					</View>
				</MotionView>
...

				<View style={styles.grid}>
					{SYMPTOM_CATEGORIES.map((symptom, index) => (
						<SymptomIcon
							key={symptom.id}
							label={symptom.label}
							iconName={symptom.icon}
							delay={100 + index * 40} // Staggered entry
							onPress={() => router.push("/symptom-check/questionnaire")}
						/>
					))}
				</View>

				<MotionView delay={500}>
					<View style={styles.footer}>
						<Button
							title="Call Emergency Services (112)"
							variant="outline"
							style={styles.emergencyButton}
							onPress={() => {}} // Integration for dialer
						/>
					</View>
				</MotionView>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	scrollContent: {
		padding: SPACING.screenEdge,
		paddingBottom: 40,
	},
	header: {
		marginBottom: SPACING.sectionGap,
	},
	question: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.textPrimary,
		marginBottom: SPACING.md,
	},
	disclaimer: {
		backgroundColor: COLORS.state.monitor.surface,
		padding: SPACING.md,
		borderRadius: 12,
	},
	disclaimerText: {
		fontSize: 14,
		color: COLORS.state.monitor.text,
		lineHeight: 20,
		fontWeight: "500",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: SPACING.sectionGap,
	},
	footer: {
		marginTop: "auto",
		alignItems: "center",
	},
	emergencyButton: {
		borderColor: COLORS.state.urgent.primary,
		borderWidth: 1,
	},
});
