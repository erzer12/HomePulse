import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@supabase/supabase-js";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import * as Updates from "expo-updates";
import {
	Bell,
	ChevronRight,
	Download,
	Info,
	ShieldCheck,
	Trash2,
	Users,
} from "lucide-react-native";
import type React from "react";
import { useCallback, useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	Share,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { getDb, truncateDatabase } from "@/db/connection";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import i18n from "@/i18n";
import { signInWithGoogle, supabase } from "@/services/supabase";
import { useCaseStore } from "@/store/case";

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
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const activeCase = useCaseStore((s) => s.activeCase);
	const { isConnected } = useNetworkStatus();

	const [reminders, setReminders] = useState(true);
	const [alerts, setAlerts] = useState(true);
	const [language, setLanguage] = useState(i18n.language || "en");
	const [wipeDialogVisible, setWipeDialogVisible] = useState(false);
	const [exporting, setExporting] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	useFocusEffect(
		useCallback(() => {
			supabase.auth.getSession().then(({ data }) => {
				setUser(data.session?.user ?? null);
			});

			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange((_event, session) => {
				setUser(session?.user ?? null);
			});

			return () => subscription.unsubscribe();
		}, []),
	);

	const handleGoogleLogin = async () => {
		if (!isConnected) {
			Alert.alert(
				"Connection Required",
				"An active internet connection is required to complete Google Sign In. Please connect to the internet or unlock with biometrics.",
			);
			return;
		}

		try {
			await signInWithGoogle();
		} catch (e: unknown) {
			console.error("Google Sign-in failed", e);
			Alert.alert(
				"Sign In Failed",
				"Could not complete Google Sign-in. Please try again.",
			);
		}
	};

	const handleSignOut = async () => {
		try {
			await supabase.auth.signOut();
			setUser(null);
			Alert.alert(
				"Signed Out",
				"You have signed out of your Google Account successfully.",
			);
		} catch (e) {
			console.error("Sign out failed", e);
			Alert.alert("Error", "Could not sign out of Google Account.");
		}
	};

	const handleLanguageChange = (lang: string) => {
		setLanguage(lang);
		void i18n.changeLanguage(lang);
	};

	const handleClearData = () => {
		setWipeDialogVisible(true);
	};

	const executeWipe = async () => {
		setWipeDialogVisible(false);
		try {
			// Set the wipe_in_progress flag to '1' in AsyncStorage before deleting SQLite tables
			await AsyncStorage.setItem("wipe_in_progress", "1").catch(() => null);
			await truncateDatabase();
			// Remove flag since it completed successfully
			await AsyncStorage.removeItem("wipe_in_progress").catch(() => null);
			// Reload the app to clean all store caches
			await Updates.reloadAsync();
		} catch (e) {
			console.error("Failed to clear data", e);
			Alert.alert("Wipe Failed", "An error occurred while wiping database.");
		}
	};

	const handleExportData = async () => {
		setExporting(true);
		try {
			const db = await getDb();
			const patients = await db.getAllAsync("SELECT * FROM patients");
			const cases = await db.getAllAsync("SELECT * FROM cases");
			const symptomEntries = await db.getAllAsync(
				"SELECT * FROM symptom_entries",
			);
			const snapshots = await db.getAllAsync(
				"SELECT * FROM household_snapshots",
			);
			const tasks = await db.getAllAsync("SELECT * FROM caregiver_tasks");
			const syncQueue = await db.getAllAsync("SELECT * FROM sync_queue");

			const data = {
				exported_at: Date.now(),
				patients,
				cases,
				symptom_entries: symptomEntries,
				household_snapshots: snapshots,
				caregiver_tasks: tasks,
				sync_queue: syncQueue,
			};

			const message = JSON.stringify(data, null, 2);
			await Share.share({
				title: "HomePulse Health Data Export",
				message,
			});
		} catch (e) {
			Alert.alert("Export Failed", "Could not export database data.");
			console.error(e);
		} finally {
			setExporting(false);
		}
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
							<Text style={styles.avatarTextLarge}>
								{user ? user.email?.[0]?.toUpperCase() || "G" : "C"}
							</Text>
						</View>
						<View style={styles.accountInfo}>
							<Text style={styles.accountName} numberOfLines={1}>
								{user
									? user.user_metadata?.full_name || user.email
									: "Caregiver (Local)"}
							</Text>
							<Text style={styles.accountSubtitle}>
								{user ? "Cloud Sync Active" : "Local Only — Sign in to sync"}
							</Text>
							<Pressable
								onPress={user ? handleSignOut : handleGoogleLogin}
								style={styles.authLinkPressable}
							>
								<Text style={styles.editLink}>
									{user ? "Sign Out" : "Link Google Account"}
								</Text>
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
							onPress={() => handleLanguageChange("en")}
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
							onPress={() => handleLanguageChange("hi")}
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

				{/* Section: Sharing */}
				{activeCase && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Sharing</Text>
						<Card variant="elevated" style={styles.groupCard}>
							<SettingsRow
								label="Manage Caregiver Share Links"
								icon={<Users size={20} color={COLORS.primary} />}
								onPress={() => router.push("/caregiver-share/manage-shares")}
							/>
						</Card>
					</View>
				)}

				{/* Section 4: Data & Export */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Data Management</Text>
					<Card variant="elevated" style={styles.groupCard}>
						<SettingsRow
							label={exporting ? "Exporting data..." : "Export All Health Data"}
							icon={<Download size={20} color={COLORS.textPrimary} />}
							onPress={handleExportData}
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
					<Text style={styles.versionText}>HomePulse v1.0.0</Text>
					<Pressable
						style={styles.legalLink}
						onPress={() => {
							Alert.alert(
								"Medical Disclaimer & Legal",
								"HomePulse is a decision support tool designed to assist caregivers. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a healthcare provider for medical concerns. In life-threatening situations, contact emergency services (112) immediately.\n\nAll health data is stored locally and securely encrypted on your device.",
							);
						}}
						accessibilityRole="button"
						accessibilityLabel="View Legal and Privacy Policy"
					>
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

			<ConfirmDialog
				visible={wipeDialogVisible}
				title="Confirm Factory Reset"
				message="Are you sure you want to clear all data? This will permanently delete all patient profiles, history, and active cases. Type WIPE to confirm."
				confirmLabel="Clear Data"
				cancelLabel="Cancel"
				destructive
				requiresTyping="WIPE"
				onConfirm={executeWipe}
				onCancel={() => setWipeDialogVisible(false)}
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
	accountSubtitle: {
		fontSize: 13,
		color: COLORS.textSecondary,
		marginTop: 2,
		marginBottom: 4,
	},
	authLinkPressable: {
		alignSelf: "flex-start",
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
