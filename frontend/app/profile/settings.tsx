import { auth } from "@/lib/firebase";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/components/ThemedContext";
const screenHeight = Dimensions.get("window").height;

export default function settings() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDarkMode } = useTheme();
  const [isDarkEnabled, setIsDarkEnabled] = useState<boolean>(
    isDarkMode ? true : false,
  );
  const colorScheme = useColorScheme();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const toggleDarkSwitch = () => {
    if (isDarkMode) {
      setIsDarkEnabled(false);
      setThemeMode("light");
    } else {
      setIsDarkEnabled(true);
      setThemeMode("dark");
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 40,
      paddingBottom: 50,
      paddingHorizontal: 20,
    },
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
    settingContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 5,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "gray",
    },
    wording: {
      flexDirection: "column",
      justifyContent: "space-around",
    },
    title: {
      fontSize: 17,
      fontWeight: "600",
      color: text,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "semibold",
      color: "gray",
    },
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/**Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} color={text} />
          </TouchableOpacity>
          <Text style={styles.headerText}>App Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/**Body */}
        <ScrollView style={styles.content}>
          <View style={styles.settingContainer}>
            <View style={styles.wording}>
              <Text style={styles.title}>Dark mode appearance</Text>
              <Text style={styles.subtitle}>
                Switch your in-app appearance to dark mode.
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#fbcc5fff" }}
              thumbColor={isDarkEnabled ? "#feb823ff" : "#f4f3f4"}
              ios_backgroundColor={"#3e3e3e"}
              onValueChange={toggleDarkSwitch}
              value={isDarkEnabled}
            />
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}
