import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NetworkBanner } from "@/components/ui/NetworkBanner";
import { startAppSync } from "@/services/appSync";
import { getDb } from "@/db/connection";

export default function RootLayout() {
	useEffect(() => {
		// Proactive DB initialization to prevent store race conditions
		getDb().catch(err => console.error("Database initialization failed:", err));
		startAppSync();
	}, []);

	return (
		<SafeAreaProvider>
			<NetworkBanner />
			<Stack screenOptions={{ headerShown: false }} />
		</SafeAreaProvider>
	);
}
