import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function changePassword() {
  const router = useRouter();
  const [oldPass, setOldPass] = useState<string>("");
  const [newPass, setNewPass] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const handleChangePassword = async () => {
    console.log("Change password");
  };

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
    inputContainer: {
      marginTop: 20,
    },
    inputBox: {
      flexDirection: "row",
      borderRadius: 10,
      backgroundColor: "#d1d5db",
      padding: 16,
      fontSize: 16,
      color: "#222",
      textAlignVertical: "top",
    },
    button: {
      flexDirection: "row",
      marginHorizontal: 20,
      paddingVertical: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#eaab4dff",
      marginTop: 20,
      borderRadius: 10,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "700",
      color: "white",
    },
  });

  return (
    <View style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Change password</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter old password"
          placeholderTextColor="#888"
          multiline
          value={oldPass}
          onChangeText={setOldPass}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="Enter new password"
          placeholderTextColor="#888"
          multiline
          value={newPass}
          onChangeText={setNewPass}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="Enter new password to confirm"
          placeholderTextColor="#888"
          multiline
          value={confirmPass}
          onChangeText={setConfirmPass}
        />
      </View>

      {/**Submit button */}
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change password</Text>
      </TouchableOpacity>
    </View>
  );
}
