import { auth } from "@/lib/firebase";
import { Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { EmailAuthCredential, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, updateEmail } from "@firebase/auth";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Details() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any | undefined>(null);
  const [newProfilePic, setNewProfilePic] = useState<string>("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUserProfile(null);
        fetch(`https://learnus.onrender.com/api/users/${currentUser.uid}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch user profile");
            return res.json();
          })
          .then((data) => {
            console.log("User profile data:", data);
            setUserProfile(data);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChangeProfilePic = async () => {
    Alert.alert("Sorry, feature under development");
    {/**Need to add something with Firebase Storage 
      
      
      
      
      */}

    {/**Update the firestore done */}
    {/**
    const currUser = auth.currentUser;

    if (!currUser) return;

    try {
      const response = await fetch("https://learnus.onrender.com/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: currUser.uid,
          profilePicture: newProfilePic,
          updatedAt: new Date()
        })
      });

      if (!response.ok) {
        const text = await response.text();
        return console.error("Error: ", text);
      }

      Alert.alert("Profile picture changed successfully");
      router.push("/(tabs)/profile");
    } catch (err) {
      console.error(err);
    }
      */}
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
        }}
      >
        <Ionicons
          name="arrow-back-circle"
          size={40}
          color="white"
          onPress={() => router.push("/(tabs)/profile")}
        />
        <Text style={styles.headerText}>Personal Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/*Avatar*/}
      <View style={{ paddingVertical: 20, marginBottom: 40 }}>
        <Image
          source={{ uri: userProfile?.profilePicture }}
          style={styles.avatar}
        />
        <TouchableOpacity
          style={{ alignSelf: "center", marginLeft: 100 }}
          onPress={handleChangeProfilePic}
        >
          <MaterialCommunityIcons name="progress-pencil" size={30} />
        </TouchableOpacity>
      </View>

      {/*Info List*/}
      <View style={styles.info}>
        <View style={{ paddingBottom: 35 }}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.field}>{userProfile?.firstName}</Text>
        </View>
        <View style={{ paddingBottom: 35 }}>
          <Text style={styles.label}>Last Name</Text>
          <Text style={styles.field}>{userProfile?.lastName}</Text>
        </View>
        <View style={{ paddingBottom: 35 }}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.field}>Unknown</Text>
        </View>
        <View style={{ paddingBottom: 35 }}>
          <Text style={styles.label}>Email</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomColor: "#aaaaaa",
              borderBottomWidth: 2,
            }}
          >
            <Text
              style={{ fontSize: 16, marginHorizontal: 5, color: "#666666" }}
            >
              {userProfile?.email}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20 },
  background: {
    position: "absolute",
    top: -550,
    left: -150,
    width: 10000,
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginTop: 20,
  },
  info: { marginHorizontal: 20 },
  label: { fontSize: 24, fontWeight: 500, marginBottom: 10 },
  field: {
    fontSize: 16,
    marginHorizontal: 8,
    color: "#666666",
    borderBottomColor: "#aaaaaa",
    borderBottomWidth: 2,
  },
});
