import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function EscalationAlertScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Escalation Alert</Text>
      <Text style={styles.text}>The condition has worsened and needs urgent attention.</Text>
      <Pressable style={styles.primaryButton} onPress={() => router.replace('/result/action-state')}>
        <Text style={styles.primaryButtonText}>I understand — Seek urgent care now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FEF2F2', gap: 12 },
  heading: { fontSize: 28, fontWeight: '700', color: '#991B1B' },
  text: { fontSize: 15, color: '#7F1D1D' },
  primaryButton: { backgroundColor: '#DC2626', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
});
