import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NetworkBanner } from "@/components/ui/NetworkBanner";
import { startAppSync } from "@/services/appSync";

export default function RootLayout() {
	useEffect(() => {
		startAppSync();
	}, []);

	return (
		<SafeAreaProvider>
			<NetworkBanner />
			<Stack screenOptions={{ headerShown: false }} />
		</SafeAreaProvider>
	);
}
