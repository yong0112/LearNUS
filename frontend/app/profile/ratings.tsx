import { AntDesign, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
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
import { Rating } from "react-native-ratings";
import { auth } from "../../lib/firebase";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";
import { Review, UserProfile } from "@/constants/types";

export default function ratings() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewers, setReviewers] = useState<Record<string, UserProfile>>({});
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
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
              .then(async (data) => {
                console.log("User reviews:", data);
                setReviews(data);
                const people: Record<string, UserProfile> = {};
                await Promise.all(
                  data.map(async (review: Review) => {
                    try {
                      const res = await fetch(
                        `https://learnus.onrender.com/api/users/${review.student}`,
                      );
                      if (!res.ok)
                        throw new Error("Failed to fetch user profile");
                      const userData = await res.json();
                      people[review.student] = userData;
                    } catch (err) {
                      console.error(err);
                    }
                  }),
                );
                setReviewers(people);
              });
          });
      } else {
        setReviews([]);
        setReviewers({});
      }
    });

    return () => unsubscribe();
  }, []);

  const styles = StyleSheet.create({
    container: { paddingVertical: 40, paddingHorizontal: 20 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerText: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 10,
      color: text,
    },
    review: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      justifyContent: "space-between",
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
        {/**Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} />
          </TouchableOpacity>
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
          <Text
            style={{
              fontSize: 60,
              fontWeight: "800",
              marginBottom: 8,
              color: text,
            }}
          >
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

        <ScrollView>
          {!reviews ? (
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                alignSelf: "center",
                color: text,
              }}
            >
              Loading reviews...
            </Text>
          ) : reviews.length === 0 ? (
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                alignSelf: "center",
                color: text,
              }}
            >
              No reviews yet.
            </Text>
          ) : (
            reviews.map((review: Review) => (
              <View
                key={review.id}
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: "darkgray",
                  marginTop: 20,
                }}
              >
                <View style={styles.review}>
                  <View style={{ flexDirection: "row", padding: 10 }}>
                    <Image
                      source={
                        reviewers[review.student]
                          ? { uri: reviewers[review.student].profilePicture }
                          : require("../../assets/images/profile.png")
                      }
                      style={styles.avatar}
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        alignSelf: "center",
                        color: text,
                      }}
                    >
                      {reviewers[review.student]
                        ? reviewers[review.student].firstName
                        : "User not found"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        alignSelf: "center",
                        color: "darkgray",
                        marginRight: 20,
                        marginLeft: 5,
                      }}
                    >
                      • {format(new Date(review.createdAt), "dd MMM yyyy")}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        alignSelf: "flex-end",
                        color: text,
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
            ))
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}
