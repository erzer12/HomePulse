import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CheckInScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Recheck Check-In</Text>
      <Text style={styles.text}>Short follow-up step before evaluating the case again.</Text>
      <Pressable style={styles.primaryButton} onPress={() => router.push('/result/action-state')}>
        <Text style={styles.primaryButtonText}>Update & Re-evaluate</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.push('/recheck/escalation-alert')}>
        <Text style={styles.secondaryButtonText}>Condition worsened</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9FAFB', gap: 12 },
  heading: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  text: { fontSize: 15, color: '#6B7280' },
  primaryButton: { backgroundColor: '#1B6CA8', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1B6CA8' },
  secondaryButtonText: { color: '#1B6CA8', textAlign: 'center', fontWeight: '700' },
});
