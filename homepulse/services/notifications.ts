import * as Notifications from 'expo-notifications';

export async function scheduleRecheckNotification(minutesFromNow: number, body: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title: 'HomePulse Recheck', body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: minutesFromNow * 60 },
  });
}
