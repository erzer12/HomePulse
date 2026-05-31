import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function QuestionnaireScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Adaptive Questionnaire</Text>
      <Text style={styles.text}>Category: {category ?? 'not selected'}</Text>
      <Pressable style={styles.primaryButton} onPress={() => router.push('/symptom-check/household-check')}>
        <Text style={styles.primaryButtonText}>Continue</Text>
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
