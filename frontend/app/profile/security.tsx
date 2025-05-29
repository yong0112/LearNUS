import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function security() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/*Header*/}
      <View style={styles.background} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Ionicons
          name="arrow-back-circle"
          size={40}
          color="white"
          onPress={() => router.push("/(tabs)/profile")}
        />
        <Text style={styles.headerText}>Security & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <View
        style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
      >
        <Text style={styles.title}>🚧 Coming Soon</Text>
        <Text style={styles.subtitle}>
          This feature is still under development.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20 },
  background: {
    position: "absolute",
    top: -550,
    left: -150,
    width: 10000,
    height: 650,
    borderRadius: 0,
    backgroundColor: "#ffc04d",
    zIndex: -1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    alignItems: "center",
    justifyContent: "center",
    color: "black",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "500",
    alignSelf: "center",
  },
});
