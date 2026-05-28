import { Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
}

export function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: '#1B6CA8', padding: 12, borderRadius: 8 }}>
      <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}
