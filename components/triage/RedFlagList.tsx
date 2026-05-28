import { Text, View } from 'react-native';

export function RedFlagList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <Text key={item}>• {item}</Text>
      ))}
    </View>
  );
}
