import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/lib/firebase";
import { Class, UserProfile } from "@/constants/types";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function confirmation() {
  const router = useRouter();
  const [session, setSession] = useState<Class>();
  const [profile, setProfile] = useState<UserProfile>();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

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

    fetchProfile();
  }, [session]);

  const handleReceive = async () => {
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
            status: "Confirmed",
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return console.error("Error: ", text);
      }

      Alert.alert("Booking confirmed");
      router.replace("/booking/bookingStatus");
    } catch (err) {
      console.error(err);
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
    body: {
      flexDirection: "column",
      alignItems: "center",
    },
    imageBackground: {
      flexDirection: "row",
      backgroundColor: "#f8f8f8",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 10,
      marginVertical: 5,
      borderRadius: 10,
    },
    image: {
      height: 300,
      width: "100%",
    },
    bodyText: {
      fontSize: 18,
      fontWeight: "semibold",
      marginTop: 30,
    },
    confirmText: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 10,
    },
    responseBar: {
      flexDirection: "column",
      paddingHorizontal: 10,
      marginTop: 50,
    },
    acceptButton: {
      paddingVertical: 5,
      backgroundColor: "#efb261",
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 10,
    },
    rejectButton: {
      paddingVertical: 5,
      backgroundColor: "#fa8072",
      borderRadius: 10,
      alignItems: "center",
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
          onPress={() => router.back()}
        />
        <Text style={styles.headerText}>Payment Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Payment details */}
      <View>
        <Text style={styles.bodyText}>
          {profile?.firstName} {profile?.lastName} has made the payment of S$
          {session?.rate} to you.
        </Text>
        <View style={styles.imageBackground}>
          <Image
            style={styles.image}
            source={{ uri: session?.paymentProof }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.bodyText}>
          Please kindly check your account and make sure you have receive the
          payment.
        </Text>
        <Text style={styles.bodyText}>
          Click on "Confirm" button upon confirmation.
        </Text>
      </View>

      {/**Confirmation*/}
      <View style={styles.responseBar}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleReceive}>
          <Text style={styles.buttonText}>✓ Confirm</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
