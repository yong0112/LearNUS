import { auth } from "@/lib/firebase";
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/components/ThemedContext";
import { Class, Notification, UserProfile } from "@/constants/types";
const screenHeight = Dimensions.get("window").height;

export default function notifications() {
  const router = useRouter();
  const [noti, setNoti] = useState<Notification[]>();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [sessions, setSessions] = useState<Record<string, Class>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { isDarkMode } = useTheme();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setNoti([]);
        setLoading(true);
        try {
          const res = await fetch(
            `https://learnus.onrender.com/api/users/${currentUser.uid}/fetchNoti`,
          );
          if (!res.ok) throw new Error("Failed to fetch notifications");
          const data: Notification[] = await res.json();

          console.log("Notifications:", data);
          setNoti(data);

          if (data.length === 0) {
            setLoading(false);
            return;
          }

          // Fetch profiles
          const tutorProfile: Record<string, UserProfile> = {};
          await Promise.all(
            data.map(async (noti: Notification) => {
              try {
                console.log(`Fetching profile for: ${noti.userId}`);
                const res = await fetch(
                  `https://learnus.onrender.com/api/users/${noti.userId}`,
                );
                if (!res.ok) {
                  console.error(
                    `Failed to fetch profile for ${noti.userId}: ${res.status}`,
                  );
                  return;
                }
                const userData = await res.json();
                tutorProfile[noti.userId] = userData;
              } catch (err) {
                console.error(
                  `Error fetching profile for ${noti.userId}:`,
                  err,
                );
              }
            }),
          );
          setProfiles(tutorProfile);

          // Fetch sessions
          const sessionProfile: Record<string, Class> = {};
          await Promise.all(
            data.map(async (noti: Notification) => {
              try {
                const res = await fetch(
                  `https://learnus.onrender.com/api/users/${currentUser.uid}/classes/${noti.sessionId}`,
                );
                if (!res.ok) {
                  console.error(
                    `Failed to fetch session ${noti.sessionId}: ${res.status} ${res.statusText}`,
                  );
                  return;
                }
                const userData = await res.json();
                sessionProfile[noti.sessionId] = userData;
              } catch (err) {
                console.error(`Error fetching session ${noti.sessionId}:`, err);
              }
            }),
          );
          setSessions(sessionProfile);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setNoti([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNoti = async (noti: Notification) => {
    try {
      const currUser = auth.currentUser;
      const response = await fetch(
        `https://learnus.onrender.com/api/users/${currUser?.uid}/updateNoti`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: currUser?.uid,
            nid: noti.id,
            isRead: true,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update noti");
      router.push("/profile/history");
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
    profileCard: {
      flexDirection: "row",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "gray",
      paddingRight: 10,
      paddingLeft: 15,
      justifyContent: "flex-start",
    },
    buttonBadge: {
      position: "absolute",
      top: 45,
      left: 2,
      width: 8,
      height: 8,
      borderRadius: 20,
      backgroundColor: "#ff0000ff",
    },
    detail: {
      flexDirection: "column",
      marginHorizontal: 5,
      flex: 1,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 50,
      alignSelf: "center",
    },
    name: {
      fontSize: 20,
      fontWeight: "bold",
    },
    detailText: {
      fontSize: 14,
      fontWeight: "600",
      color: "gray",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    rating: {
      fontSize: 18,
      fontWeight: "bold",
    },
    icon: {
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    noFav: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginTop: screenHeight * 0.35,
    },
    noFavText: {
      fontSize: 16,
      color: "gray",
      fontWeight: "semibold",
      textAlignVertical: "center",
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
          <Text style={styles.headerText}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        {/**Body */}
        <ScrollView>
          {loading ? (
            <Text style={styles.noFavText}>Loading</Text>
          ) : noti && noti.length > 0 ? (
            noti.map((noti) => {
              return (
                <TouchableOpacity
                  key={noti.id}
                  style={styles.profileCard}
                  onPress={() => handleNoti(noti)}
                >
                  {!noti.isRead && <View style={styles.buttonBadge} />}
                  <Image
                    style={styles.image}
                    source={{ uri: profiles[noti.userId].profilePicture }}
                  />
                  <View style={styles.detail}>
                    <Text style={styles.name}>{noti.title}</Text>
                    <Text style={styles.detailText}>{noti.message}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.noFav}>
              <Text style={styles.noFavText}>No notifications yet.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}
