import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PermissionPromptModal } from "@/components/ui/PermissionPromptModal";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { usePatientStore } from "@/store/patient";
import type { AgeGroup } from "@/types/triage";

const AGE_GROUPS: { id: AgeGroup; label: string; range: string }[] = [
	{ id: "infant", label: "Infant", range: "0-1 yr" },
	{ id: "child", label: "Child", range: "1-12 yrs" },
	{ id: "adult", label: "Adult", range: "13-65 yrs" },
	{ id: "elderly", label: "Elderly", range: "65+ yrs" },
];

const CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Pregnancy", "None"];

export default function CreateProfileScreen() {
	const router = useRouter();
	const { profileId } = useLocalSearchParams<{ profileId?: string }>();

	const createPatient = usePatientStore((s) => s.createPatient);
	const updatePatient = usePatientStore((s) => s.updatePatient);
	const profiles = usePatientStore((s) => s.profiles);
	const loadPatients = usePatientStore((s) => s.loadPatients);

	const [loading, setLoading] = useState(false);
	const [permissionVisible, setPermissionVisible] = useState(false);
	const [savedPatientId, setSavedPatientId] = useState<string | null>(null);

	const [name, setName] = useState("");
	const [selectedAge, setSelectedAge] = useState<AgeGroup>("child");
	const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
	const [allergies, setAllergies] = useState("");
	const [contactName, setContactName] = useState("");
	const [contactPhone, setContactPhone] = useState("");

	useEffect(() => {
		loadPatients();
	}, [loadPatients]);

	useEffect(() => {
		if (profileId && profiles.length > 0) {
			const p = profiles.find((x) => x.id === profileId);
			if (p) {
				setName(p.name);
				setSelectedAge(p.age_group);
				setSelectedConditions(
					p.chronic_conditions.length > 0 ? p.chronic_conditions : ["None"],
				);
				setAllergies(p.allergies?.join(", ") || "");
				setContactName(p.emergency_contact_name || "");
				setContactPhone(p.emergency_contact_phone || "");
			}
		}
	}, [profileId, profiles]);

	const toggleCondition = (condition: string) => {
		if (condition === "None") {
			setSelectedConditions(["None"]);
		} else {
			setSelectedConditions((prev) => {
				const filtered = prev.filter((c) => c !== "None");
				return filtered.includes(condition)
					? filtered.filter((c) => c !== condition)
					: [...filtered, condition];
			});
		}
	};

	const handleSave = async () => {
		if (!name.trim()) {
			Alert.alert("Required", "Please enter a name.");
			return;
		}

		setLoading(true);
		try {
			const payload = {
				name: name.trim(),
				age_group: selectedAge,
				chronic_conditions: selectedConditions.filter((c) => c !== "None"),
				allergies: allergies
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean),
				emergency_contact_name: contactName.trim() || null,
				emergency_contact_phone: contactPhone.trim() || null,
			};

			if (profileId) {
				await updatePatient(profileId, payload);
				Alert.alert("Success", "Profile updated successfully.");
				router.replace("/(tabs)/profiles");
			} else {
				const patient = await createPatient(payload);
				setSavedPatientId(patient.id);
				// Mark first-run complete so _layout.tsx routes to auth/gateway on next launch
				await AsyncStorage.setItem("first_run_completed", "1").catch(
					() => null,
				);
				setPermissionVisible(true);
			}
		} catch (err) {
			Alert.alert("Error", "Failed to save profile. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleRequestPermission = async () => {
		setPermissionVisible(false);
		try {
			const Notifications = require("expo-notifications");
			await Notifications.requestPermissionsAsync();
		} catch {
			// Ignore if not supported in simulator/env
		}
		router.replace({
			pathname: "/onboarding/household-setup",
			params: { patientId: savedPatientId || "" },
		});
	};

	const handleSkipPermission = () => {
		setPermissionVisible(false);
		router.replace({
			pathname: "/onboarding/household-setup",
			params: { patientId: savedPatientId || "" },
		});
	};

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					title: profileId ? "Edit Profile" : "Step 2 of 3",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{!profileId && (
					<View style={styles.stepBar}>
						<View style={styles.stepDot} />
						<View style={[styles.stepDot, styles.stepActive]} />
						<View style={styles.stepDot} />
					</View>
				)}

				<View style={styles.header}>
					<Text style={styles.title}>
						{profileId ? "Edit Patient Profile" : "Create Patient Profile"}
					</Text>
					<Text style={styles.subtitle}>
						{profileId
							? "Update details for the person you are caring for."
							: "Tell us about the person you are caring for."}
					</Text>
				</View>

				<Card variant="elevated" style={styles.formCard}>
					<Text style={styles.label}>Who are you caring for?</Text>
					<TextInput
						style={styles.input}
						placeholder="Enter name"
						placeholderTextColor={COLORS.textSecondary}
						value={name}
						onChangeText={setName}
					/>
				</Card>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Age Group</Text>
					<View style={styles.ageGrid}>
						{AGE_GROUPS.map((group) => (
							<Pressable
								key={group.id}
								onPress={() => setSelectedAge(group.id)}
								style={[
									styles.ageTile,
									selectedAge === group.id && styles.selectedTile,
								]}
							>
								<Text
									style={[
										styles.ageLabel,
										selectedAge === group.id && styles.selectedText,
									]}
								>
									{group.label}
								</Text>
								<Text
									style={[
										styles.ageRange,
										selectedAge === group.id && styles.selectedRange,
									]}
								>
									{group.range}
								</Text>
							</Pressable>
						))}
					</View>
				</View>

				<Card variant="elevated" style={styles.formCard}>
					<Text style={styles.label}>Known Medical Conditions</Text>
					<View style={styles.chipGrid}>
						{CONDITIONS.map((c) => (
							<Pressable
								key={c}
								onPress={() => toggleCondition(c)}
								style={[
									styles.chip,
									selectedConditions.includes(c) && styles.selectedChip,
								]}
							>
								<Text
									style={[
										styles.chipText,
										selectedConditions.includes(c) && styles.selectedText,
									]}
								>
									{c}
								</Text>
							</Pressable>
						))}
					</View>

					<Text style={[styles.label, styles.mt]}>Allergies</Text>
					<TextInput
						style={styles.input}
						placeholder="e.g. Penicillin, Peanuts"
						placeholderTextColor={COLORS.textSecondary}
						value={allergies}
						onChangeText={setAllergies}
					/>
				</Card>

				<Card variant="elevated" style={styles.formCard}>
					<Text style={styles.label}>Emergency Contact</Text>
					<TextInput
						style={styles.input}
						placeholder="Contact Name"
						placeholderTextColor={COLORS.textSecondary}
						value={contactName}
						onChangeText={setContactName}
					/>
					<TextInput
						style={[styles.input, styles.mtSmall]}
						placeholder="Phone Number"
						keyboardType="phone-pad"
						placeholderTextColor={COLORS.textSecondary}
						value={contactPhone}
						onChangeText={setContactPhone}
					/>
				</Card>

				<View style={styles.footer}>
					<Button
						title={
							loading
								? "Saving..."
								: profileId
									? "Save Changes"
									: "Save & Continue"
						}
						onPress={handleSave}
						disabled={loading}
					/>
				</View>
			</ScrollView>

			<PermissionPromptModal
				visible={permissionVisible}
				type="notifications"
				reason="We need permission to send you local notifications so you don't forget to recheck vitals like temperature and hydration."
				onAllow={handleRequestPermission}
				onCancel={handleSkipPermission}
			/>
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
		marginTop: 4,
	},
	formCard: {
		marginBottom: SPACING.lg,
	},
	label: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textPrimary,
		marginBottom: SPACING.md,
	},
	input: {
		backgroundColor: COLORS.background,
		borderRadius: RADIUS.lg,
		padding: SPACING.lg,
		fontSize: 16,
		color: COLORS.textPrimary,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	section: {
		marginBottom: SPACING.sectionGap,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.textPrimary,
		marginBottom: SPACING.lg,
	},
	ageGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	ageTile: {
		width: "48%",
		backgroundColor: COLORS.surfaceElevated,
		padding: SPACING.lg,
		borderRadius: RADIUS.xl,
		marginBottom: SPACING.md,
		borderWidth: 2,
		borderColor: "transparent",
		alignItems: "center",
		elevation: 2,
	},
	selectedTile: {
		borderColor: COLORS.primary,
		backgroundColor: COLORS.state.monitor.surface,
	},
	ageLabel: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.textPrimary,
	},
	ageRange: {
		fontSize: 12,
		color: COLORS.textSecondary,
	},
	selectedText: {
		color: COLORS.primary,
	},
	selectedRange: {
		color: COLORS.primary,
		opacity: 0.8,
	},
	chipGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	chip: {
		backgroundColor: COLORS.background,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: RADIUS.full,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	selectedChip: {
		backgroundColor: COLORS.state.monitor.surface,
		borderColor: COLORS.primary,
	},
	chipText: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.textSecondary,
	},
	mt: {
		marginTop: SPACING.xl,
	},
	mtSmall: {
		marginTop: SPACING.md,
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
