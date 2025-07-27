import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import {
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { sendPasswordResetEmail } from "@firebase/auth";

function convertTimeLocally(current: Date) {
  const newDate = new Date();
  const formatted = newDate.setHours(current.getHours() + 8);
  return new Date(formatted);
}

export default function TutorPost() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Please provide your registered email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Reset email sent. Please check your mailbox and proceed with login after reset password.",
      );
      router.back();
    } catch (error: any) {
      console.error("Error: ", error);
      Alert.alert("Reset failed: ", error.message);
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
    body: {
      flexDirection: "column",
      justifyContent: "flex-start",
      marginTop: 20,
    },
    wordContainer: {
      marginVertical: 20,
    },
    description: {
      fontSize: 16,
      fontWeight: "semibold",
      textAlign: "center",
      marginBottom: 15,
      color: text,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 15,
      borderRadius: 5,
      opacity: 0.75,
      color: text,
    },
    button: {
      marginTop: 20,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "orange",
      marginHorizontal: 30,
      paddingVertical: 8,
    },
    buttonText: {
      marginHorizontal: 4,
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 2,
      color: "white",
    },
  });

  return (
    <ThemedView style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} color={text} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Reset Password</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Body*/}
      <View style={styles.body}>
        <Text style={styles.description}>
          Enter your registered email, and we'll send an email with instructions
          to reset your password.
        </Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={text}
        />
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
