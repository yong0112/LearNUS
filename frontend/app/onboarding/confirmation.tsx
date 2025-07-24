import { auth } from "@/lib/firebase";
import {
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";
import { Session, Day, UserProfile, Major } from "../../constants/types";

export default function BookingPage() {
  const router = useRouter();
  const [majorOptions, setMajorOptions] = useState<Major[]>([]);
  const [tutorProfile, setTutorProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<any>();
  const { selectedMajor, selectedLocation, budget, selectedImageURL } =
    useLocalSearchParams() as any;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const fetchConstants = async () => {
      await fetch(`https://learnus.onrender.com/api/constants`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch constants");
          return res.json();
        })
        .then((data) => {
          setMajorOptions(data.MAJORS);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchConstants();
  }, []);

  const handleOnboard = async () => {
    try {
      const currUser = auth.currentUser;
      const response = await fetch("https://learnus.onrender.com/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: currUser?.uid,
          major: selectedMajor,
          teachingMode: selectedLocation,
          budgetCap: budget,
          profilePicture: selectedImageURL,
          onboarded: true,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        const errorMessage = result.error;
        Alert.alert("Onboarding failed: ", errorMessage);
        return console.error(result);
      }
      Alert.alert("Onboarded successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Error: ", error);
      Alert.alert("Onboarding failed: ", error.message);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 20,
      justifyContent: "flex-start",
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
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: "center",
      marginTop: 20,
    },
    name: {
      fontSize: 24,
      fontWeight: "500",
      alignSelf: "center",
      marginTop: 8,
      marginBottom: 10,
      color: text,
    },
    searchBar: {
      borderRadius: 20,
      backgroundColor: "#d1d5db",
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 8,
      paddingVertical: 8,
    },
    dropdown: {
      height: 30,
      flex: 1,
      paddingRight: 8,
    },
    titleText: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 3,
      color: text,
    },
    contentText: {
      fontSize: 16,
      color: "#888888",
      marginBottom: 5,
    },
    textStyle: {
      fontSize: 17,
      marginLeft: 10,
      color: "#222222",
    },
    bookButton: {
      marginTop: 20,
      paddingVertical: 5,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "orange",
    },
    buttonText: {
      marginHorizontal: 4,
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 2,
      color: "white",
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
          <Text style={styles.headerText}>Confirmation</Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={{
            justifyContent: "flex-start",
            flexDirection: "column",
            paddingTop: 20,
            paddingHorizontal: 10,
          }}
        >
          <View style={{ flexDirection: "column" }}>
            <Image source={{ uri: selectedImageURL }} style={styles.avatar} />
          </View>

          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.titleText}>Major</Text>
            <View style={styles.searchBar}>
              <MaterialIcons name="subject" size={25} color={"#ffc04d"} />
              <Text style={styles.textStyle}>
                {majorOptions.find((mjr) => mjr.value == selectedMajor)?.label}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.titleText}>Preferred Teaching Mode</Text>
            <View style={styles.searchBar}>
              <FontAwesome5
                color={"#ffc04d"}
                name="chalkboard-teacher"
                size={20}
              />
              <Text style={styles.textStyle}>{selectedLocation}</Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 5, paddingVertical: 15 }}>
            <Text style={styles.titleText}>Preferred Budget</Text>
            <View style={styles.searchBar}>
              <FontAwesome name="dollar" size={25} color={"#ffc04d"} />
              <Text style={styles.textStyle}>{budget}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bookButton} onPress={handleOnboard}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}
