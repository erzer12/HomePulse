import { Text, View } from 'react-native';

export function ReadinessModifierBadge({ reason }: { reason: string }) {
  return (
    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: '#92400E', fontSize: 12 }}>{reason}</Text>
    </View>
  );
}
