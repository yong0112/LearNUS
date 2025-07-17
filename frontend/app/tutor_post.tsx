import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import {
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CourseOption, LocationOption, Day } from "./types";

function convertTimeLocally(current: Date) {
  const newDate = new Date();
  const formatted = newDate.setHours(current.getHours() + 8);
  return new Date(formatted);
}

export default function TutorPost() {
  const router = useRouter();
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dayOptions, setDayOptions] = useState<Day[]>([]);
  const [day, setDay] = useState<number>();
  const current = new Date();
  const [startTime, setStartTime] = useState<Date>(convertTimeLocally(current));
  const [endTime, setEndTime] = useState<Date>(
    convertTimeLocally(new Date(current.setHours(current.getHours() + 2))),
  );
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [rate, setRate] = useState<Number>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        fetch("https://api.nusmods.com/v2/2024-2025/moduleList.json")
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch local courses");
            return res.json();
          })
          .then((data) => {
            return data.map(
              (course: {
                moduleCode: string;
                title: string;
                semesters: number[];
              }) => ({
                label: `${course.moduleCode} - ${course.title}`,
                value: course.moduleCode,
              }),
            );
          })
          .then((data) => {
            setCourseOptions(data);
          })
          .catch((err) => {
            console.error(err);
          });
      } catch (error) {
        console.warn("Using local data due to error: ", error);
        fetch("https://learnus.onrender.com/api/courses")
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch local courses");
            return res.json();
          })
          .then((data) => {
            return data.map(
              (course: {
                moduleCode: string;
                title: string;
                semesters: number[];
              }) => ({
                label: `${course.moduleCode} - ${course.title}`,
                value: course.moduleCode,
              }),
            );
          })
          .then((data) => {
            setCourseOptions(data);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    };

    const fetchConstants = async () => {
      fetch("https://learnus.onrender.com/api/constants")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch constants");
          return res.json();
        })
        .then((data) => {
          setLocationOptions(data.FORMATS);
          setDayOptions(data.DAYS);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchCourses();
    fetchConstants();
  }, []);

  const handlePosting = async () => {
    try {
      const currUser = auth.currentUser;
      const response = await fetch("https://learnus.onrender.com/api/tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutor: currUser?.uid,
          course: selectedCourse,
          location: selectedLocation,
          description: description,
          dayOfWeek: day,
          startTime: startTime,
          endTime: endTime,
          rate: rate,
        }),
      });

      const result = response.json();
      if (!response.ok) {
        return console.error(result);
      }
      Alert.alert("Tutor post created successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Error: ", error);
      Alert.alert("Posting failed" + error.message);
    }
  };

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 40,
      paddingHorizontal: 20,
      justifyContent: "flex-start",
    },
    background: {
      position: "absolute",
      top: -450,
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
    title: {
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
    },
    dropdown: {
      height: 50,
      flex: 1,
      paddingRight: 8,
    },
    placeholderStyle: {
      fontSize: 17,
      marginLeft: 10,
      color: "#888888",
    },
    selectedTextStyle: {
      fontSize: 17,
      marginLeft: 10,
      color: "#222222",
    },
    postButton: {
      marginTop: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "orange",
    },
    buttonText: {
      marginHorizontal: 4,
      fontSize: 28,
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
            color={isDarkMode ? "white" : "orange"}
            onPress={() => router.push("/(tabs)/home")}
          />
          <Text style={styles.headerText}>Tutor Posting</Text>
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
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Course Code</Text>
            <View style={styles.searchBar}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={courseOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Select a course"}
                value={selectedCourse}
                onChange={(item) => {
                  setSelectedCourse(item.value);
                }}
                renderLeftIcon={() => (
                  <Ionicons color={"#ffc04d"} name="search-sharp" size={30} />
                )}
                search
                searchPlaceholder="Search course"
              />
            </View>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Location</Text>
            <View style={styles.searchBar}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={locationOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Physical / Online"}
                value={selectedLocation}
                onChange={(item) => {
                  setSelectedLocation(item.value);
                }}
                renderLeftIcon={() => (
                  <Ionicons color={"#ffc04d"} name="search-sharp" size={30} />
                )}
              />
            </View>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>About the lesson</Text>
            <View style={styles.searchBar}>
              <MaterialIcons name="keyboard" size={25} color="orange" />
              <TextInput
                style={{
                  color: "#222222",
                  fontSize: 17,
                  marginLeft: 10,
                  flex: 1,
                }}
                placeholder="Brief description about the lesson..."
                placeholderTextColor="#888888"
                onChangeText={setDescription}
              />
            </View>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Availability (weekly)</Text>
            <View>
              <View style={styles.searchBar}>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  data={dayOptions}
                  maxHeight={200}
                  labelField="label"
                  valueField="value"
                  placeholder={"Select a day"}
                  value={day}
                  onChange={(item) => {
                    setDay(item.value);
                  }}
                  renderLeftIcon={() => (
                    <Fontisto color={"#ffc04d"} name="date" size={20} />
                  )}
                  search
                  searchPlaceholder="Select a day"
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  paddingHorizontal: 10,
                  marginTop: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  title={`Start: ${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  onPress={() => setShowStart(true)}
                  color={"#ffb347"}
                />
                {showStart && (
                  <DateTimePicker
                    mode="time"
                    value={startTime}
                    onChange={(_, selected) => {
                      setShowStart(false);
                      if (selected) setStartTime(selected);
                    }}
                  />
                )}
                <Text style={{ fontWeight: "800", marginHorizontal: 20 }}>
                  -
                </Text>
                <Button
                  title={`End: ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  onPress={() => setShowEnd(true)}
                  color={"#ffb347"}
                />
                {showEnd && (
                  <DateTimePicker
                    mode="time"
                    value={endTime}
                    onChange={(_, selected) => {
                      setShowEnd(false);
                      if (selected) setEndTime(selected);
                    }}
                  />
                )}
              </View>
            </View>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Hourly Rate</Text>
            <View style={styles.searchBar}>
              <FontAwesome name="dollar" size={25} color="orange" />
              <TextInput
                style={{ color: "#222222", fontSize: 17, marginLeft: 10 }}
                keyboardType="numeric"
                placeholder="Singapore dollar"
                placeholderTextColor="#888888"
                onChangeText={(text) => {
                  const num = parseFloat(text);
                  setRate(isNaN(num) ? undefined : num);
                }}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.postButton} onPress={handlePosting}>
            <Text style={styles.buttonText}>Post!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}
