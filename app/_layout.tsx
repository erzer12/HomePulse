import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NetworkBanner } from "@/components/ui/NetworkBanner";
import { getDb, type SQLiteDatabase, truncateDatabase } from "@/db/connection";
import { getPatients } from "@/db/queries/patients";
import { startAppSync } from "@/services/appSync";
import "@/i18n";

export default function RootLayout() {
	const router = useRouter();
	const [_ready, setReady] = useState(false);
	const didInit = useRef(false);

	useEffect(() => {
		if (didInit.current) return;
		didInit.current = true;

		(async () => {
			// ── 1. Initialize SQLite ──────────────────────────────
			let db: SQLiteDatabase;
			try {
				db = await getDb();
			} catch {
				// DB failed to open — show fatal error screen
				router.replace("/fatal-error");
				setReady(true);
				return;
			}

			// ── 2. Recover interrupted wipe ───────────────────────
			const wipeFlag = await AsyncStorage.getItem("wipe_in_progress").catch(
				() => null,
			);
			if (wipeFlag === "1") {
				try {
					await truncateDatabase();
				} catch {
					// Best-effort — proceed to onboarding either way
				}
				await AsyncStorage.removeItem("wipe_in_progress").catch(() => null);
				router.replace("/onboarding/passkey-setup");
				setReady(true);
				return;
			}

			// ── 3. First-run vs returning user check ─────────────
			const firstRunDone = await AsyncStorage.getItem(
				"first_run_completed",
			).catch(() => null);
			if (firstRunDone !== "1") {
				// Check if there are already any patients (edge case: schema existed but flag missing)
				let hasProfiles = false;
				try {
					const rows = await getPatients(db);
					hasProfiles = rows.length > 0;
				} catch {
					// ignore
				}

				if (!hasProfiles) {
					router.replace("/onboarding/passkey-setup");
					setReady(true);
					startAppSync();
					return;
				}
			}

			// ── 4. Returning user → Auth Gateway ─────────────────
			router.replace("/auth/gateway");
			setReady(true);
			startAppSync();
		})();
	}, [router]);

	return (
		<SafeAreaProvider>
			<NetworkBanner />
			<Stack screenOptions={{ headerShown: false }} />
		</SafeAreaProvider>
	);
}
