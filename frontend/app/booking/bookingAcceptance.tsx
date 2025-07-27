import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@/lib/firebase";
import { Day, Class, UserProfile } from "@/constants/types";
import { doc, updateDoc } from "firebase/firestore";

export default function bookingAcceptance() {
  const router = useRouter();
  const [session, setSession] = useState<Class>();
  const [profile, setProfile] = useState<UserProfile>();
  const [dayConstants, setDayConstants] = useState<Day[]>([]);
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

  const handleAccept = async () => {
    const currUser = auth.currentUser;

    if (!currUser) return;

    try {
      const response = await fetch(
        `https://learnus.onrender.com/api/users/${currUser.uid}/classes/${id}/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: currUser.uid,
            cid: id,
            status: "Accepted",
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return console.error("Error: ", text);
      }

      Alert.alert("Booking accepted");
      router.replace("/booking/bookingStatus");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    const currUser = auth.currentUser;

    if (!currUser) return;

    try {
      const response = await fetch(
        `https://learnus.onrender.com/api/users/${currUser.uid}/classes/${id}/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: currUser.uid,
            cid: id,
            status: "Rejected",
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return console.error("Error: ", text);
      }

      Alert.alert("Booking rejected");
      router.replace("/booking/bookingStatus");
    } catch (err) {
      console.error(err);
    }
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
    image: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: "center",
      marginTop: 60,
    },
    content: {
      fontSize: 18,
      fontWeight: "semibold",
      marginVertical: 30,
    },
    details: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      alignSelf: "center",
      marginBottom: 10,
    },
    responseBar: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginTop: 50,
    },
    acceptButton: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      backgroundColor: "green",
      borderRadius: 15,
    },
    rejectButton: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      backgroundColor: "red",
      borderRadius: 20,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "white",
    },
  });

  return (
    <ThemedView style={styles.container}>
      {/**Header */}
      <View>
        <Ionicons
          name="arrow-back-circle"
          size={40}
          color="orange"
          onPress={() => router.back()}
        />
      </View>

      {/**Booking details */}
      {session ? (
        <View>
          <Image
            style={styles.image}
            source={{ uri: profile?.profilePicture }}
          />
          <Text style={styles.content}>
            {profile?.firstName} {profile?.lastName} booked for your tutoring
            session with the details as follows:
          </Text>
          <Text style={styles.details}>{session?.course}</Text>
          <Text style={styles.details}>
            {formatAvailability(
              session?.dayOfWeek,
              session?.startTime,
              session?.endTime,
            )}
          </Text>
        </View>
      ) : (
        <View />
      )}

      {/**Approve or Reject */}
      <View style={styles.responseBar}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.buttonText}>✓ ACCEPT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
          <Text style={styles.buttonText}>✗ REJECT</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
