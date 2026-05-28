import type { ActionState } from '@/types/triage';
import { Text, View } from 'react-native';

export function ActionStateCard({ state }: { state: ActionState }) {
  return (
    <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontWeight: '700' }}>State {state.level}: {state.label}</Text>
      <Text>{state.explanation}</Text>
    </View>
  );
}
