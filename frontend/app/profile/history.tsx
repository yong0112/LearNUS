import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
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

type DayOptions = {
  label: string;
  value: number;
};

export default function history() {
  const router = useRouter();
  const [classes, setClasses] = useState<any>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [dayConstants, setDayConstants] = useState<DayOptions[]>([]);
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

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
            await Promise.all(
              data.map(async (cls: any) => {
                try {
                  const res = await fetch(
                    `https://learnus.onrender.com/api/users/${cls.people}`,
                  );
                  if (!res.ok) throw new Error("Failed to fetch user profile");
                  const userData = await res.json();
                  pics[cls.people] = userData.profilePicture;
                } catch (err) {
                  console.error(err);
                }
              }),
            );
            setProfiles(pics);
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

  const handleTutorProfile = () => {
    console.log("Press me");
  };

  const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20 },
    background: {
      position: "absolute",
      top: -550,
      left: -350,
      width: 100000,
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
    classCard: {
      marginBottom: 20,
      padding: 20,
      borderRadius: 20,
      borderWidth: 2,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    subject: {
      fontSize: 22,
      fontWeight: "bold",
      color: text,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 50,
      alignSelf: "center",
      marginTop: 20,
    },
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/*Header*/}
        <View style={styles.background} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Ionicons
            name="arrow-back-circle"
            size={40}
            color={isDarkMode ? "white" : "orange"}
            onPress={() => router.push("/(tabs)/profile")}
          />
          <Text style={styles.headerText}>Tutoring History</Text>
          <View style={{ width: 40 }} />
        </View>

        {/*List*/}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
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
            classes.map(
              (cls: {
                id: React.Key | null | undefined;
                course: string;
                date: number;
                role: string;
                startTime: string;
                endTime: string;
                people: string;
                rate: string;
                status: string;
              }) => (
                <View key={cls.id} style={styles.classCard}>
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
                      {formatDate(cls.date, cls.startTime)}
                    </Text>
                  </View>
                  <Image
                    source={{ uri: profiles[cls.people] }}
                    style={styles.avatar}
                  />
                </View>
              ),
            )
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}
