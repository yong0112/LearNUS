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

export default function report() {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [titleCount, setTitleCount] = useState<number>();
  const [content, setContent] = useState<string>("");
  const [contentCount, setContentCount] = useState<number>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const TITLE_MAX = 30;
  const CONTENT_MAX = 500;

  const handleTitleChange = (text: string) => {
    setTitle(text);
    setTitleCount(text.length);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    setContentCount(text.length);
  };

  const handleReport = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      Alert.alert("Error", "Title and content cannot be empty.");
      return;
    }

    try {
      const currUser = auth.currentUser;
      const response = await fetch("https://learnus.onrender.com/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          reporter: currUser?.uid,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error(result);
        const errorMessage = result.error;
        Alert.alert("Failed to submit: ", errorMessage);
        return;
      }
      Alert.alert("Report submitted successfully");
      router.replace("/profile/contact");
    } catch (error: any) {
      console.error("Error:", error);
      Alert.alert("Failed to submit: ");
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
    inputBox: {
      marginTop: 20,
    },
    titleInput: {
      flexDirection: "row",
      borderRadius: 10,
      backgroundColor: "#d1d5db",
      padding: 16,
      fontSize: 16,
      color: "#222",
      textAlignVertical: "top",
    },
    contentInput: {
      height: 500,
      borderRadius: 10,
      backgroundColor: "#d1d5db",
      padding: 16,
      fontSize: 16,
      color: "#222",
      textAlignVertical: "top",
    },
    charCount: {
      fontSize: 14,
      color: "#888",
      textAlign: "right",
      marginTop: 8,
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
        <Text style={styles.headerText}>Report an issue</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Title */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.titleInput}
          placeholder="Issue title"
          placeholderTextColor="#888"
          multiline
          value={title}
          onChangeText={handleTitleChange}
          maxLength={TITLE_MAX}
        />
        <Text style={styles.charCount}>
          {titleCount}/{TITLE_MAX}
        </Text>
      </View>

      {/**Content */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.contentInput}
          placeholder="Write your issue here ..."
          placeholderTextColor="#888"
          multiline
          value={content}
          onChangeText={handleContentChange}
          maxLength={CONTENT_MAX}
        />
        <Text style={styles.charCount}>
          {contentCount}/{CONTENT_MAX}
        </Text>
      </View>

      {/**Submit button */}
      <TouchableOpacity style={styles.button} onPress={handleReport}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
