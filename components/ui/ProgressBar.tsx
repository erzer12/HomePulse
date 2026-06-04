import { View, type ViewStyle } from "react-native";

export function ProgressBar({ 
	progress, 
	color = "#1B6CA8",
	style 
}: { 
	progress: number;
	color?: string;
	style?: ViewStyle;
}) {
	return (
		<View style={[{ height: 8, backgroundColor: "#E2E8F0", borderRadius: 8 }, style]}>
			<View
				style={{
					width: `${Math.max(0, Math.min(100, progress * 100))}%`,
					height: "100%",
					backgroundColor: color,
					borderRadius: 8,
				}}
			/>
		</View>
	);
}
