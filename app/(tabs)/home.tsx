import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCaseStore } from '@/store/case';
import { usePatientStore } from '@/store/patient';

export default function HomeTab() {
  const activeCase = useCaseStore((state) => state.activeCase);
  const patients = usePatientStore((state) => state.profiles);
  const patientName = patients[0]?.name ?? 'your patient';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Home Dashboard</Text>
      <Text style={styles.subheading}>{activeCase ? `Monitoring ${patientName}` : 'Choose the next action to continue the flow.'}</Text>

      {activeCase ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active case</Text>
          <Text style={styles.cardText}>Case {activeCase.id}</Text>
          <Text style={styles.cardText}>Status: {activeCase.status}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/recheck/check-in')}>
              <Text style={styles.primaryButtonText}>Do Recheck Now</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.push('/result/action-state')}>
              <Text style={styles.secondaryButtonText}>View Full Result</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.push('/caregiver-share/share-link')}>
              <Text style={styles.secondaryButtonText}>Share with Caregiver</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No active case</Text>
          <Text style={styles.cardText}>{patients.length > 0 ? 'Start a symptom check for the selected patient.' : 'Create a patient profile to begin.'}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/symptom-check/select-symptom')}>
              <Text style={styles.primaryButtonText}>Start Symptom Check</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.push('/onboarding/household-setup')}>
              <Text style={styles.secondaryButtonText}>Update Household Info</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, flexGrow: 1, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  subheading: { fontSize: 15, color: '#6B7280' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  cardText: { fontSize: 14, color: '#374151' },
  actions: { gap: 12, marginTop: 8 },
  primaryButton: { backgroundColor: '#1B6CA8', paddingVertical: 14, borderRadius: 12 },
  primaryButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1B6CA8' },
  secondaryButtonText: { color: '#1B6CA8', textAlign: 'center', fontWeight: '700' },
});
