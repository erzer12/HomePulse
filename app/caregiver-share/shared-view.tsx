import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SharedViewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Shared Read-Only Case View</Text>
      <Text style={styles.text}>A caregiver can view the shared case here.</Text>
      <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/home')}>
        <Text style={styles.primaryButtonText}>Back to Home</Text>
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
