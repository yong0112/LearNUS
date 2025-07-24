import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "@firebase/auth";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const [email, setEmail] = useState<string>("");
  const [oldPass, setOldPass] = useState<string>("");
  const [newPass, setNewPass] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        await fetch(`https://learnus.onrender.com/api/users/${currentUser.uid}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch user profile");
            return res.json();
          })
          .then((data) => {
            setEmail(data.email);
          })
          .catch((err) => {
            console.log("Error", err);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  const verifyOldPassword = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user signed in");

    const credential = EmailAuthProvider.credential(email, oldPass);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      console.log("Old password is correct");
      return true;
    } catch (err) {
      console.error("Old password input incorrect");
      return false;
    }
  };

  const handleChangePassword = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user signed in");

      if (newPass != confirmPass) {
        Alert.alert(
          "New password do not match. Please make sure you input the password correctly.",
        );
        return;
      }

      if (!verifyOldPassword()) {
        Alert.alert("Incorrect old password.");
        return;
      }

      const idToken = await currentUser.getIdToken();
      const res = await fetch(
        "https://learnus.onrender.com/api/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`, // Include token
          },
          body: JSON.stringify({
            newPass: newPass,
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to change password");
      }

      Alert.alert("Password updated successfully.");
      router.back();
    } catch (err) {
      console.error(err);
    }
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
      marginBottom: 20,
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
          secureTextEntry
          value={oldPass}
          onChangeText={setOldPass}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="Enter new password"
          placeholderTextColor="#888"
          secureTextEntry
          value={newPass}
          onChangeText={setNewPass}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="Enter new password to confirm"
          placeholderTextColor="#888"
          secureTextEntry
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
