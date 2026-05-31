import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const symptoms = [
  { label: 'Fever', category: 'fever' },
  { label: 'Breathing', category: 'respiratory' },
  { label: 'Stomach / Vomiting', category: 'gastrointestinal' },
  { label: 'Dehydration', category: 'dehydration' },
  { label: 'Confusion', category: 'neurological' },
  { label: 'Pain', category: 'pain' },
  { label: 'Weakness', category: 'weakness' },
];

export default function SelectSymptomScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Select Symptom</Text>
      <Text style={styles.text}>Choose the main complaint to continue the triage flow.</Text>
      <View style={styles.grid}>
        {symptoms.map((symptom) => (
          <Pressable
            key={symptom.category}
            style={styles.tile}
            onPress={() => router.push({ pathname: '/symptom-check/questionnaire', params: { category: symptom.category } })}
          >
            <Text style={styles.tileText}>{symptom.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12, flexGrow: 1, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  text: { fontSize: 15, color: '#6B7280' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  tile: { width: '48%', minHeight: 96, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 16, padding: 14, justifyContent: 'center' },
  tileText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
});
