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
  View,
} from "react-native";

type DayOptions = {
  label: "string";
  value: "string";
};

export default function history() {
  const router = useRouter();
  const [classes, setClasses] = useState<any>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [dayConstants, setDayConstants] = useState<DayOptions[]>([]);
  const [error, setError] = useState(null);

  function formatDate(day: string, time: string) {
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

  return (
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
          color="white"
          onPress={() => router.push("/(tabs)/profile")}
        />
        <Text style={styles.headerText}>Tutoring History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/*List*/}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {classes.length === 0 ? (
          <Text
            style={{ fontSize: 24, fontWeight: "bold", alignSelf: "center" }}
          >
            No classes yet.
          </Text>
        ) : (
          classes.map(
            (cls: {
              id: React.Key | null | undefined;
              course: string;
              date: string;
              role: string;
              startTime: string;
              endTime: string;
              people: string;
              rate: string;
              status: string;
            }) => (
              <TouchableOpacity
                key={cls.id}
                style={styles.classCard}
                onPress={handleTutorProfile}
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
                  <Text style={{ fontSize: 18 }}>
                    {formatDate(cls.date, cls.startTime)}
                  </Text>
                </View>
                <Image
                  source={{ uri: profiles[cls.people] }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            ),
          )
        )}
      </ScrollView>
    </View>
  );
}

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
    color: "black",
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    alignSelf: "center",
    marginTop: 20,
  },
});
