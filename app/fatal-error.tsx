import { useRouter } from "expo-router";
import { HeartPulse, RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { COLORS, RADIUS, SPACING } from "@/constants/colors";
import { getDb } from "@/db/connection";

/**
 * Shown when the SQLite database fails to initialize on startup.
 * Provides a "Retry" option that re-attempts initialization.
 * Does not proceed to any other screen until DB init succeeds.
 */
export default function FatalErrorScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [retrying, setRetrying] = useState(false);
	const [errorMsg, setErrorMsg] = useState(
		"The app database could not start. Please check your device storage and try again.",
	);

	const handleRetry = async () => {
		setRetrying(true);
		try {
			await getDb();
			// DB is up — navigate to the normal startup gate
			router.replace("/");
		} catch (e: unknown) {
			setErrorMsg(
				e instanceof Error
					? `Database error: ${e.message}`
					: "Database initialization failed.",
			);
		} finally {
			setRetrying(false);
		}
	};

	return (
		<View
			style={[
				styles.container,
				{ paddingTop: insets.top, paddingBottom: insets.bottom },
			]}
		>
			<View style={styles.content}>
				<View style={styles.iconCircle}>
					<HeartPulse
						size={48}
						color={COLORS.state.urgent.primary}
						strokeWidth={2}
					/>
				</View>
				<Text style={styles.title}>Unable to Start</Text>
				<Text style={styles.body}>{errorMsg}</Text>

				<View style={styles.tipBox}>
					<Text style={styles.tipText}>
						💡 Free up device storage and restart the app.
					</Text>
				</View>
			</View>

			<View style={styles.footer}>
				<Button
					title={retrying ? "Retrying…" : "Retry"}
					onPress={handleRetry}
					disabled={retrying}
				/>
				<View style={styles.iconRow}>
					<RotateCcw size={14} color={COLORS.textSecondary} />
					<Text style={styles.hint}>
						HomePulse will not open until this is resolved.
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
		padding: SPACING.screenEdge,
		justifyContent: "space-between",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: SPACING.xl,
	},
	iconCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: COLORS.state.urgent.surface,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.xxl,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.textPrimary,
		textAlign: "center",
		marginBottom: SPACING.md,
	},
	body: {
		fontSize: 15,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: SPACING.xxl,
	},
	tipBox: {
		backgroundColor: COLORS.surfaceElevated,
		borderRadius: RADIUS.lg,
		padding: SPACING.lg,
	},
	tipText: {
		fontSize: 13,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 20,
	},
	footer: {
		gap: SPACING.md,
	},
	iconRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	hint: {
		fontSize: 12,
		color: COLORS.textSecondary,
	},
});
