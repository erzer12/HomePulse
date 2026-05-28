import { Text } from 'react-native';

export function RecheckTimer({ minutes }: { minutes: number }) {
  return <Text>Next recheck in {minutes} minutes</Text>;
}
