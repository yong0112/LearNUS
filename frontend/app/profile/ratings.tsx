import { AntDesign, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Rating } from "react-native-ratings";
import { auth } from "../../lib/firebase";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";

export default function ratings() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any | undefined>(null);
  const [reviews, setReviews] = useState<any | undefined>([]);
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUserProfile(null);
        setReviews([]);
        fetch(`https://learnus.onrender.com/api/users/${currentUser.uid}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch user profile");
            return res.json();
          })
          .then((data) => {
            console.log("User profile:", data);
            setUserProfile(data);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          })
          .then(() => {
            fetch(
              `https://learnus.onrender.com/api/users/${currentUser.uid}/reviews`,
            )
              .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch user reviews");
                return res.json();
              })
              .then((data) => {
                console.log("User reviews:", data);
                setReviews(data);
              })
              .catch((err) => {
                console.error(err);
                setError(err.message);
              });
          });
      } else {
        setUserProfile(null);
        setReviews([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const styles = StyleSheet.create({
    container: { paddingVertical: 40, paddingHorizontal: 20 },
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
      color: text,
    },
    review: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 50,
      alignSelf: "center",
      marginRight: 15,
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
        <Text style={styles.headerText}>Ratings & Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <View
        style={{
          paddingVertical: 10,
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 60, fontWeight: "800", marginBottom: 8, color: text }}>
          {userProfile?.ratings}
        </Text>
        <Rating
          type="star"
          startingValue={userProfile?.ratings}
          readonly
          imageSize={40}
          ratingColor="#FFD700"
          ratingBackgroundColor={bg}
          fractions={10}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "400",
            color: "darkgray",
            marginTop: 8,
          }}
        >
          {reviews?.length || 0} reviews
        </Text>
      </View>

      <View>
        {!reviews ? (
          <Text
            style={{ fontSize: 24, fontWeight: "bold", alignSelf: "center", color: text }}
          >
            Loading reviews...
          </Text>
        ) : reviews.length === 0 ? (
          <Text
            style={{ fontSize: 24, fontWeight: "bold", alignSelf: "center", color: text }}
          >
            No reviews yet.
          </Text>
        ) : (
          reviews.map(
            (review: {
              id: React.Key | null | undefined;
              rating: number;
              date: Date;
              comment: string;
              name: string;
              profilePicture: string;
            }) => (
              <View
                key={review.id}
                style={{ borderBottomWidth: 2, borderBottomColor: "darkgray" }}
              >
                <View style={styles.review}>
                  <Image
                    source={{ uri: review.profilePicture }}
                    style={styles.avatar}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "500",
                      alignSelf: "center",
                      color: text
                    }}
                  >
                    {review.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      alignSelf: "center",
                      color: "darkgray",
                      marginRight: 20,
                    }}
                  >
                    {" "}
                    • {format(review.date, "d MMM yyyy")} •
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        alignSelf: "center",
                        color: text
                      }}
                    >
                      {review.rating}
                    </Text>
                    <AntDesign name="star" size={25} color={"orange"} />
                  </View>
                </View>
                <Text style={{ fontSize: 16, marginBottom: 10, color: text }}>
                  {review.comment}
                </Text>
              </View>
            ),
          )
        )}
      </View>
    </View>
    </ThemedView>
  );
}