import { Text, View } from 'react-native';

interface SymptomIconProps {
  label: string;
  color: string;
}

export function SymptomIcon({ label, color }: SymptomIconProps) {
  return (
    <View style={{ width: 96, padding: 8, borderRadius: 8, backgroundColor: color }}>
      <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
