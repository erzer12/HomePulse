import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NetworkBanner } from '@/components/ui/NetworkBanner';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
