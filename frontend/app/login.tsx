// app/login.js
import { useNavigation } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Button,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import { db, auth } from "../lib/firebase";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { UserProfile } from "@/constants/types";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Check if the email is verified
      if (!user.emailVerified) {
        Alert.alert(
          "Login failed",
          "Please verify your email before logging in.",
          [
            {
              text: "Send Again",
              onPress: async () => {
                await sendEmailVerification(user);
                Alert.alert(
                  "Verification email sent. Please check your inbox.",
                );
              },
            },
          ],
        );
        return;
      }

      // Update firestore doc
      await updateDoc(doc(db, "users", user.uid), {
        emailVerified: true,
      });

      let onboarded = false;
      await fetch(`https://learnus.onrender.com/api/users/${user.uid}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user profile");
          return res.json();
        })
        .then((data) => {
          onboarded = data.onboarded;
        });

      // Alert for successful login and redirect to home page
      Alert.alert("Success: Logged in successfully!");
      router.replace(onboarded ? "/(tabs)/home" : "/onboarding/welcome");
    } catch (error: any) {
      let errorMessage = "Unknown error occurred. Please try again.";

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/missing-password" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-email"
      ) {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Login Failed", errorMessage);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    innerContainer: { flex: 1, justifyContent: "center" }, // Added style for innerContainer
    title: {
      fontSize: 30,
      fontWeight: "bold",
      marginBottom: 50,
      textAlign: "center",
      color: text,
    },
    headings: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 8,
      textAlign: "center",
      color: text,
    },
    subheadings: {
      fontSize: 15,
      marginBottom: 20,
      textAlign: "center",
      color: text,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 10,
      marginTop: 20,
      borderRadius: 5,
      opacity: 0.75,
      color: text,
    },
    forgotContainer: {
      marginTop: 2,
      marginBottom: 15,
      alignSelf: "flex-end",
    },
    forgotText: {
      fontSize: 12,
      marginTop: 5,
      color: "#666",
    },
    button: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 8,
      borderRadius: 5,
      backgroundColor: "orange",
      marginTop: 5,
    },
    buttonText: {
      fontSize: 17,
      fontWeight: "bold",
      textAlign: "center",
      color: "#ffffff",
    },
    dividerText: { marginHorizontal: 10, color: "#666", textAlign: "center" },
    signUpLink: {
      color: text,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    image: {
      width: 120,
      height: 120,
      borderRadius: 10,
      marginBottom: 10,
      marginTop: 100,
      alignSelf: "center",
    },
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, padding: 20, backgroundColor: bg }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        enabled
      >
        <View>
          <Image
            source={require("../assets/images/logo.jpg")}
            style={styles.image}
          />
          <Text style={styles.title}>Welcome to LearNUS!</Text>
          <Text style={styles.headings}>Sign In</Text>
          <Text style={styles.subheadings}>
            Login with your personal email address
          </Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor={text}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor={text}
          />
          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => router.push("/forgotPassword")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 20,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
            <Text style={styles.dividerText}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
          </View>
          <Text style={styles.dividerText}>
            New to LearNUS?{" "}
            <Link
              href="/login"
              onPress={(e) => {
                e.preventDefault(); // prevent the default behavior
                router.push("/signup"); // do navigation manually
              }}
            >
              <Text style={styles.signUpLink}>Join Now</Text>
            </Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
