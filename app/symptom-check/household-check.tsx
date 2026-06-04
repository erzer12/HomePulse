import { Stack, useRouter } from "expo-router";
import {
	Activity,
	Car,
	MapPin,
	Moon,
	Pill,
	Thermometer,
} from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { useHouseholdStore } from "@/store/household";
import { useCaseStore } from "@/store/case";
import { getDb } from "@/db/connection";
import { saveHouseholdSnapshot } from "@/db/queries/household";
import type { SQLiteDatabase } from "@/db/connection";

interface ReadinessRowProps {
	label: string;
	icon: React.ReactNode;
	available: boolean;
}

function ReadinessRow({ label, icon, available }: ReadinessRowProps) {
	return (
		<View style={styles.row}>
			<View
				style={[
					styles.iconBox,
					{
						backgroundColor: available
							? COLORS.state.monitor.surface
							: COLORS.disabledBG,
					},
				]}
			>
				{icon}
			</View>
			<Text style={styles.rowLabel}>{label}</Text>
			<View
				style={[
					styles.statusBadge,
					{
						backgroundColor: available
							? COLORS.state.monitor.primary
							: COLORS.disabledText,
					},
				]}
			>
				<Text style={styles.statusText}>{available ? "YES" : "NO"}</Text>
			</View>
		</View>
	);
}

export default function HouseholdCheckScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const readiness = useHouseholdStore((s) => s.readiness);
	const activeCase = useCaseStore((s) => s.activeCase);
	const evaluateCase = useCaseStore((s) => s.evaluateCase);
	const [loading, setLoading] = useState(false);

	const handleConfirm = async () => {
		if (!activeCase) {
			router.push("/result/action-state");
			return;
		}

		setLoading(true);
		try {
			const db = await getDb();
			await saveHouseholdSnapshot(
				db as unknown as SQLiteDatabase,
				activeCase.id,
				readiness
			);
			// Re-evaluate with the confirmed household resources
			await evaluateCase(activeCase.id);
			router.push("/result/action-state");
		} catch (e) {
			console.error("Failed to confirm household status", e);
			router.push("/result/action-state"); // Fallback
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<Stack.Screen
				options={{
					title: "Household Check",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
				}}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Text style={styles.title}>Quick Check</Text>
					<Text style={styles.subtitle}>
						Are these resources still correct? We use this to adjust our advice.
					</Text>
				</View>

				<Card variant="elevated" style={styles.checklistCard}>
					<ReadinessRow
						label="Working Thermometer"
						icon={
							<Thermometer
								size={20}
								color={
									readiness.has_thermometer ? COLORS.primary : COLORS.textSecondary
								}
							/>
						}
						available={readiness.has_thermometer}
					/>
					<ReadinessRow
						label="Pulse Oximeter"
						icon={
							<Activity
								size={20}
								color={
									readiness.has_oximeter ? COLORS.primary : COLORS.textSecondary
								}
							/>
						}
						available={readiness.has_oximeter}
					/>
					<ReadinessRow
						label="Reliable Transport"
						icon={
							<Car
								size={20}
								color={
									readiness.transport_available ? COLORS.primary : COLORS.textSecondary
								}
							/>
						}
						available={readiness.transport_available}
					/>
					<ReadinessRow
						label="Overnight Help"
						icon={
							<Moon
								size={20}
								color={
									readiness.overnight_caregiver ? COLORS.primary : COLORS.textSecondary
								}
							/>
						}
						available={readiness.overnight_caregiver}
					/>
					<ReadinessRow
						label="Basic Meds Stocked"
						icon={
							<Pill
								size={20}
								color={
									readiness.medicine_stock ? COLORS.primary : COLORS.textSecondary
								}
							/>
						}
						available={readiness.medicine_stock}
					/>
					<View style={[styles.row, styles.noBorder]}>
						<View style={styles.iconBox}>
							<MapPin size={20} color={COLORS.primary} />
						</View>
						<Text style={styles.rowLabel}>Pharmacy Distance</Text>
						<Text style={styles.distanceValue}>{readiness.pharmacy_distance_km} km</Text>
					</View>
				</Card>

				<View style={styles.footer}>
					<Button
						title={loading ? "Analyzing..." : "All Correct — Analyze Results"}
						onPress={handleConfirm}
						disabled={loading}
					/>
					<Button
						title="Update Resources"
						variant="outline"
						onPress={() => router.push("/onboarding/household-setup")}
						style={styles.updateButton}
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
		marginTop: 8,
		lineHeight: 22,
	},
	checklistCard: {
		padding: 0,
		overflow: "hidden",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		padding: SPACING.lg,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	noBorder: {
		borderBottomWidth: 0,
	},
	iconBox: {
		width: 36,
		height: 36,
		borderRadius: RADIUS.md,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.md,
	},
	rowLabel: {
		flex: 1,
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.textPrimary,
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: RADIUS.full,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "800",
		color: "#FFFFFF",
	},
	distanceValue: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.primary,
	},
	footer: {
		marginTop: SPACING.xl,
	},
	updateButton: {
		marginTop: SPACING.md,
		borderStyle: "dashed",
	},
});
