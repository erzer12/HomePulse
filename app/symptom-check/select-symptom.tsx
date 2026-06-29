import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Linking,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymptomIcon } from "@/components/icons/SymptomIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MotionView } from "@/components/ui/MotionView";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { SYMPTOMS } from "@/constants/symptoms";
import { getDb } from "@/db/connection";
import { useCaseStore } from "@/store/case";
import { usePatientStore } from "@/store/patient";

export default function SelectSymptomScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ patientId?: string }>();
	const insets = useSafeAreaInsets();
	const activeCase = useCaseStore((s) => s.activeCase);
	const activeCases = useCaseStore((s) => s.activeCases);
	const profiles = usePatientStore((s) => s.profiles);
	const loadPatients = usePatientStore((s) => s.loadPatients);
	const loadActiveCases = useCaseStore((s) => s.loadActiveCases);

	const [initialLoading, setInitialLoading] = useState(true);
	const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
		null,
	);
	const [patientName, setPatientName] = useState("the person");

	useEffect(() => {
		(async () => {
			try {
				await Promise.all([loadPatients(), loadActiveCases()]);
			} catch (e) {
				console.error("Failed to load initial data in SelectSymptomScreen:", e);
			} finally {
				setInitialLoading(false);
			}
		})();
	}, [loadPatients, loadActiveCases]);

	// Guard: redirect if there are no profiles yet
	useEffect(() => {
		if (!initialLoading && profiles.length === 0) {
			router.replace("/onboarding/create-profile");
		}
	}, [initialLoading, profiles, router]);

	// Initial selection based on parameter, activeCase, or single profile
	useEffect(() => {
		if (params.patientId) {
			setSelectedPatientId(params.patientId);
		} else if (activeCase) {
			setSelectedPatientId(activeCase.patient_id);
		} else if (profiles.length === 1) {
			setSelectedPatientId(profiles[0].id);
		}
	}, [params.patientId, activeCase, profiles]);

	useEffect(() => {
		if (selectedPatientId && profiles.length > 0) {
			const patient = profiles.find((p) => p.id === selectedPatientId);
			if (patient) setPatientName(patient.name);
		}
	}, [selectedPatientId, profiles]);

	const handleEmergencyCall = () => {
		Linking.openURL("tel:112");
	};

	const handleSymptomSelect = async (category: string) => {
		if (!selectedPatientId) return;
		try {
			// Find existing active case for this patient
			const existingCase = activeCases.find(
				(c) => c.patient_id === selectedPatientId && c.status === "active",
			);
			if (existingCase) {
				await useCaseStore.getState().selectActiveCase(existingCase.id);
			} else {
				// double-check with DB connection just in case activeCases is out of sync
				const db = await getDb();
				const dbCase = await db.getFirstAsync<{ id: string }>(
					"SELECT id FROM cases WHERE patient_id = ? AND status = 'active' LIMIT 1",
					[selectedPatientId],
				);
				if (dbCase) {
					await useCaseStore.getState().selectActiveCase(dbCase.id);
				} else {
					await useCaseStore.getState().createCaseForPatient(selectedPatientId);
				}
			}

			router.push({
				pathname: "/symptom-check/questionnaire",
				params: { category },
			});
		} catch (e) {
			console.error("Failed to set active case for symptom check:", e);
		}
	};

	if (initialLoading) {
		return (
			<View style={[styles.container, styles.center]}>
				<Stack.Screen options={{ headerShown: false }} />
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	if (!selectedPatientId) {
		return (
			<View style={[styles.container, { paddingTop: insets.top }]}>
				<Stack.Screen options={{ headerShown: false }} />
				<ScrollView contentContainerStyle={styles.scrollContent}>
					<MotionView duration={400}>
						<View style={styles.header}>
							<Text style={styles.question}>Who is this check for?</Text>
							<Text style={styles.subtitle}>
								Select a family member to begin.
							</Text>
						</View>

						<View style={styles.profileList}>
							{profiles.map((profile) => (
								<Pressable
									key={profile.id}
									onPress={() => setSelectedPatientId(profile.id)}
									style={styles.profileCardPressable}
								>
									<Card variant="elevated" style={styles.profileCard}>
										<View style={styles.profileRow}>
											<View style={styles.avatar}>
												<Text style={styles.avatarText}>{profile.name[0]}</Text>
											</View>
											<View style={styles.profileDetails}>
												<Text style={styles.profileName}>{profile.name}</Text>
												<Text style={styles.profileAgeGroup}>
													{profile.age_group.charAt(0).toUpperCase() +
														profile.age_group.slice(1)}
												</Text>
											</View>
										</View>
									</Card>
								</Pressable>
							))}
						</View>

						<Button
							title="Add Family Member"
							variant="outline"
							style={styles.addProfileButton}
							onPress={() => router.push("/onboarding/create-profile")}
						/>

						<Button
							title="Call Emergency Services (112)"
							variant="outline"
							style={styles.emergencyButton}
							onPress={handleEmergencyCall}
						/>
					</MotionView>
				</ScrollView>
			</View>
		);
	}

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
						<View style={styles.headerRow}>
							<Text
								style={[styles.question, { flex: 1, marginRight: SPACING.md }]}
							>
								What is {patientName} experiencing?
							</Text>
							{profiles.length > 1 && (
								<Pressable
									onPress={() => setSelectedPatientId(null)}
									style={styles.changeBtn}
								>
									<Text style={styles.changeBtnText}>Change</Text>
								</Pressable>
							)}
						</View>
						<View style={styles.disclaimer}>
							<Text style={styles.disclaimerText}>
								This app guides you through common symptoms. In case of a
								life-threatening emergency, call 112 immediately.
							</Text>
						</View>
					</View>
				</MotionView>

				<View style={styles.grid}>
					{SYMPTOMS.map((symptom, index) => (
						<SymptomIcon
							key={symptom.category}
							label={symptom.label}
							iconName={symptom.iconName}
							delay={100 + index * 40} // Staggered entry
							onPress={() => handleSymptomSelect(symptom.category)}
						/>
					))}
				</View>

				<MotionView delay={500}>
					<View style={styles.footer}>
						<Button
							title="Call Emergency Services (112)"
							variant="outline"
							style={styles.emergencyButton}
							onPress={handleEmergencyCall}
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
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		marginTop: SPACING.xs,
		marginBottom: SPACING.md,
	},
	disclaimer: {
		backgroundColor: COLORS.state.monitor.surface,
		padding: SPACING.md,
		borderRadius: RADIUS.xxl,
		marginTop: SPACING.md,
	},
	disclaimerText: {
		fontSize: 14,
		color: COLORS.state.monitor.text,
		lineHeight: 20,
		fontWeight: "500",
	},
	profileList: {
		marginBottom: SPACING.lg,
	},
	profileCardPressable: {
		marginBottom: SPACING.md,
	},
	profileCard: {
		padding: SPACING.md,
		borderRadius: RADIUS.xxl,
	},
	profileRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: COLORS.state.monitor.surface,
		alignItems: "center",
		justifyContent: "center",
		marginRight: SPACING.md,
	},
	avatarText: {
		fontSize: 20,
		fontWeight: "bold",
		color: COLORS.state.monitor.primary,
	},
	profileDetails: {
		flex: 1,
	},
	profileName: {
		fontSize: 18,
		fontWeight: "600",
		color: COLORS.textPrimary,
	},
	profileAgeGroup: {
		fontSize: 14,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	addProfileButton: {
		marginBottom: SPACING.md,
		borderRadius: RADIUS.xxl,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SPACING.md,
	},
	changeBtn: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 16,
		backgroundColor: COLORS.border,
	},
	changeBtnText: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.primary,
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
		borderRadius: RADIUS.xxl,
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
});
