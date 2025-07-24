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
const screenHeight = Dimensions.get("window").height;

export default function contact() {
  const router = useRouter();
  const [isDarkEnabled, setIsDarkEnabled] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const toggleDarkSwitch = () => {
    setIsDarkEnabled(!isDarkEnabled);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
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
    body: {
      flexDirection: "column",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 30,
    },
    word: {
      fontSize: 20,
      fontWeight: "700",
      marginVertical: 20,
    },
    email: {
      fontSize: 20,
      fontWeight: "700",
      fontStyle: "italic",
      textDecorationLine: "underline",
      color: "#3363ffff",
    },
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/**Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerText}>App Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/**Body */}
        <View style={styles.body}>
          <Text style={styles.word}>For general enquiries, email us at</Text>
          <Text style={styles.email}>learnus123@gmail.com</Text>
          <Text style={styles.word}>We aim to respond within 72 hours.</Text>
        </View>
      </View>
    </ThemedView>
  );
}
