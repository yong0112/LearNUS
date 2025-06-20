import { useThemeColor } from "@/hooks/useThemeColor";
import { Entypo, Fontisto, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export default function contact() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

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
  });

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
        <Text style={styles.headerText}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <View
        style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
      >
        <View
          style={{ flexDirection: "row", justifyContent: "center", margin: 20 }}
        >
          <Fontisto name="email" size={30} color={"orange"} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "500",
              marginLeft: 10,
              textDecorationLine: "underline",
              color: "blue",
            }}
          >
            yonglzy1611@gmail.com
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Entypo name="old-phone" size={30} color={"orange"} />
          <Text style={{ fontSize: 18, fontWeight: "500", marginLeft: 10, color: text }}>
            +65 9019 1786
          </Text>
        </View>
      </View>
    </View>
  );
}