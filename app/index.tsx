import { router, Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCaseStore } from '@/store/case';
import { usePatientStore } from '@/store/patient';

export default function IndexScreen() {
  const patientCount = usePatientStore((state) => state.profiles.length);
  const activeCase = useCaseStore((state) => state.activeCase);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.kicker}>HomePulse</Text>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Offline-first family health triage support</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Setup status</Text>
        <Text style={styles.cardValue}>{patientCount > 0 ? `${patientCount} patient profile${patientCount === 1 ? '' : 's'} ready` : 'No patient profiles yet'}</Text>
        <Text style={styles.cardHint}>{activeCase ? 'An active case is already running.' : 'Start by adding a profile or open the dashboard.'}</Text>
      </View>

      <View style={styles.links}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/onboarding/create-profile')}>
          <Text style={styles.primaryButtonText}>Add Patient Profile</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/home')}>
          <Text style={styles.secondaryButtonText}>Open Dashboard</Text>
        </Pressable>
        <Link href='/symptom-check/select-symptom' style={styles.textLink}>
          Start Symptom Check
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC' },
  kicker: { fontSize: 12, fontWeight: '700', color: '#1B6CA8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '700', marginBottom: 8, color: '#1F2937' },
  subtitle: { fontSize: 15, color: '#475569', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  cardLabel: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6, fontWeight: '600' },
  cardValue: { fontSize: 18, color: '#1F2937', fontWeight: '700', marginBottom: 4 },
  cardHint: { fontSize: 14, color: '#6B7280' },
  links: { gap: 12 },
  primaryButton: { backgroundColor: '#1B6CA8', paddingVertical: 14, borderRadius: 12 },
  primaryButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  secondaryButton: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1B6CA8' },
  secondaryButtonText: { color: '#1B6CA8', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  textLink: { color: '#1B6CA8', textAlign: 'center', fontWeight: '600', fontSize: 15, paddingVertical: 8 },
});
