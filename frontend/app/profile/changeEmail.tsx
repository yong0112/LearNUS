import { auth } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, updateEmail } from "@firebase/auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EmailChanging() {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState<string>("");
  const [confirmEmail, setConfirmEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleChangeEmail = async () => {
    if (newEmail != confirmEmail) {
        Alert.alert("Failed to change email. Email and confirmation email do not match.");
        setNewEmail("");
        setConfirmEmail("");
        return;
    }

    const currUser = auth.currentUser;

    if (!currUser || !currUser.email) return;

    try {
      const credential = EmailAuthProvider.credential(currUser.email, password);
      await reauthenticateWithCredential(currUser, credential);
      await updateEmail(currUser, newEmail);
      await sendEmailVerification(currUser);
      
      try {
        const response = await fetch("http://192.168.0.103:5000/api/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid: currUser?.uid,
                email: newEmail,
                updatedAt: new Date()
            })  
        })

        if (!response.ok) {
            const text = await response.text();
            return console.error(text);
        }

        Alert.alert("Email changed successfully");
        router.push("/profile/details");
      } catch (err: any) {
          console.log("Error: ", err);
          Alert.alert("Email changed failed: ", err.message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <View style={styles.container}>
      {/*Header*/}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 30
        }}
      >
        <Ionicons
          name="arrow-back-circle"
          size={40}
          color="orange"
          onPress={() => router.push("/(tabs)/profile")}
        />
        <Text style={styles.headerText}>Change Email</Text>
        <View style={{ width: 40 }} />
      </View>

      <View>
        <View style={styles.inputBar}>
            <TextInput
            style={{
                color: "#222222",
                fontSize: 17,
                marginLeft: 10,
                flex: 1,
            }}
            placeholder="New Email"
            placeholderTextColor="#888888"
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            />
        </View>
        <View style={styles.inputBar}>
            <TextInput
            style={{
                color: "#222222",
                fontSize: 17,
                marginLeft: 10,
                flex: 1,
            }}
            placeholder="Confirm Email"
            placeholderTextColor="#888888"
            onChangeText={setConfirmEmail}
            />
        </View>

        <View style={styles.inputBar}>
            <TextInput
            style={{
                color: "#222222",
                fontSize: 17,
                marginLeft: 10,
                flex: 1,
            }}
            placeholder="Password"
            placeholderTextColor="#888888"
            onChangeText={setPassword}
            secureTextEntry
            />
        </View>

        <View>
            <TouchableOpacity style={styles.button} onPress={handleChangeEmail}>
            <Text style={styles.buttonText}>Change</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20 },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    alignItems: "center",
    justifyContent: "center",
    color: "black",
  },
  inputBar: {
    borderRadius: 10,
    backgroundColor: "#d1d5db",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "orange",
    borderRadius: 10,
    alignSelf: "center",
    width: 100,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "semibold",
    color: "#3a3a3a",
    padding: 5,
    alignSelf: "center"
  }
});