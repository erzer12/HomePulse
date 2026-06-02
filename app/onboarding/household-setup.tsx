import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Activity, Car, Moon, Pill, Thermometer } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useCaseStore } from "@/store/case";
import { useHouseholdStore } from "@/store/household";
import { getDb } from "@/db/connection";
import { saveHouseholdSnapshot } from "@/db/queries/household";
import type { SQLiteDatabase } from "@/db/connection";

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

export default function HouseholdSetupScreen() {
	const router = useRouter();
	const { patientId } = useLocalSearchParams<{ patientId: string }>();
	
	const createCaseForPatient = useCaseStore((s) => s.createCaseForPatient);
	const setReadiness = useHouseholdStore((s) => s.setReadiness);

	const [loading, setLoading] = useState(false);
	const [resources, setResources] = useState({
		thermometer: true,
		oximeter: false,
		transport: true,
		caregiver: true,
		medicine: true,
	});
	const [distance, setDistance] = useState("1.5");

	const handleComplete = async () => {
		if (!patientId) {
			Alert.alert("Error", "No patient profile found. Please restart the setup.");
			router.replace("/onboarding/create-profile");
			return;
		}

		setLoading(true);
		try {
			// 1. Create a new case for this patient
			const newCase = await createCaseForPatient(patientId);

			// 2. Prepare readiness object
			const readiness = {
				has_thermometer: resources.thermometer,
				has_oximeter: resources.oximeter,
				transport_available: resources.transport,
				pharmacy_distance_km: parseFloat(distance) || 0,
				overnight_caregiver: resources.caregiver,
				medicine_stock: resources.medicine,
			};

			// 3. Save snapshot to DB
			const db = await getDb();
			await saveHouseholdSnapshot(db as unknown as SQLiteDatabase, newCase.id, readiness);

			// 4. Update global store
			setReadiness(readiness);

			router.replace("/(tabs)/home");
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
					title: "Step 2 of 2",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
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
						title={loading ? "Completing..." : "Complete Setup"}
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
});
