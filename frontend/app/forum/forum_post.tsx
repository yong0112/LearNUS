import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { set } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { CourseOption } from "../../constants/types";
import { useTheme } from "@/components/ThemedContext";

export default function ForumPost() {
  const router = useRouter();
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { isDarkMode } = useTheme();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    fetch("https://api.nusmods.com/v2/2024-2025/moduleList.json")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((course: any) => ({
          label: `${course.moduleCode} - ${course.title}`,
          value: course.moduleCode,
        }));
        setCourseOptions(formatted);
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePost = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      Alert.alert("Error", "Title and content cannot be empty.");
      return;
    }

    try {
      const currUser = auth.currentUser;
      const response = await fetch("https://learnus.onrender.com/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          courseTag: selectedCourse || null,
          author: currUser?.uid,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error(result);
        const errorMessage = result.error;
        Alert.alert("Failed to post: ", errorMessage);
        return;
      }
      Alert.alert("Forum post created!");
      router.back();
    } catch (error: any) {
      console.error("Error:", error);
      Alert.alert("Failed to post: ");
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
    inputGroup: {
      paddingHorizontal: 5,
      paddingVertical: 20,
    },
    label: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 5,
      color: text,
    },
    searchBar: {
      borderRadius: 20,
      backgroundColor: "#d1d5db",
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 8,
      paddingRight: 8,
    },
    input: {
      color: "#222",
      fontSize: 17,
      marginLeft: 10,
      flex: 1,
    },
    dropdown: {
      height: 50,
      flex: 1,
      paddingRight: 8,
    },
    placeholderStyle: {
      fontSize: 17,
      marginLeft: 10,
      color: "#888",
    },
    selectedTextStyle: {
      fontSize: 17,
      marginLeft: 10,
      color: "#222",
    },
    clearFilterContainer: {
      marginTop: 10,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 6,
      alignSelf: "flex-start",
      borderColor: text,
    },
    filterButtonText: {
      marginHorizontal: 4,
      fontSize: 14,
      fontWeight: "400",
      marginBottom: 2,
      color: text,
    },
    postButton: {
      marginTop: 35,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "orange",
      paddingVertical: 8,
      marginHorizontal: 20,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: "600",
      color: "white",
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
          <Text style={styles.headerText}>Create a post</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 10 }}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.searchBar}>
              <MaterialIcons name="title" size={25} color="orange" />
              <TextInput
                style={styles.input}
                placeholder="Enter post title"
                placeholderTextColor="#888"
                onChangeText={setTitle}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content</Text>
            <View
              style={[
                styles.searchBar,
                { height: 250, alignItems: "flex-start" },
              ]}
            >
              <TextInput
                style={{
                  flex: 1,
                  width: "100%",
                  textAlignVertical: "top",
                  color: "#222222",
                  fontSize: 17,
                }}
                placeholder="Write your post here..."
                placeholderTextColor="#888"
                multiline
                onChangeText={setContent}
                scrollEnabled
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Tag (optional)</Text>
            <View style={styles.searchBar}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={courseOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select a course"
                value={selectedCourse}
                onChange={(item) => setSelectedCourse(item.value)}
                renderLeftIcon={() => (
                  <Ionicons color={"#ffc04d"} name="search-sharp" size={30} />
                )}
                search
                searchPlaceholder="Search course"
              />
            </View>
            <TouchableOpacity
              style={styles.clearFilterContainer}
              onPress={() => {
                setSelectedCourse("");
              }}
            >
              <MaterialCommunityIcons name="close" size={20} color={text} />
              <Text style={styles.filterButtonText}>Clear Tag</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.buttonText}>Post!</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ThemedView>
  );
}
