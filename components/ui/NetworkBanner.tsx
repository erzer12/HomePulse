import { useNetInfo } from "@react-native-community/netinfo";
import { CloudUpload, WifiOff } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "@/constants/colors";
import { useSyncStore } from "@/store/sync";

export function NetworkBanner() {
	const netInfo = useNetInfo();
	const { pendingCount, isSyncing, checkPending } = useSyncStore();

	useEffect(() => {
		checkPending();
	}, [checkPending]);

	// Offline state
	if (netInfo.isConnected === false) {
		return (
			<View style={[styles.container, styles.offline]}>
				<WifiOff size={14} color={COLORS.textSecondary} />
				<Text style={styles.text}>Offline — Local data safe</Text>
			</View>
		);
	}

	// Online, but syncing or pending
	if (isSyncing || pendingCount > 0) {
		return (
			<View style={[styles.container, styles.syncing]}>
				{isSyncing ? (
					<ActivityIndicator size="small" color={COLORS.primary} />
				) : (
					<CloudUpload size={14} color={COLORS.primary} />
				)}
				<Text style={[styles.text, { color: COLORS.primary }]}>
					{isSyncing
						? "Syncing care data..."
						: `${pendingCount} updates pending`}
				</Text>
			</View>
		);
	}

	// Online and synced (optional: only show briefly or not at all)
	// For this spec, we'll keep it subtle or hidden
	return null;
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 4,
		gap: SPACING.sm,
	},
	offline: {
		backgroundColor: "#F2F2F2",
	},
	syncing: {
		backgroundColor: COLORS.state.monitor.surface,
	},
	text: {
		fontSize: 11,
		fontWeight: "700",
		color: COLORS.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});
