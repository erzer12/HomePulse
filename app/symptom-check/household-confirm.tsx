import { Stack, useRouter } from "expo-router";
import { CheckCircle2, Edit3 } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TriageProcessingOverlay } from "@/components/ui/TriageProcessingOverlay";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { getDb } from "@/db/connection";
import { saveHouseholdSnapshot } from "@/db/queries/household";
import { useCaseStore } from "@/store/case";
import { useHouseholdStore } from "@/store/household";
import type { HouseholdReadiness } from "@/types/household";

const ITEMS: {
	key: keyof HouseholdReadiness;
	label: string;
	isBoolean: true;
}[] = [
	{ key: "has_thermometer", label: "Working thermometer", isBoolean: true },
	{ key: "has_oximeter", label: "Pulse oximeter", isBoolean: true },
	{
		key: "transport_available",
		label: "Reliable transport to clinic",
		isBoolean: true,
	},
	{
		key: "overnight_caregiver",
		label: "Overnight help available",
		isBoolean: true,
	},
	{
		key: "medicine_stock",
		label: "Basic meds (e.g. Paracetamol)",
		isBoolean: true,
	},
];

/**
 * Mid-triage Household Baseline Confirmation.
 * Shows the stored baseline values; user can toggle to update before engine evaluation.
 */
export default function HouseholdConfirmScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { readiness, setReadiness } = useHouseholdStore();
	const activeCase = useCaseStore((s) => s.activeCase);
	const [local, setLocal] = useState<HouseholdReadiness>({ ...readiness });
	const [saving, setSaving] = useState(false);

	const hasChanges = JSON.stringify(local) !== JSON.stringify(readiness);

	const handleConfirm = async () => {
		setSaving(true);
		// Persist updated baseline to DB and store
		setReadiness(local);
		if (activeCase) {
			try {
				const db = await getDb();
				await saveHouseholdSnapshot(db, activeCase.id, local);
			} catch {
				// Non-fatal — evaluation proceeds with the in-memory update
			}
		}
		// Run engine evaluation with updated household context
		const evaluateCase = useCaseStore.getState().evaluateCase;
		let level = 1;
		if (activeCase) {
			try {
				const output = await evaluateCase(activeCase.id);
				level = output.action_state.level;
			} catch {
				// Proceed with default routing if evaluation fails
			}
		}
		setSaving(false);
		// Route by level
		if (level === 4) {
			router.replace("/result/emergency");
		} else {
			router.push("/result/action-state");
		}
	};

	const toggle = (key: keyof HouseholdReadiness) => {
		setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: "Confirm Household Resources",
					headerStyle: { backgroundColor: COLORS.background },
					headerShadowVisible: false,
				}}
			/>

			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingBottom: insets.bottom + 100 },
				]}
			>
				<Text style={styles.subtitle}>
					Are these still accurate? We adjust our recommendations based on
					what's available at home.
				</Text>

				{hasChanges && (
					<View style={styles.changedBadge}>
						<Edit3 size={14} color={COLORS.state.care.text} />
						<Text style={styles.changedText}>
							Changes detected — will be saved
						</Text>
					</View>
				)}

				<Card variant="elevated" style={styles.listCard}>
					{ITEMS.map((item, idx) => (
						<View
							key={item.key}
							style={[styles.row, idx < ITEMS.length - 1 && styles.rowBorder]}
						>
							<View style={styles.rowContent}>
								{local[item.key] ? (
									<CheckCircle2 size={20} color={COLORS.primary} />
								) : (
									<View style={styles.emptyIcon} />
								)}
								<Text style={styles.rowLabel}>{item.label}</Text>
							</View>
							<Switch
								value={!!local[item.key]}
								onValueChange={() => toggle(item.key)}
								trackColor={{ false: COLORS.disabledBG, true: COLORS.primary }}
								thumbColor="#FFFFFF"
							/>
						</View>
					))}
				</Card>
			</ScrollView>

			<View
				style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}
			>
				<Button
					title={
						saving
							? "Saving…"
							: hasChanges
								? "Save & Continue"
								: "Looks Good — Continue"
					}
					onPress={handleConfirm}
					disabled={saving}
				/>
			</View>

			<TriageProcessingOverlay visible={saving} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	scroll: {
		padding: SPACING.screenEdge,
	},
	subtitle: {
		fontSize: 15,
		color: COLORS.textSecondary,
		lineHeight: 22,
		marginBottom: SPACING.lg,
	},
	changedBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: COLORS.state.care.surface,
		borderRadius: RADIUS.lg,
		padding: SPACING.md,
		marginBottom: SPACING.lg,
	},
	changedText: {
		fontSize: 13,
		fontWeight: "600",
		color: COLORS.state.care.text,
	},
	listCard: {
		padding: 0,
		overflow: "hidden",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: SPACING.lg,
	},
	rowBorder: {
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	rowContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		flex: 1,
	},
	emptyIcon: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: COLORS.border,
	},
	rowLabel: {
		fontSize: 15,
		fontWeight: "600",
		color: COLORS.textPrimary,
		flex: 1,
	},
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
});
