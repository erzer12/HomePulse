import { Text, View } from 'react-native';

export function TaskItem({ task }: { task: { title: string; done: boolean } }) {
  return <View><Text>{task.done ? '✅' : '⬜️'} {task.title}</Text></View>;
}
