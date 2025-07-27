import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Class } from "../../constants/types";
import { format } from "date-fns";

type DayOptions = {
  label: string;
  value: number;
};

export default function history() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [pendingClasses, setPendingClasses] = useState<Class[]>([]);
  const [confirmedClasses, setConfirmedClasses] = useState<Class[]>([]);
  const [completedClasses, setCompletedClasses] = useState<Class[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [name, setNames] = useState<Record<string, string>>({});
  const [dayConstants, setDayConstants] = useState<DayOptions[]>([]);
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const STATUS = [
    "Pending",
    "Accepted",
    "Rejected",
    "Paid",
    "Completed",
    "Confirmed",
    "Reviewed",
  ];

  function formatDate(day: number, time: string) {
    const Time = new Date(time);
    const formattedTime = Time.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const formattedDay = dayConstants.find((d) => d.value == day)?.label;

    return formattedDay + "  " + formattedTime;
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setClasses([]);
        fetch(
          `https://learnus.onrender.com/api/users/${currentUser.uid}/classes`,
        )
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch user classes");
            return res.json();
          })
          .then(async (data) => {
            console.log("User classes:", data);
            setClasses(data);
            const pics: Record<string, string> = {};
            const names: Record<string, string> = {};
            await Promise.all(
              data.map(async (cls: any) => {
                try {
                  const res = await fetch(
                    `https://learnus.onrender.com/api/users/${cls.people}`,
                  );
                  if (!res.ok) throw new Error("Failed to fetch user profile");
                  const userData = await res.json();
                  pics[cls.people] = userData.profilePicture;
                  names[cls.people] =
                    userData.firstName + " " + userData.lastName;
                } catch (err) {
                  console.error(err);
                }
              }),
            );
            setProfiles(pics);
            setNames(names);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });
      } else {
        setClasses([]);
      }
    });

    const fetchConstants = async () => {
      fetch("https://learnus.onrender.com/api/constants")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch constants");
          return res.json();
        })
        .then((data) => {
          setDayConstants(data.DAYS);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchConstants();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const pending: Class[] = [];
    const confirmed: Class[] = [];
    const completed: Class[] = [];

    classes.forEach((cls: Class) => {
      const ind = STATUS.indexOf(cls.status);
      if (ind < 5) {
        pending.push(cls);
      } else if (ind == 5) {
        confirmed.push(cls);
      } else if (ind == 6) {
        completed.push(cls);
      }
    });

    console.log(pending);
    console.log(confirmed);
    console.log(completed);
    setPendingClasses(pending);
    setConfirmedClasses(confirmed);
    setCompletedClasses(completed);
  }, [classes]);

  const handleTutorProfile = (id: string) => {
    console.log(id);
    router.push({
      pathname: "/booking/bookingStatus",
      params: {
        id: id,
      },
    });
  };

  function formatAvailability(dayOfWeek: Number, start: string, end: string) {
    const day = dayConstants.find(
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
      marginBottom: 10,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 10,
      color: text,
    },
    titleBar: {
      flexDirection: "row",
      marginBottom: 10,
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginLeft: 10,
      color: text,
    },
    classCard: {
      marginBottom: 20,
      padding: 8,
      borderRadius: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      shadowColor: "#777575ff",
      shadowOffset: { width: 4, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 12,
      backgroundColor: bg,
    },
    subject: {
      fontSize: 18,
      fontWeight: "bold",
      color: text,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 50,
      alignSelf: "center",
      marginTop: 20,
    },
    noClassContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 20,
    },
    noClassText: {
      fontSize: 20,
      fontWeight: "700",
      color: text,
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
          <Text style={styles.headerText}>Classes</Text>
          <View style={{ width: 40 }} />
        </View>

        {/*List*/}
        <ScrollView>
          {classes.length === 0 ? (
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                alignSelf: "center",
                color: text,
              }}
            >
              No classes yet.
            </Text>
          ) : (
            <View>
              {/**Pending */}
              <View style={{ marginBottom: 10 }}>
                <View style={styles.titleBar}>
                  <MaterialIcons
                    name="pending-actions"
                    size={25}
                    color={"red"}
                  />
                  <Text style={styles.title}>Pending actions</Text>
                </View>
                <View>
                  {pendingClasses.length != 0 ? (
                    pendingClasses.map((cls) => {
                      return (
                        <TouchableOpacity
                          key={cls.id}
                          style={styles.classCard}
                          onPress={() => handleTutorProfile(cls.id.toString())}
                        >
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <Text style={styles.subject}>
                              {cls.course} ({cls.role})
                            </Text>
                            <Text style={{ fontSize: 16, color: text }}>
                              {formatDate(cls.dayOfWeek, cls.startTime)}
                            </Text>
                            <Text style={{ fontSize: 16, color: text }}>
                              Status: {cls.status}
                            </Text>
                          </View>
                          <Image
                            source={{ uri: profiles[cls.people] }}
                            style={styles.avatar}
                          />
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.noClassContainer}>
                      <Text style={styles.noClassText}>No pending classes</Text>
                    </View>
                  )}
                </View>
              </View>

              {/**Confirmed */}
              <View>
                <View style={styles.titleBar}>
                  <MaterialCommunityIcons
                    name="progress-check"
                    size={20}
                    color={"#e4a800ff"}
                  />
                  <Text style={styles.title}>Confirmed classes</Text>
                </View>
                <View>
                  {confirmedClasses.length != 0 ? (
                    confirmedClasses.map((cls) => {
                      return (
                        <TouchableOpacity
                          key={cls.id}
                          style={styles.classCard}
                          onPress={() => handleTutorProfile(cls.id.toString())}
                        >
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <Text style={styles.subject}>
                              {cls.course} ({cls.role})
                            </Text>
                            <Text style={{ fontSize: 18, color: text }}>
                              {formatDate(cls.dayOfWeek, cls.startTime)}
                            </Text>
                            <Text style={{ fontSize: 18, color: text }}>
                              Status: {cls.status}
                            </Text>
                          </View>
                          <Image
                            source={{ uri: profiles[cls.people] }}
                            style={styles.avatar}
                          />
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.noClassContainer}>
                      <Text style={styles.noClassText}>
                        No confirmed classes
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/**Completed */}
              <View>
                <View style={styles.titleBar}>
                  <Ionicons
                    name="checkmark-done-circle-sharp"
                    size={20}
                    color={"green"}
                  />
                  <Text style={styles.title}>Completed classes</Text>
                </View>
                <View>
                  {completedClasses.length != 0 ? (
                    completedClasses.map((cls) => {
                      return (
                        <TouchableOpacity
                          key={cls.id}
                          style={styles.classCard}
                          onPress={() => handleTutorProfile(cls.id.toString())}
                        >
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <Text style={styles.subject}>
                              {cls.course} ({cls.role})
                            </Text>
                            <Text style={{ fontSize: 18, color: text }}>
                              {formatDate(cls.dayOfWeek, cls.startTime)}
                            </Text>
                            <Text style={{ fontSize: 18, color: text }}>
                              Status: {cls.status}
                            </Text>
                          </View>
                          <Image
                            source={{ uri: profiles[cls.people] }}
                            style={styles.avatar}
                          />
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.noClassContainer}>
                      <Text style={styles.noClassText}>
                        No completed classes
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}
