import { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function Card({ children }: PropsWithChildren) {
  return <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 }}>{children}</View>;
}
