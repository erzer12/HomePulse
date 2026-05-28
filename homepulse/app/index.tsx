import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>HomePulse</Text>
      <Text style={styles.subtitle}>Offline-first family health triage support</Text>
      <View style={styles.links}>
        <Link href='/(tabs)/home'>Open Dashboard</Link>
        <Link href='/onboarding/create-profile'>Create Profile</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#475569', marginBottom: 24 },
  links: { gap: 12 },
});
