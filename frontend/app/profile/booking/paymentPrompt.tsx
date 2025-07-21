import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/lib/firebase";
import { Day, Class, UserProfile } from "@/constants/types";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function paymentPrompt() {
  const router = useRouter();
  const [session, setSession] = useState<Class>();
  const [profile, setProfile] = useState<UserProfile>();
  const [dayConstants, setDayConstants] = useState<Day[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
      if (currUser) {
        fetch(
          `https://learnus.onrender.com/api/users/${currUser.uid}/classes/${id}`,
        )
          .then((res) => {
            if (!res.ok) throw new Error("Fail to fetch user classes");
            return res.json();
          })
          .then(async (data) => {
            setSession(data);
            console.log(data);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        throw new Error("User not found");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = () => {
      fetch(`https://learnus.onrender.com/api/users/${session?.people}`)
        .then((res) => {
          if (!res.ok) console.log(res);
          return res.json();
        })
        .then((data) => {
          setProfile(data);
          console.log(data);
        })
        .catch((err) => {
          console.error(err);
        });
    };

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

    fetchProfile();
    fetchConstants();
  }, [session]);

  const handleUpload = () => {
    console.log("Uploading");
  };

  function formatAvailability(dayOfWeek: number, start: string, end: string) {
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
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    headerText: {
      fontSize: 28,
      fontWeight: "bold",
      alignItems: "center",
      justifyContent: "center",
      color: text,
    },
    classDetails: {
      flexDirection: "column",
      marginVertical: 20,
    },
    subHeaderText: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
    },
    detailBox: {
      flexDirection: "row",
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: "gray",
      justifyContent: "space-between",
    },
    titleText: {
      fontSize: 16,
      color: "gray",
    },
    detailText: {
      fontSize: 16,
      color: text,
    },
    qr: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    button: {
      backgroundColor: "orange",
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 10,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
  });

  return (
    <ThemedView style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back-circle"
          size={40}
          color="orange"
          onPress={() => router.push("/profile/booking/bookingStatus")}
        />
        <Text style={styles.headerText}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Class details */}
      {session ? (
        <View>
          <View style={styles.classDetails}>
            <Text style={styles.subHeaderText}>Class Details</Text>
            <View style={styles.detailBox}>
              <View>
                <Text style={styles.titleText}>Tutor name</Text>
              </View>
              <View>
                <Text style={styles.detailText}>
                  {profile?.firstName} {profile?.lastName}
                </Text>
              </View>
            </View>
            <View style={styles.detailBox}>
              <View>
                <Text style={styles.titleText}>Course code</Text>
              </View>
              <View>
                <Text style={styles.detailText}>{session?.course}</Text>
              </View>
            </View>
            <View style={styles.detailBox}>
              <View>
                <Text style={styles.titleText}>Time slot</Text>
              </View>
              <View>
                <Text style={styles.detailText}>
                  {formatAvailability(
                    session?.date,
                    session?.startTime,
                    session?.endTime,
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/**Payment Details */}
          <View style={styles.classDetails}>
            <Text style={styles.subHeaderText}>Payment Details</Text>
            <View style={styles.qr}>
              <Image
                source={
                  profile?.QR
                    ? { uri: profile.QR }
                    : require("../../../assets/images/fakeQR.jpg")
                }
              />
            </View>
            <View style={styles.detailBox}>
              <View>
                <Text style={styles.titleText}>Amount to pay (in S$)</Text>
              </View>
              <View>
                <Text style={styles.detailText}>{session.rate}</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View />
      )}

      {/**Upload payment proof */}
      <TouchableOpacity style={styles.button} onPress={handleUpload}>
        <Text style={styles.buttonText}>Upload receipt</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}
