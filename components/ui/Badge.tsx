import { Text, View } from 'react-native';

export function Badge({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: '#DBEAFE', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color: '#1E40AF', fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
