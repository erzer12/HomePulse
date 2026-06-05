import { View } from "react-native";
import { SYMPTOMS } from "@/constants/symptoms";
import { SymptomIcon } from "./SymptomIcon";

export function SymptomIconGrid() {
	return (
		<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
			{SYMPTOMS.map((symptom) => (
				<SymptomIcon
					key={symptom.category}
					label={symptom.label}
					iconName={symptom.iconName}
				/>
			))}
		</View>
	);
}
