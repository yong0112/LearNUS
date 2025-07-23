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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CourseOption, LocationOption, Day } from "../../constants/types";

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
  const [rate, setRate] = useState<string>("");
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
    if (!selectedCourse || !selectedLocation || !description || !day || !rate) {
      Alert.alert("Please fill in every input field.");
      router.replace("/home/tutor_post");
      return;
    }

    if (typeof rate != "number" || rate < 0) {
      Alert.alert("Please provide valid hourly rate");
      return;
    }

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

      const result = await response.json();
      if (!response.ok) {
        const errorMessage = result.error;
        Alert.alert("Posting failed: ", errorMessage);
        return console.error(result);
      }
      Alert.alert("Tutor post created successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Error: ", error);
      Alert.alert("Posting failed: ", error.message);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerText: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 10,
      color: text,
    },
    content: {
      justifyContent: "flex-start",
      flexDirection: "column",
      paddingTop: 10,
      paddingHorizontal: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "500",
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
    info: {
      fontSize: 14,
      color: "gray",
      marginBottom: 5,
    },
    timeButton: {
      borderRadius: 10,
      backgroundColor: "#efb261",
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    timeText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
    postButton: {
      marginTop: 20,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "orange",
      marginHorizontal: 30,
      paddingVertical: 10,
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
    <ThemedView style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Tutor Posting</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        {/**Content */}
        <View style={styles.content}>
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
                  <Ionicons color={"gray"} name="search-sharp" size={20} />
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
                  <Ionicons color={"gray"} name="search-sharp" size={20} />
                )}
              />
            </View>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>About the lesson</Text>
            <View style={styles.searchBar}>
              <MaterialIcons name="keyboard" size={20} color="gray" />
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
            <Text style={styles.info}>
              *Please note that each tutoring session includes 4 classes per
              month
            </Text>
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
                    <Fontisto color={"gray"} name="date" size={20} />
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
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowStart(true)}
                >
                  <Text style={styles.timeText}>
                    Start:{" "}
                    {startTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEnd(true)}
                >
                  <Text style={styles.timeText}>
                    End:{" "}
                    {endTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
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
              <FontAwesome name="dollar" size={20} color="gray" />
              <TextInput
                style={{ color: "#222222", fontSize: 17, marginLeft: 10 }}
                keyboardType="decimal-pad"
                placeholder="Singapore dollar"
                placeholderTextColor="#888888"
                onChangeText={setRate}
              />
            </View>
          </View>

          {/**Posting */}
          <TouchableOpacity style={styles.postButton} onPress={handlePosting}>
            <Text style={styles.buttonText}>Post!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
