import { StatusBar, StyleSheet, Text, useEffect, View } from "react-native";
import { startAppSync } from "./services/appSync";

export default function App() {
	useEffect(() => {
		startAppSync();
	}, []);
	return (
		<View style={styles.container}>
			<Text>Open up App.tsx to start working on your app!</Text>
			<StatusBar barStyle="dark-content" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
