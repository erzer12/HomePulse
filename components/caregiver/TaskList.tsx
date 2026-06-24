import { View } from "react-native";
import { TaskItem } from "./TaskItem";

export function TaskList({
	tasks,
}: {
	tasks: { id: string; case_id: string; title: string; done: boolean }[];
}) {
	return (
		<View>
			{tasks.map((task) => (
				<TaskItem key={task.id} task={task} />
			))}
		</View>
	);
}
