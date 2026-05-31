import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePatientStore } from '@/store/patient';

export default function ProfilesTab() {
  const profiles = usePatientStore((state) => state.profiles);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Patient Profiles</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/onboarding/create-profile')}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {profiles.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No profiles yet</Text>
          <Text style={styles.cardText}>Create the first patient profile to unlock the symptom-check flow.</Text>
        </View>
      ) : (
        profiles.map((profile) => (
          <View key={profile.id} style={styles.card}>
            <Text style={styles.cardTitle}>{profile.name}</Text>
            <Text style={styles.cardText}>{profile.age_group}</Text>
            <Text style={styles.cardText}>Conditions: {profile.chronic_conditions.length > 0 ? profile.chronic_conditions.join(', ') : 'None'}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.primaryButton} onPress={() => router.push('/symptom-check/select-symptom')}>
                <Text style={styles.primaryButtonText}>Start Check</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => router.push('/onboarding/create-profile')}>
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, flexGrow: 1, backgroundColor: '#F9FAFB' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  addButton: { backgroundColor: '#1B6CA8', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9999 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  cardText: { fontSize: 14, color: '#374151' },
  actions: { gap: 10, marginTop: 8 },
  primaryButton: { backgroundColor: '#1B6CA8', paddingVertical: 12, borderRadius: 12 },
  primaryButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#FFFFFF', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1B6CA8' },
  secondaryButtonText: { color: '#1B6CA8', textAlign: 'center', fontWeight: '700' },
});
