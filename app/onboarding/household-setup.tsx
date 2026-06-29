import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Activity, Car, Moon, Pill, Thermometer } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { getDb } from "@/db/connection";
import { saveHouseholdSnapshot } from "@/db/queries/household";
import { useCaseStore } from "@/store/case";
import { useHouseholdStore } from "@/store/household";

interface ResourceToggleProps {
	label: string;
	icon: React.ReactNode;
	value: boolean;
	onValueChange: (val: boolean) => void;
}

function ResourceToggle({
	label,
	icon,
	value,
	onValueChange,
}: ResourceToggleProps) {
	return (
		<Card style={styles.toggleCard}>
			<View style={styles.iconBox}>{icon}</View>
			<View style={styles.textBox}>
				<Text style={styles.toggleLabel}>{label}</Text>
			</View>
			<Switch
				value={value}
				onValueChange={onValueChange}
				trackColor={{ false: COLORS.disabledBG, true: COLORS.primary }}
				thumbColor={value ? "#FFFFFF" : "#F4F3F4"}
			/>
		</Card>
	);
}

const DEFAULT_READINESS = {
	has_thermometer: false,
	has_oximeter: false,
	transport_available: true,
	pharmacy_distance_km: 5,
	overnight_caregiver: true,
	medicine_stock: false,
};

export default function HouseholdSetupScreen() {
	const router = useRouter();
	const { patientId, mode, activeCaseId } = useLocalSearchParams<{
		patientId?: string;
		mode?: string;
		activeCaseId?: string;
	}>();

	const createCaseForPatient = useCaseStore((s) => s.createCaseForPatient);
	const setReadiness = useHouseholdStore((s) => s.setReadiness);

	const [loading, setLoading] = useState(false);

	const handleSkip = async () => {
		// Apply defaults and flag that baseline was skipped
		setReadiness(DEFAULT_READINESS);
		await AsyncStorage.setItem("household_skipped", "1").catch(() => null);
		router.replace("/(tabs)/home");
	};
	const [resources, setResources] = useState({
		thermometer: true,
		oximeter: false,
		transport: true,
		caregiver: true,
		medicine: true,
	});
	const [distance, setDistance] = useState("1.5");

	const handleComplete = async () => {
		const isEdit = mode === "edit";
		const id = Array.isArray(patientId) ? patientId[0] : patientId;
		if (!isEdit && !id) {
			Alert.alert(
				"Error",
				"No patient profile found. Please restart the setup.",
			);
			router.replace("/onboarding/create-profile");
			return;
		}

		const distVal = parseFloat(distance);
		if (Number.isNaN(distVal) || distVal < 0 || distVal > 1000) {
			Alert.alert(
				"Invalid Distance",
				"Please enter a valid pharmacy distance between 0 and 1000 km.",
			);
			return;
		}

		setLoading(true);
		try {
			// 1. Prepare readiness object
			const readiness = {
				has_thermometer: resources.thermometer,
				has_oximeter: resources.oximeter,
				transport_available: resources.transport,
				pharmacy_distance_km: distVal,
				overnight_caregiver: resources.caregiver,
				medicine_stock: resources.medicine,
			};

			const db = await getDb();

			if (isEdit) {
				// Update baseline store
				setReadiness(readiness);
				if (activeCaseId) {
					await saveHouseholdSnapshot(db, activeCaseId, readiness);
				}
				router.back();
			} else {
				// 1. Create a new case for this patient (only in onboarding)
				const newCase = await createCaseForPatient(id as string);
				// 2. Save snapshot to DB
				await saveHouseholdSnapshot(db, newCase.id, readiness);
				// 3. Update global store
				setReadiness(readiness);
				router.replace("/(tabs)/home");
			}
		} catch (err) {
			Alert.alert("Error", "Failed to complete setup. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					title: mode === "edit" ? "Update Resources" : "Step 3 of 3",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
					headerRight: () =>
						mode === "edit" ? (
							<Pressable
								onPress={() => router.back()}
								style={{ marginRight: SPACING.md }}
								accessibilityRole="button"
								accessibilityLabel="Cancel updating resources"
							>
								<Text
									style={{
										color: COLORS.textSecondary,
										fontWeight: "700",
										fontSize: 15,
									}}
								>
									Cancel
								</Text>
							</Pressable>
						) : (
							<Pressable
								onPress={handleSkip}
								style={{ marginRight: SPACING.md }}
								accessibilityRole="button"
								accessibilityLabel="Skip household setup"
							>
								<Text
									style={{
										color: COLORS.primary,
										fontWeight: "700",
										fontSize: 15,
									}}
								>
									Skip
								</Text>
							</Pressable>
						),
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{mode !== "edit" && (
					<View style={styles.stepBar}>
						<View style={styles.stepDot} />
						<View style={styles.stepDot} />
						<View style={[styles.stepDot, styles.stepActive]} />
					</View>
				)}

				<View style={styles.header}>
					<Text style={styles.title}>Your Resources</Text>
					<Text style={styles.subtitle}>
						We adjust our recommendations based on what you have at home right
						now.
					</Text>
				</View>

				<ResourceToggle
					label="Working thermometer?"
					icon={<Thermometer color={COLORS.primary} />}
					value={resources.thermometer}
					onValueChange={(v) => setResources((r) => ({ ...r, thermometer: v }))}
				/>
				<ResourceToggle
					label="Pulse oximeter?"
					icon={<Activity color={COLORS.primary} />}
					value={resources.oximeter}
					onValueChange={(v) => setResources((r) => ({ ...r, oximeter: v }))}
				/>
				<ResourceToggle
					label="Reliable transport to clinic?"
					icon={<Car color={COLORS.primary} />}
					value={resources.transport}
					onValueChange={(v) => setResources((r) => ({ ...r, transport: v }))}
				/>
				<ResourceToggle
					label="Overnight help available?"
					icon={<Moon color={COLORS.primary} />}
					value={resources.caregiver}
					onValueChange={(v) => setResources((r) => ({ ...r, caregiver: v }))}
				/>
				<ResourceToggle
					label="Basic meds (e.g. Paracetamol)?"
					icon={<Pill color={COLORS.primary} />}
					value={resources.medicine}
					onValueChange={(v) => setResources((r) => ({ ...r, medicine: v }))}
				/>

				<Card variant="elevated" style={styles.pharmacyCard}>
					<Text style={styles.label}>Nearest Pharmacy Distance (km)</Text>
					<TextInput
						style={styles.distanceInput}
						value={distance}
						onChangeText={setDistance}
						keyboardType="decimal-pad"
						placeholder="1.5"
					/>
					<Text style={styles.hint}>Used for medicine and supply timing.</Text>
				</Card>

				<View style={styles.footer}>
					<Button
						title={
							loading
								? "Saving..."
								: mode === "edit"
									? "Save Resources"
									: "Complete Setup"
						}
						onPress={handleComplete}
						disabled={loading}
					/>
				</View>
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
	title: {
		fontSize: 32,
		fontWeight: "800",
		color: COLORS.textPrimary,
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		lineHeight: 22,
		marginTop: 8,
	},
	toggleCard: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.md,
		padding: SPACING.lg,
	},
	iconBox: {
		width: 44,
		height: 44,
		backgroundColor: COLORS.state.monitor.surface,
		borderRadius: RADIUS.lg,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.md,
	},
	textBox: {
		flex: 1,
	},
	toggleLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.textPrimary,
	},
	pharmacyCard: {
		marginTop: SPACING.lg,
		marginBottom: SPACING.sectionGap,
	},
	label: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textPrimary,
		marginBottom: 8,
	},
	distanceInput: {
		backgroundColor: COLORS.background,
		borderRadius: RADIUS.lg,
		padding: SPACING.lg,
		fontSize: 24,
		fontWeight: "800",
		color: COLORS.primary,
		textAlign: "center",
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	hint: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginTop: 8,
		textAlign: "center",
	},
	footer: {
		marginTop: SPACING.xl,
	},
	stepBar: {
		flexDirection: "row",
		gap: 6,
		marginBottom: SPACING.xxl,
	},
	stepDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.border,
	},
	stepActive: {
		backgroundColor: COLORS.primary,
		width: 24,
	},
});
