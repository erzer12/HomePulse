import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

// expo-notifications crashes on Android inside Expo Go due to lack of remote push support.
// We dynamically import it only when NOT in Expo Go on Android.
const getNotificationsModule = () => {
	if (Platform.OS === "android" && isRunningInExpoGo()) {
		return null;
	}
	try {
		return require("expo-notifications");
	} catch (e) {
		console.warn("Failed to load expo-notifications:", e);
		return null;
	}
};

export async function scheduleRecheckNotification(
	caseId: string,
	minutesFromNow: number,
	body: string,
): Promise<string> {
	const Notifications = getNotificationsModule();
	if (!Notifications) {
		console.warn(
			"Local notifications are not supported in Expo Go on Android. Skipping schedule.",
		);
		return "mock-notification-id";
	}

	// Identifier is prefixed with recheck-<caseId> so cancelNotificationsForCase
	// can filter by prefix and cancel exactly this case's alarms.
	const identifier = `recheck-${caseId}-${Date.now()}`;

	return Notifications.scheduleNotificationAsync({
		identifier,
		content: { title: "HomePulse Recheck", body },
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
			seconds: minutesFromNow * 60,
		},
	});
}

export async function cancelAllNotifications(): Promise<void> {
	const Notifications = getNotificationsModule();
	if (!Notifications) {
		console.warn(
			"Local notifications are not supported in Expo Go on Android. Skipping cancel.",
		);
		return;
	}
	await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancels only the scheduled notifications that belong to a specific case.
 * Notification identifiers are prefixed with `recheck-<caseId>` when scheduled.
 */
export async function cancelNotificationsForCase(
	caseId: string,
): Promise<void> {
	const Notifications = getNotificationsModule();
	if (!Notifications) return;

	const scheduled: { identifier: string }[] =
		await Notifications.getAllScheduledNotificationsAsync();
	const prefix = `recheck-${caseId}`;
	await Promise.all(
		scheduled
			.filter((n) => n.identifier.startsWith(prefix))
			.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
	);
}
