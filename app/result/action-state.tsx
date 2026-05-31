import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ActionStateScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Action State Result</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>State 2 - Guided Home Care</Text>
        <Text style={styles.cardText}>This is a placeholder result screen connected to the rest of the flow.</Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={() => router.push('/result/explanation')}>
        <Text style={styles.primaryButtonText}>View Explanation</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.push('/recheck/check-in')}>
        <Text style={styles.secondaryButtonText}>Do Recheck Now</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.push('/caregiver-share/share-link')}>
        <Text style={styles.secondaryButtonText}>Share with Caregiver</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(tabs)/home')}>
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
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
  secondaryButton: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1B6CA8' },
  secondaryButtonText: { color: '#1B6CA8', textAlign: 'center', fontWeight: '700' },
});
