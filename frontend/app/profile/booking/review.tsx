import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { auth } from "@/lib/firebase";
import { Day, Class, UserProfile } from "@/constants/types";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AirbnbRating, Rating } from "react-native-ratings";

export default function review() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [reviewNumber, setReviewNumber] = useState<number>(0);
  const [session, setSession] = useState<Class>();
  const [rating, setRating] = useState<number>();
  const [review, setReview] = useState<string>("");
  const [charCount, setCharCount] = useState<number>(0);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const { id } = useLocalSearchParams();
  const MAX_CHARACTER = 300;

  const handleCompleteRating = (value: number) => {
    setRating(value);
  };

  const handleReviewChange = (text: string) => {
    setReview(text);
    setCharCount(text.length);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
      if (currUser) {
        fetch(`https://learnus.onrender.com/api/users/${currUser.uid}`)
          .then((res) => {
            if (!res.ok) throw new Error("Fail to fetch user profile");
            return res.json();
          })
          .then((data) => {
            console.log(data);
            setUserProfile(data);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        throw new Error("User not found");
      }
    });

    const fetchReviewNumber = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const response = await fetch(
            `https://learnus.onrender.com/api/users/${currentUser.uid}/reviews/`,
          )
            .then((res) => {
              if (!res.ok) throw new Error("Fail to fetch user reviews");
              return res.json();
            })
            .then((data) => {
              setReviewNumber(data.length);
              console.log(data);
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (err) {
          console.error(err);
        }
      }
    };

    const fetchSession = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const response = await fetch(
            `https://learnus.onrender.com/api/users/${currentUser.uid}/classes/${id}`,
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
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchReviewNumber();
    fetchSession();
    return () => unsubscribe();
  }, []);

  const handleUpload = async () => {
    if (!rating || !review.trim()) {
      Alert.alert("Please provide a valid feedback");
      return;
    }

    if (!session?.people) {
      Alert.alert("Error", "Tutor information not found");
      return;
    }

    try {
      const currUser = auth.currentUser;
      if (!currUser) return;

      const response = await fetch(
        `https://learnus.onrender.com/api/users/${session.people}/reviews/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tutor: session?.people,
            student: currUser?.uid,
            rating: rating,
            comment: review,
            createdAt: convertTimeLocally(new Date()).toISOString(),
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return console.error(text);
      }

      if (userProfile?.ratings != undefined) {
        const response2 = await fetch(
          `https://learnus.onrender.com/api/update-rating`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uid: session.people,
              ratings:
                (userProfile?.ratings * reviewNumber + rating) /
                (reviewNumber + 1),
            }),
          },
        );

        if (!response2.ok) {
          const text = await response.text();
          return console.error(text);
        }
      }

      const response3 = await fetch(
        `https://learnus.onrender.com/api/users/${currUser?.uid}/classes/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: currUser.uid,
            cid: id,
            status: "Reviewed",
          }),
        },
      );

      if (!response3.ok) {
        const text = await response.text();
        return console.error("Error: ", text);
      }

      Alert.alert("Review posted successfully.");
      router.replace("/profile/booking/bookingStatus");
    } catch (err: any) {
      console.error("Error", err);
      Alert.alert("Review failed to post" + err.message);
    }
  };

  function convertTimeLocally(current: Date) {
    const newDate = new Date();
    const formatted = newDate.setHours(current.getHours() + 8);
    return new Date(formatted);
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
    ratingContainer: {
      marginVertical: 30,
      flexDirection: "column",
    },
    title: {
      marginBottom: 5,
      fontSize: 20,
      fontWeight: "bold",
    },
    reviewContainer: {
      height: 400,
      marginTop: 30,
    },
    textinput: {
      backgroundColor: "#d1d5db",
      flex: 1,
      fontSize: 14,
      borderRadius: 12,
      padding: 16,
      textAlignVertical: "top",
      color: "gray",
    },
    charCount: {
      fontSize: 14,
      color: "#888",
      textAlign: "right",
      marginTop: 8,
    },
    button: {
      marginTop: 20,
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
        <Text style={styles.headerText}>Rating & Review</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Rating */}
      <View style={styles.ratingContainer}>
        <Text style={styles.title}>Rate your tutor: </Text>
        <Rating
          type="star"
          ratingCount={5}
          startingValue={0}
          showRating={false}
          fractions={0}
          imageSize={40}
          onFinishRating={handleCompleteRating}
        />
      </View>

      {/**Review */}
      <View style={styles.reviewContainer}>
        <Text style={styles.title}>Say something about your tutor</Text>
        <TextInput
          multiline
          placeholder="Write your review here ..."
          value={review}
          onChangeText={handleReviewChange}
          style={styles.textinput}
          maxLength={MAX_CHARACTER}
        />
        <Text style={styles.charCount}>
          {charCount}/{MAX_CHARACTER}
        </Text>
      </View>

      {/**Upload */}
      <TouchableOpacity style={styles.button} onPress={handleUpload}>
        <Text style={styles.buttonText}>Upload feedback</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}
