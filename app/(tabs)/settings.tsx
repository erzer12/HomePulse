import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsTab() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <Text style={styles.cardText}>This screen will later hold notification and language controls.</Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/home')}>
        <Text style={styles.primaryButtonText}>Go to Home</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12, flexGrow: 1, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  cardText: { fontSize: 14, color: '#374151' },
  primaryButton: { backgroundColor: '#1B6CA8', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});