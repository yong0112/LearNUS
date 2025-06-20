import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export default function Chat() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    header: {
      fontSize: 30,
      fontWeight: "600",
      color: text,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat</Text>
    </View>
  );
}
