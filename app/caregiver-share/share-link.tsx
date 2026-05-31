import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ShareLinkScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Generate Caregiver Share Link</Text>
      <Text style={styles.text}>This screen will eventually generate the QR and share task list.</Text>
      <Pressable style={styles.primaryButton} onPress={() => router.push('/caregiver-share/shared-view')}>
        <Text style={styles.primaryButtonText}>Open Shared View</Text>
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
});
