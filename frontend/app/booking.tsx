import { auth } from "@/lib/firebase";
import {
  FontAwesome,
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
import { Session, Day, UserProfile } from "./types";

export default function BookingPage() {
  const router = useRouter();
  const [dayOptions, setDayOptions] = useState<Day[]>([]);
  const [tutorProfile, setTutorProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<any>();
  const {
    tutor,
    course,
    description,
    location,
    dayOfWeek,
    startTime,
    endTime,
    rate,
  } = useLocalSearchParams() as unknown as Session;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      if (tutor) {
        fetch(`https://learnus.onrender.com/api/users/${tutor}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch tutor profile");
            return res.json();
          })
          .then((data) => {
            console.log("Tutor profile data:", data);
            setTutorProfile(data);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });
      } else {
        setTutorProfile(null);
      }
    });

    const fetchConstants = async () => {
      fetch("https://learnus.onrender.com/api/constants")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch constants");
          return res.json();
        })
        .then((data) => {
          setDayOptions(data.DAYS);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchConstants();
    return () => unsubscribe();
  }, []);

  const handleBooking = async () => {
    if (startTime >= endTime) {
      Alert.alert("End time could not be earlier than start time");
      router.reload();
    }
    try {
      const currUser = auth.currentUser;
      const response = await fetch(
        `https://learnus.onrender.com/api/users/${currUser?.uid}/classes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            people: tutor,
            role: "Student",
            course: course,
            dayOfWeek: dayOfWeek,
            startTime: startTime,
            endTime: endTime,
            rate: rate,
            status: "Pending",
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return console.error(text);
      }

      Alert.alert("Tutoring booked successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Error: ", error);
      Alert.alert("Booking failed: " + error.message);
    }
  };

  function formatAvailability(dayOfWeek: Number, start: string, end: string) {
    const day = dayOptions.find(
      (d: { label: String; value: Number }) => d.value == dayOfWeek,
    );
    const startTime = new Date(start);
    const formattedStart = startTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endTime = new Date(end);
    const formattedEnd = endTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${day?.label} (${formattedStart} - ${formattedEnd})`;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 20,
      justifyContent: "flex-start",
    },
    background: {
      position: "absolute",
      top: -550,
      left: -150,
      width: 700,
      height: 650,
      borderRadius: 0,
      backgroundColor: "#ffc04d",
      zIndex: -1,
    },
    headerText: {
      fontSize: 28,
      fontWeight: "bold",
      alignItems: "center",
      justifyContent: "center",
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
        <View style={styles.background} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Ionicons
            name="arrow-back-circle"
            size={40}
            color={text}
            onPress={() => router.push("/tutor_find")}
          />
          <Text style={styles.headerText}>Session Booking</Text>
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
            <Image
              source={{ uri: tutorProfile?.profilePicture }}
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {tutorProfile?.firstName} {tutorProfile?.lastName}
            </Text>
          </View>

          <View style={{ marginHorizontal: 10 }}>
            <Text
              style={{ fontSize: 18, color: "#888888", fontWeight: "bold" }}
            >
              About the lesson
            </Text>
            <Text style={{ fontSize: 18, color: "#888888" }}>
              {description}
            </Text>
          </View>

          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.titleText}>Course Code</Text>
            <View style={styles.searchBar}>
              <MaterialIcons name="subject" size={25} color={"#ffc04d"} />
              <Text style={styles.textStyle}>{course}</Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.titleText}>Day and Time</Text>
            <View style={styles.searchBar}>
              <Fontisto color={"#ffc04d"} name="date" size={20} />
              <Text style={styles.textStyle}>
                {formatAvailability(dayOfWeek, startTime, endTime)}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 5, paddingVertical: 15 }}>
            <Text style={styles.titleText}>Rate</Text>
            <View style={styles.searchBar}>
              <FontAwesome name="dollar" size={25} color={"#ffc04d"} />
              <Text style={styles.textStyle}>{rate}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
            <Text style={styles.buttonText}>Confirm booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}
