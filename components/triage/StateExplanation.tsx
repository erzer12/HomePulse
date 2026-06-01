import { Text, View } from "react-native";

export function StateExplanation({ text }: { text: string }) {
	return (
		<View style={{ padding: 12 }}>
			<Text>{text}</Text>
		</View>
	);
}
