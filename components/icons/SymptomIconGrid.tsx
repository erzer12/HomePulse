import { SYMPTOMS } from '@/constants/symptoms';
import { SymptomIcon } from './SymptomIcon';
import { View } from 'react-native';

export function SymptomIconGrid() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {SYMPTOMS.map((symptom) => (
        <SymptomIcon key={symptom.category} label={symptom.label} color={symptom.color} />
      ))}
    </View>
  );
}
