import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "@/constants/colors";
import { supabase } from "@/services/supabase";

/**
 * OAuth Redirect Callback handler.
 * Catches the redirect URL containing Supabase session hashes,
 * parses access_token and refresh_token, registers session, and routes home.
 */
export default function AuthCallback() {
	const router = useRouter();
	const url = Linking.useURL();

	useEffect(() => {
		let active = true;
		let timer: NodeJS.Timeout | null = null;

		const parseAndSetSession = async () => {
			if (url) {
				const { queryParams } = Linking.parse(url);

				let accessToken: string | undefined;
				let refreshToken: string | undefined;

				const hashIndex = url.indexOf("#");
				if (hashIndex !== -1) {
					const fragment = url.slice(hashIndex + 1);
					const parts = fragment.split("&");
					for (const part of parts) {
						const [k, v] = part.split("=");
						if (k === "access_token") accessToken = decodeURIComponent(v);
						if (k === "refresh_token") refreshToken = decodeURIComponent(v);
					}
				}

				const access_token =
					(queryParams?.access_token as string) || accessToken;
				const refresh_token =
					(queryParams?.refresh_token as string) || refreshToken;

				if (access_token && refresh_token) {
					const { error } = await supabase.auth.setSession({
						access_token,
						refresh_token,
					});
					if (!error && active) {
						router.replace("/(tabs)/home");
						return;
					}
				}
			}

			// Fallback check
			const { data } = await supabase.auth.getSession();
			if (!active) return;
			if (data.session) {
				router.replace("/(tabs)/home");
			} else {
				// Delay check if session is still setting in AsyncStorage
				timer = setTimeout(async () => {
					if (!active) return;
					const { data: secondCheck } = await supabase.auth.getSession();
					if (!active) return;
					if (secondCheck.session) {
						router.replace("/(tabs)/home");
					} else {
						router.replace("/auth/gateway");
					}
				}, 1000);
			}
		};

		parseAndSetSession();

		return () => {
			active = false;
			if (timer) clearTimeout(timer);
		};
	}, [url, router]);

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color={COLORS.primary} />
			<Text style={styles.text}>Completing Google Sign In...</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
		justifyContent: "center",
		alignItems: "center",
		gap: SPACING.lg,
	},
	text: {
		fontSize: 14,
		color: COLORS.textSecondary,
	},
});
