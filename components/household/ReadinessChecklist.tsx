import { Text, View } from "react-native";

export function ReadinessChecklist({ items }: { items: string[] }) {
	return (
		<View>
			{items.map((item) => (
				<Text key={item}>☐ {item}</Text>
			))}
		</View>
	);
}
