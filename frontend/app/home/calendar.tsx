import { auth } from "@/lib/firebase";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";
import { Event } from "@/constants/types";
import { useTheme } from "@/components/ThemedContext";
const screenHeight = Dimensions.get("window").height;

export default function CalendarPage() {
  const router = useRouter();
  const currTime = new Date();
  const [selected, setSelected] = useState<string>(currTime.toDateString());
  const [classes, setClasses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventDate, setEventDate] = useState<Date>(currTime);
  const [showDate, setShowDate] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date>(currTime);
  const [showStart, setShowStart] = useState<boolean>(false);
  const [endTime, setEndTime] = useState<Date>(
    new Date(currTime.getTime() + 2 * 60 * 60 * 1000),
  );
  const [showEnd, setShowEnd] = useState<boolean>(false);
  const { isDarkMode } = useTheme();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const handleAddButton = () => {
    setModalVisible(true);
  };

  const handleAddEvent = async () => {
    const newEvent = {
      title: eventTitle,
      date: eventDate,
      startTime: startTime,
      endTime: endTime,
    };

    try {
      const currUser = auth.currentUser;
      const response = await fetch(
        `https://learnus.onrender.com/api/users/${currUser?.uid}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEvent),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        const text = await response.text();
        const errorMessage = result.error;
        Alert.alert("Failed to add: ", errorMessage);
        console.error(text);
        return;
      }

      console.log(response);
      setEvents((events) => [...events, newEvent]);
      Alert.alert("New event added successfully");
      setModalVisible(false);
    } catch (err) {
      console.error("Error: ", err);
      Alert.alert("New event failed to be added");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
      if (currUser) {
        fetch(`https://learnus.onrender.com/api/users/${currUser.uid}/classes`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch classes");
            return res.json();
          })
          .then((data) => {
            console.log("User classes: ", data);
            setClasses(data);
          })
          .catch((err) => {
            console.error(err.message);
          });
      } else {
        setClasses([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
      if (currUser) {
        fetch(`https://learnus.onrender.com/api/users/${currUser.uid}/events`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch events");
            return res.json();
          })
          .then((data) => {
            console.log("User events: ", data);
            const sorted = data.sort(
              (x: Event, y: Event) =>
                new Date(x.startTime).getTime() -
                new Date(y.startTime).getTime(),
            );
            setEvents(data);
          })
          .catch((err) => {
            console.error(err.message);
          });
      } else {
        setEvents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  function getDates(day: number, month: number, year: number) {
    const date = new Date(year, month - 1, 1);
    const dates: string[] = [];

    while (date.getMonth() == month - 1) {
      if (date.getDay() == day) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
      date.setDate(date.getDate() + 1);
    }

    return dates;
  }

  function formatDate(day: number, month: number, year: number) {
    const date = new Date(year, month, day);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth()).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const markedDates: MarkedDates = useMemo(() => {
    const dict: Record<string, any> = {};
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    classes.forEach((cls) => {
      const matchingDates = getDates(cls.date, month, year);
      matchingDates.forEach((date) => {
        dict[date] = {
          marked: true,
          dotColor: "orange",
        };
      });
    });

    events.forEach((event) => {
      const date = formatDate(
        new Date(event.date).getDate(),
        new Date(event.date).getMonth() + 1,
        new Date(event.date).getFullYear(),
      );
      dict[date] = {
        marked: true,
        dotColor: "orange",
      };
    });

    if (selected && dict[selected]) {
      dict[selected] = {
        marked: true,
        selected: true,
        dotColor: "white",
        customStyles: {
          container: {
            backgroundColor: "orange",
            width: 38,
            height: 38,
            borderRadius: 25,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            marginTop: -7,
          },
        },
      };
    } else if (selected) {
      dict[selected] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: "orange",
            width: 38,
            height: 38,
            borderRadius: 25,
            alignSelf: "center",
            justifyContent: "center",
            marginTop: -7,
          },
        },
      };
    }

    return dict;
  }, [classes, selected, events]);

  const classesForSelectedDate = useMemo(() => {
    const formattedDate = new Date(selected);
    return classes.filter((cls) => cls.date == formattedDate.getDay());
  }, [classes, selected]);

  const eventsForSelectedDate = useMemo(() => {
    const formattedDate = new Date(selected);
    return events.filter(
      (event) =>
        new Date(event.date).toDateString() == formattedDate.toDateString(),
    );
  }, [events, selected]);

  function formatTime(date: string) {
    const time = new Date(date);
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
    calendar: {
      borderWidth: 1,
      borderColor: "gray",
      height: 350,
      marginTop: 10,
      marginBottom: 20,
    },
    plus: {
      flexDirection: "row",
      justifyContent: "flex-end",
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 56,
      height: (screenHeight / 100) * 10,
    },
    classList: {
      paddingBottom: 20,
    },
    classBox: {
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "gray",
      flexDirection: "column",
      justifyContent: "space-around",
    },
    modalContent: {
      width: "97%",
      height: screenHeight * 0.85,
      backgroundColor: isDarkMode ? "#999999" : "white",
      borderRadius: 20,
      padding: 15,
      flexDirection: "column",
      overflow: "hidden",
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.8,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      alignSelf: "center",
    },
    inputBar: {
      borderRadius: 10,
      backgroundColor: "#d1d5db",
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 8,
      marginBottom: 40,
    },
    timeBar: {
      borderRadius: 10,
      backgroundColor: "#d1d5db",
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 5,
      padding: 10,
      justifyContent: "space-between",
      marginVertical: 2,
    },
    timeButton: {
      borderRadius: 5,
      padding: 2,
      paddingHorizontal: 5,
      alignSelf: "center",
      backgroundColor: "#9ca3af",
      color: "black",
      fontSize: 16,
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
          <Text style={styles.headerText}>Calendar</Text>
          <View style={{ width: 40 }} />
        </View>

        {/**Calendar */}
        <Calendar
          markingType="custom"
          onDayPress={(day) => {
            setSelected(day.dateString);
          }}
          markedDates={markedDates}
          style={styles.calendar}
          theme={{
            backgroundColor: "#000000",
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#b6c1cd",
            selectedDayBackgroundColor: "orange",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "orange",
            dayTextColor: "black",
            textDisabledColor: "lightgray",
            arrowColor: "orange",
            textDayFontWeight: "300",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "600",
            textDayFontSize: 18,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
            arrowWidth: 40,
            dotColor: "orange",
            selectedDotColor: "white",
          }}
        />

        {/**Classes & Events */}
        <ScrollView style={styles.classList}>
          {classesForSelectedDate.length > 0 ? (
            classesForSelectedDate.map((cls, index) => (
              <View key={index} style={styles.classBox}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: text }}>
                  {cls.course}
                </Text>
                <Text style={{ fontSize: 16, color: text }}>
                  {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                </Text>
              </View>
            ))
          ) : selected ? (
            <View style={{ alignSelf: "center", alignItems: "center" }}>
              <Text
                style={{ fontSize: 20, fontWeight: "semibold", color: text }}
              >
                No classes for today
              </Text>
            </View>
          ) : (
            <View />
          )}

          {eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map((event, index) => (
              <View key={index} style={styles.classBox}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: text }}>
                  {event.title}
                </Text>
                <Text style={{ fontSize: 16, color: text }}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
              </View>
            ))
          ) : (
            <View />
          )}
        </ScrollView>

        <TouchableOpacity style={styles.plus} onPress={handleAddButton}>
          <AntDesign name="pluscircle" size={50} color={"orange"} />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 30,
              }}
            >
              <View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Entypo name="cross" size={30} color={"orange"} />
                </TouchableOpacity>
              </View>

              <View>
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                  New Event
                </Text>
              </View>

              <View>
                <TouchableOpacity onPress={handleAddEvent}>
                  <AntDesign name="plus" size={30} color={"orange"} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: "column", padding: 10 }}>
              <View style={styles.inputBar}>
                <TextInput
                  style={{
                    color: "#222222",
                    fontSize: 17,
                    marginLeft: 10,
                    flex: 1,
                  }}
                  placeholder="Event Title"
                  placeholderTextColor="#888888"
                  onChangeText={setEventTitle}
                />
              </View>

              {/**Date picker */}
              <View style={styles.timeBar}>
                <Text
                  style={{
                    fontSize: 17,
                    marginLeft: 10,
                    color: "#111111",
                    fontWeight: "500",
                  }}
                >
                  Date:{" "}
                </Text>
                <TouchableOpacity onPress={() => setShowDate(true)}>
                  <Text style={styles.timeButton}>
                    {format(eventDate, "dd MMM yyyy")}
                  </Text>
                </TouchableOpacity>
                {showDate && (
                  <DateTimePicker
                    mode="date"
                    value={eventDate}
                    onChange={(_, selected) => {
                      setShowDate(false);
                      if (selected) setEventDate(selected);
                    }}
                  />
                )}
              </View>

              <View style={styles.timeBar}>
                <Text
                  style={{
                    fontSize: 17,
                    marginLeft: 10,
                    color: "#111111",
                    fontWeight: "500",
                  }}
                >
                  Start Time:{" "}
                </Text>
                <TouchableOpacity onPress={() => setShowStart(true)}>
                  <Text style={styles.timeButton}>
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
              </View>
              <View style={styles.timeBar}>
                <Text
                  style={{
                    fontSize: 17,
                    marginLeft: 10,
                    color: "#111111",
                    fontWeight: "500",
                  }}
                >
                  End Time:{" "}
                </Text>
                <TouchableOpacity onPress={() => setShowEnd(true)}>
                  <Text style={styles.timeButton}>
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
        </Modal>
      </View>
    </ThemedView>
  );
}
