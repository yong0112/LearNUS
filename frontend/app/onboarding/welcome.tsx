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
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { UserProfile } from "@/constants/types";
import { useFonts } from "expo-font";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const [fontLoaded] = useFonts({
    "Itim-Regular": require("@/assets/fonts/Itim-Regular.ttf"),
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#faf8e0ff",
      paddingBottom: 40,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 10,
      marginBottom: 10,
    },
    title: {
      fontSize: 26,
      fontFamily: "Itim-Regular",
      fontWeight: "600",
      marginBottom: 40,
    },
    text: {
      fontSize: 20,
      fontFamily: "Itim-Regular",
      fontWeight: "600",
      marginBottom: 40,
      textAlign: "center",
    },
    button: {
      borderRadius: 15,
      paddingHorizontal: 20,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 15,
      backgroundColor: "orange",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
    },
  });

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.image}
      />
      <Text style={styles.text}>Welcome to LearNUS</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/onboarding/onboard")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        Click on the button above to proceed with onboarding
      </Text>
    </View>
  );
}
