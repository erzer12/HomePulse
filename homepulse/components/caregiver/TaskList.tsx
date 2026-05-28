import { TaskItem } from './TaskItem';
import { View } from 'react-native';

export function TaskList({ tasks }: { tasks: { id: string; title: string; done: boolean }[] }) {
  return <View>{tasks.map((task) => <TaskItem key={task.id} task={task} />)}</View>;
}
