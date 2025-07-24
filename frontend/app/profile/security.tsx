import { useThemeColor } from "@/hooks/useThemeColor";
import { AntDesign, Fontisto, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function security() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 10,
      borderBottomColor: "gray",
      borderBottomWidth: 0.5,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 10,
      color: text,
    },
    content: {
      flexDirection: "column",
      paddingVertical: 10,
    },
    helpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomColor: "gray",
      borderBottomWidth: 1,
      alignItems: "center",
    },
    wording: {
      flexDirection: "column",
      justifyContent: "space-around",
      width: screenWidth * 0.8,
    },
    title: {
      fontSize: 17,
      fontWeight: "600",
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "semibold",
      color: "gray",
    },
  });

  return (
    <View style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Security & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Body */}
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.helpContainer}
          onPress={() => router.push("/security/changePassword")}
        >
          <View style={styles.wording}>
            <Text style={styles.title}>Change password</Text>
            <Text style={styles.subtitle}>
              Update your password to keep your account secure.
            </Text>
          </View>
          <AntDesign name="arrowright" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
