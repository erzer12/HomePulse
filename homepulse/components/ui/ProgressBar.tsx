import { View } from 'react-native';

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 8 }}>
      <View style={{ width: `${Math.max(0, Math.min(100, progress))}%`, height: 8, backgroundColor: '#1B6CA8', borderRadius: 8 }} />
    </View>
  );
}
