import { Stack } from "expo-router";
import {
	Bell,
	ChevronRight,
	Download,
	Info,
	ShieldCheck,
	Trash2,
} from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { truncateDatabase } from "@/db/connection";
import * as Updates from "expo-updates";

interface SettingsRowProps {
	label: string;
	icon: React.ReactNode;
	children?: React.ReactNode;
	onPress?: () => void;
	showChevron?: boolean;
	destructive?: boolean;
}

function SettingsRow({
	label,
	icon,
	children,
	onPress,
	showChevron = true,
	destructive = false,
}: SettingsRowProps) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
		>
			<View style={[styles.rowIcon, destructive && styles.destructiveBG]}>
				{icon}
			</View>
			<Text style={[styles.rowLabel, destructive && styles.destructiveText]}>
				{label}
			</Text>
			<View style={styles.rowContent}>
				{children}
				{showChevron && !children && (
					<ChevronRight size={20} color={COLORS.textSecondary} />
				)}
			</View>
		</Pressable>
	);
}

export default function SettingsScreen() {
	const insets = useSafeAreaInsets();
	const [reminders, setReminders] = useState(true);
	const [alerts, setAlerts] = useState(true);
	const [language, setLanguage] = useState("en");

	const handleClearData = () => {
		Alert.alert(
			"Clear All Data",
			"Are you sure? This will permanently delete all patient profiles, history, and active cases. The app will restart.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete Everything",
					style: "destructive",
					onPress: async () => {
						try {
							await truncateDatabase();
							// Restart app to clear all memory stores
							await Updates.reloadAsync();
						} catch (e) {
							console.error("Failed to clear data", e);
						}
					},
				},
			],
		);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<Stack.Screen options={{ headerShown: false }} />

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Text style={styles.title}>Settings</Text>
				</View>

				{/* Section 1: Account */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account</Text>
					<Card variant="elevated" style={styles.accountCard}>
						<View style={styles.avatarLarge}>
							<Text style={styles.avatarTextLarge}>C</Text>
						</View>
						<View style={styles.accountInfo}>
							<Text style={styles.accountName}>Caregiver</Text>
							<Pressable>
								<Text style={styles.editLink}>Primary Account</Text>
							</Pressable>
						</View>
					</Card>
				</View>

				{/* Section 2: Notifications */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Notifications</Text>
					<Card variant="elevated" style={styles.groupCard}>
						<SettingsRow
							label="Recheck Reminders"
							icon={<Bell size={20} color={COLORS.primary} />}
							showChevron={false}
						>
							<Switch
								value={reminders}
								onValueChange={setReminders}
								trackColor={{ false: COLORS.disabledBG, true: COLORS.primary }}
							/>
						</SettingsRow>
						<SettingsRow
							label="Critical Alerts"
							icon={<ShieldCheck size={20} color={COLORS.primary} />}
							showChevron={false}
						>
							<Switch
								value={alerts}
								onValueChange={setAlerts}
								trackColor={{ false: COLORS.disabledBG, true: COLORS.primary }}
							/>
						</SettingsRow>
					</Card>
				</View>

				{/* Section 3: Language */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>App Language</Text>
					<View style={styles.languageGrid}>
						<Pressable
							onPress={() => setLanguage("en")}
							style={[
								styles.langChip,
								language === "en" && styles.langChipActive,
							]}
						>
							<Text
								style={[
									styles.langText,
									language === "en" && styles.langTextActive,
								]}
							>
								English
							</Text>
						</Pressable>
						<Pressable
							onPress={() => setLanguage("hi")}
							style={[
								styles.langChip,
								language === "hi" && styles.langChipActive,
							]}
						>
							<Text
								style={[
									styles.langText,
									language === "hi" && styles.langTextActive,
								]}
							>
								हिंदी (Hindi)
							</Text>
						</Pressable>
					</View>
				</View>

				{/* Section 4: Data & Export */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Data Management</Text>
					<Card variant="elevated" style={styles.groupCard}>
						<SettingsRow
							label="Export All Health Data"
							icon={<Download size={20} color={COLORS.textPrimary} />}
							onPress={() => Alert.alert("Coming Soon", "Health data export will be available in the next release.")}
						/>
						<SettingsRow
							label="Clear All Data"
							icon={<Trash2 size={20} color={COLORS.state.urgent.primary} />}
							destructive
							showChevron={false}
							onPress={handleClearData}
						/>
					</Card>
				</View>

				{/* Section 5: About */}
				<View style={styles.aboutSection}>
					<Text style={styles.versionText}>
						HomePulse v1.0.0
					</Text>
					<Pressable style={styles.legalLink}>
						<Text style={styles.legalText}>Legal & Privacy Policy</Text>
					</Pressable>
					<View style={styles.disclaimerBox}>
						<Info size={16} color={COLORS.textSecondary} />
						<Text style={styles.disclaimerText}>
							This app is a decision support tool and does not provide medical
							diagnosis.
						</Text>
					</View>
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
		paddingBottom: 120,
	},
	header: {
		marginBottom: SPACING.sectionGap,
	},
	title: {
		fontSize: 32,
		fontWeight: "800",
		color: COLORS.textPrimary,
	},
	section: {
		marginBottom: SPACING.sectionGap,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textSecondary,
		textTransform: "uppercase",
		marginBottom: SPACING.md,
		letterSpacing: 0.5,
	},
	accountCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: SPACING.lg,
	},
	avatarLarge: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.lg,
	},
	avatarTextLarge: {
		fontSize: 28,
		fontWeight: "800",
		color: "#FFFFFF",
	},
	accountInfo: {
		flex: 1,
	},
	accountName: {
		fontSize: 22,
		fontWeight: "800",
		color: COLORS.textPrimary,
	},
	editLink: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.primary,
		marginTop: 2,
	},
	groupCard: {
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
	rowPressed: {
		backgroundColor: "rgba(0,0,0,0.02)",
	},
	rowIcon: {
		width: 40,
		height: 40,
		borderRadius: RADIUS.md,
		backgroundColor: COLORS.background,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.md,
	},
	rowLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.textPrimary,
		flex: 1,
	},
	rowContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	destructiveBG: {
		backgroundColor: COLORS.state.urgent.surface,
	},
	destructiveText: {
		color: COLORS.state.urgent.primary,
	},
	languageGrid: {
		flexDirection: "row",
		gap: SPACING.md,
	},
	langChip: {
		flex: 1,
		height: 56,
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.xl,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "transparent",
		elevation: 2,
	},
	langChipActive: {
		borderColor: COLORS.primary,
		backgroundColor: COLORS.state.monitor.surface,
	},
	langText: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.textSecondary,
	},
	langTextActive: {
		color: COLORS.primary,
	},
	aboutSection: {
		alignItems: "center",
		marginTop: SPACING.xl,
	},
	versionText: {
		fontSize: 14,
		color: COLORS.textSecondary,
		fontWeight: "600",
	},
	legalLink: {
		marginTop: 8,
	},
	legalText: {
		fontSize: 14,
		color: COLORS.primary,
		textDecorationLine: "underline",
	},
	disclaimerBox: {
		flexDirection: "row",
		marginTop: 32,
		backgroundColor: "rgba(0,0,0,0.03)",
		padding: SPACING.md,
		borderRadius: RADIUS.md,
		alignItems: "center",
	},
	disclaimerText: {
		flex: 1,
		fontSize: 12,
		color: COLORS.textSecondary,
		marginLeft: SPACING.sm,
		lineHeight: 16,
	},
});
