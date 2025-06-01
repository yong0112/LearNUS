import { auth } from "@/lib/firebase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type courseOption = {
  label: string;
  value: string;
};

export default function ForumPost() {
  const router = useRouter();
  const [courseOptions, setCourseOptions] = useState<courseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
    try {
      const currUser = auth.currentUser;
      const response = await fetch("http://192.168.1.8:5000/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: currUser?.uid,
          title: title,
          content: content,
          courseTag: selectedCourse || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error(result);
        return;
      }
      Alert.alert("Forum post created!");
      router.replace("/(tabs)/forum");
    } catch (error: any) {
      console.error("Error:", error);
      Alert.alert("Failed to post: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <View style={styles.header}>
        <Ionicons
          name="arrow-back-circle"
          size={40}
          color="white"
          onPress={() => router.push("/(tabs)/forum")}
        />
        <Text style={styles.headerText}>Create A Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 10 }}>
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
          <View style={[styles.searchBar, { height: 250, alignItems: "flex-start" }]}>
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
        </View>

        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.buttonText}>Post!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  background: {
    position: "absolute",
    top: -550,
    left: -150,
    width: 700,
    height: 650,
    backgroundColor: "#ffc04d",
    zIndex: -1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
  },
  inputGroup: {
    paddingHorizontal: 5,
    paddingVertical: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
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
  postButton: {
    marginTop: 120,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "orange",
    paddingVertical: 12,
    height: 60,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: "600",
    color: "white",
  },
});
