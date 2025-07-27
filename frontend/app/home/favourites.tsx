import { auth } from "@/lib/firebase";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
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
import { Day, Session, Tutor, UserProfile } from "@/constants/types";
import { Image } from "react-native";
const screenHeight = Dimensions.get("window").height;

export default function favourites() {
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>();
  const [favTutor, setFavTutor] = useState<Tutor[]>();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>();
  const [dayOptions, setDayOptions] = useState<Day[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [shortlisted, setShortlisted] = useState<string[]>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        try {
          fetch(`https://learnus.onrender.com/api/tutors`)
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch tutors' profile");
              return res.json();
            })
            .then((data: Tutor[]) => {
              const filtered = data.filter((profile) => {
                return !profile.booked;
              });
              setTutors(filtered);
              console.log("Tutors", filtered);
            });
        } catch (err) {
          console.error("Error", err);
        }
      } else {
        setTutors([]);
      }
    });

    const fetchConstants = async () => {
      fetch("https://learnus.onrender.com/api/constants")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch constants");
          return res.json();
        })
        .then((data) => {
          setDayOptions(data.DAYS);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchConstants();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFavourite = () => {
      const currentUser = auth.currentUser;
      if (currentUser && tutors) {
        try {
          fetch(`https://learnus.onrender.com/api/users/${currentUser.uid}`)
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch user profile");
              return res.json();
            })
            .then(async (data: UserProfile) => {
              console.log(data);
              const filtered = tutors?.filter((tutor: Tutor) => {
                return Array.isArray(data.favourites) && data.favourites.includes(tutor.id);
              });
              console.log("Favourites", filtered);
              setFavTutor(filtered);
              const tutorProfile: Record<string, UserProfile> = {};
              if (filtered) {
                await Promise.all(
                  filtered.map(async (session: Tutor) => {
                    try {
                      const res = await fetch(
                        `https://learnus.onrender.com/api/users/${session.tutor}`,
                      );
                      if (!res.ok) throw new Error("Failed to fetch tutor");
                      const userData = await res.json();
                      tutorProfile[session.tutor] = userData as UserProfile;
                    } catch (err) {
                      console.error(err);
                    }
                  }),
                );
              }
              console.log("TutorProfile");
              setProfiles(tutorProfile);
            })
            .catch((err) => {
              console.error("Error", err);
            });
        } catch (err) {
          console.error("Error", err);
        }
      } else {
        setFavTutor([]);
      }
    };

    fetchFavourite();
  }, [tutors, shortlisted]);

  const toggleFavourite = async (sessionId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const response = await fetch(
          `https://learnus.onrender.com/api/update-favourite`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uid: currentUser.uid,
              sessionId: sessionId,
            }),
          },
        );

        if (!response.ok) {
          const text = await response.json();
          console.error(text);
        }

        const data = await response.json();
        console.log("Favourites updated", data.favourites);
        setShortlisted(data.favourites);
        router.replace("/home/favourites");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTutorProfile = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedTutor(undefined);
    setModalVisible(false);
  };

  const handleBooking = () => {
    if (selectedTutor) {
      router.push({
        pathname: "../tutor_find/booking",
        params: {
          tutor: selectedTutor.tutor,
          course: selectedTutor.course,
          description: selectedTutor.description,
          location: selectedTutor.location,
          dayOfWeek: selectedTutor.dayOfWeek,
          startTime: selectedTutor.startTime,
          endTime: selectedTutor.endTime,
          rate: selectedTutor.rate,
          profileId: selectedTutor.id,
        },
      });
    }
  };

  const handleContact = () => {
    Alert.alert("Sorry, feature under development");
  };

  function formatAvailability(dayOfWeek: Number, start: string, end: string) {
    const day = dayOptions.find(
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
      paddingVertical: 40,
      paddingHorizontal: 20,
      opacity: modalVisible ? 0.1 : 1,
    },
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
    profileCard: {
      flexDirection: "row",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "gray",
    },
    detail: {
      flexDirection: "column",
      marginHorizontal: 5,
    },
    image: {
      width: 60,
      height: 100,
      borderRadius: 10,
    },
    name: {
      fontSize: 20,
      fontWeight: "bold",
    },
    detailText: {
      fontSize: 16,
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
    modalOverlay: {
      padding: 20,
      alignItems: "center",
      flex: 1,
    },
    modalContent: {
      width: "90%",
      height: screenHeight * 0.9,
      backgroundColor: isDarkMode ? "#999999" : "white",
      borderRadius: 20,
      padding: 15,
      alignItems: "flex-start",
      overflow: "hidden",
      elevation: 10,
      shadowColor: "#444444",
      shadowOpacity: 1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      alignSelf: "center",
    },
    modalImage: {
      width: 120,
      height: 120,
      borderRadius: 50,
      alignSelf: "center",
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
          <Text style={styles.headerText}>Favourites</Text>
          <View style={{ width: 40 }} />
        </View>

        {/**Listing */}
        {favTutor && profiles && favTutor.length > 0 ? (
          favTutor.map((session) => {
            return (
              <TouchableOpacity
                key={session.id}
                style={styles.profileCard}
                onPress={() => handleTutorProfile(session)}
              >
                <Image
                  style={styles.image}
                  source={{ uri: profiles[session.tutor].profilePicture }}
                />
                <View style={styles.detail}>
                  <Text style={styles.name}>
                    {profiles[session.tutor].firstName}{" "}
                    {profiles[session.tutor].lastName}
                  </Text>
                  <Text style={styles.detailText}>{session.course}</Text>
                  <Text style={styles.detailText}>
                    {formatAvailability(
                      session.dayOfWeek,
                      session.startTime,
                      session.endTime,
                    )}
                  </Text>
                </View>
                <View style={styles.icon}>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={20} color={"yellow"} />
                    <Text style={styles.rating}>
                      {profiles[session.tutor].ratings}
                    </Text>
                  </View>
                  <AntDesign
                    name="heart"
                    size={25}
                    color={favTutor.includes(session) ? "red" : "gray"}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.noFav}>
            <MaterialIcons name="find-in-page" size={70} color={"gray"} />
            <Text style={styles.noFavText}>
              Add your favourite tutors by tapping the heart icon on their
              profile.
            </Text>
          </View>
        )}

        {/**Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedTutor && profiles && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      alignSelf: "stretch",
                      marginBottom: 30,
                    }}
                  >
                    <View>
                      <TouchableOpacity onPress={closeModal}>
                        <AntDesign
                          name="arrowleft"
                          size={30}
                          color={"orange"}
                        />
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity
                        onPress={() => toggleFavourite(selectedTutor.id)}
                      >
                        <AntDesign
                          name="heart"
                          size={30}
                          color={
                            favTutor?.includes(selectedTutor) ? "red" : "gray"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Image
                    source={{
                      uri: profiles[selectedTutor.tutor].profilePicture,
                    }}
                    style={styles.modalImage}
                  />
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "600",
                      alignSelf: "center",
                    }}
                  >
                    {profiles[selectedTutor.tutor].firstName}{" "}
                    {profiles[selectedTutor.tutor].lastName}
                  </Text>
                  <Text
                    style={{ fontSize: 24, fontWeight: "600", marginTop: 25 }}
                  >
                    {selectedTutor.course}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: isDarkMode ? "111111" : "#888888",
                      marginTop: 10,
                    }}
                  >
                    {selectedTutor.description}
                  </Text>
                  <Text
                    style={{ fontSize: 22, fontWeight: "600", marginTop: 15 }}
                  >
                    Availability
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: isDarkMode ? "#111111" : "#888888",
                      marginTop: 5,
                    }}
                  >
                    {formatAvailability(
                      selectedTutor.dayOfWeek,
                      selectedTutor.startTime,
                      selectedTutor.endTime,
                    )}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      marginTop: 20,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: isDarkMode ? "#999999" : "white",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 50,
                        height: 50,
                      }}
                    >
                      <AntDesign name="star" size={30} color={"yellow"} />
                    </View>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#222222",
                        marginHorizontal: 10,
                      }}
                    >
                      {profiles[selectedTutor.tutor].ratings}/5.0 stars
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      marginTop: 20,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: isDarkMode ? "#999999" : "white",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 50,
                        height: 50,
                      }}
                    >
                      <FontAwesome name="dollar" size={30} color={"black"} />
                    </View>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#222222",
                        marginHorizontal: 10,
                      }}
                    >
                      {selectedTutor.rate} per hour
                    </Text>
                  </View>
                  {selectedTutor.tutor == auth.currentUser?.uid ? (
                    <View />
                  ) : (
                    <View
                      style={{
                        marginTop: 40,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignSelf: "stretch",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "orange",
                          flexDirection: "row",
                          paddingVertical: 5,
                          alignSelf: "stretch",
                        }}
                        onPress={handleBooking}
                      >
                        <Text
                          style={{
                            marginHorizontal: 4,
                            fontSize: 20,
                            fontWeight: "600",
                            marginBottom: 2,
                            color: "white",
                          }}
                        >
                          Book now!
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "white",
                          flexDirection: "row",
                          marginTop: 10,
                          paddingVertical: 5,
                          alignSelf: "stretch",
                          borderWidth: 1,
                        }}
                        onPress={handleContact}
                      >
                        <Entypo name="old-phone" size={25} color={"black"} />
                        <Text
                          style={{
                            marginHorizontal: 4,
                            fontSize: 20,
                            fontWeight: "600",
                            marginBottom: 2,
                            color: "black",
                          }}
                        >
                          Contact me!
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ThemedView>
  );
}
