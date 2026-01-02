import { SafeAreaView, Text, StyleSheet } from "react-native";
import { theme } from "../src/theme";

export default function Settings() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.text}>No settings yet</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.bg,
  },
  text: {
    color: theme.subtext,
    fontSize: 16,
  },
});
