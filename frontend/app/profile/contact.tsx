import { useThemeColor } from "@/hooks/useThemeColor";
import {
  AntDesign,
  Entypo,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function help() {
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
    helpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomColor: "gray",
      borderBottomWidth: 1,
      alignItems: "center",
    },
    icon: {
      flexDirection: "row",
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 15,
    },
  });

  return (
    <View style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Body */}
      <View>
        {/**FAQ */}
        <TouchableOpacity
          style={styles.helpContainer}
          onPress={() => router.push("/help/faq")}
        >
          <View style={styles.icon}>
            <MaterialCommunityIcons name="comment-question-outline" size={25} />
            <Text style={styles.title}>FAQs</Text>
          </View>
          <AntDesign name="arrowright" size={20} />
        </TouchableOpacity>

        {/**Report issue */}
        <TouchableOpacity
          style={styles.helpContainer}
          onPress={() => router.push("/help/report")}
        >
          <View style={styles.icon}>
            <MaterialIcons name="report" size={25} />
            <Text style={styles.title}>Report an issue</Text>
          </View>
          <AntDesign name="arrowright" size={20} />
        </TouchableOpacity>

        {/**Contact Us */}
        <TouchableOpacity
          style={styles.helpContainer}
          onPress={() => router.push("/help/contact")}
        >
          <View style={styles.icon}>
            <Fontisto name="email" size={25} />
            <Text style={styles.title}>Contact Us</Text>
          </View>
          <AntDesign name="arrowright" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
