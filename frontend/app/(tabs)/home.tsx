import {
  AntDesign,
  Entypo,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { auth } from "../../lib/firebase";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Class,
  Tutor,
  UserProfile,
  Day,
  Notification,
} from "../../constants/types";
import { useFonts } from "expo-font";
import { useTheme } from "@/components/ThemedContext";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [todayClass, setTodayClass] = useState<Class[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [shortlisted, setShortlisted] = useState<string[]>();
  const [hasNoti, setHasNoti] = useState<boolean>(false);
  const [dayOptions, setDayOptions] = useState<Day[]>([]);
  const [tutorProfiles, setTutorProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const [error, setError] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const [fontLoaded] = useFonts({
    "Itim-Regular": require("../../assets/fonts/Itim-Regular.ttf"),
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setClasses([]);
        fetch(
          `https://learnus.onrender.com/api/users/${currentUser.uid}/classes`,
        )
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch classes");
            return res.json();
          })
          .then(async (data: Class[]) => {
            console.log("Classes:", data);
            setClasses(data);
            const today = data.filter((cls: Class) => {
              return cls.dayOfWeek == new Date().getDay();
            });
            console.log(today);
            setTodayClass(today);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });
      } else {
        setClasses([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setTutors([]);
        await fetch(`https://learnus.onrender.com/api/tutors/suggested`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentId: currentUser.uid }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch suggested tutors");
            return res.json();
          })
          .then(async (data: Tutor[]) => {
            console.log("Tutors:", data);
            setTutors(data);
            const tutorProfile: Record<string, UserProfile> = {};
            await Promise.all(
              data.map(async (cls: Tutor) => {
                try {
                  const res = await fetch(
                    `https://learnus.onrender.com/api/users/${cls.tutor}`,
                  );
                  if (!res.ok) throw new Error("Failed to fetch tutor");
                  const userData = await res.json();
                  tutorProfile[cls.tutor] = userData as UserProfile;
                } catch (err) {
                  console.error(err);
                }
              }),
            );
            setTutorProfiles(tutorProfile);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });
      } else {
        setTutors([]);
      }
    });

    const fetchFavourite = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await fetch(
            `https://learnus.onrender.com/api/users/${currentUser.uid}`,
          )
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch user favourites");
              return res.json();
            })
            .then((data) => {
              console.log("User favourites", data.favourites);
              setShortlisted(data.favourites || []);
            });
        } catch (err) {
          console.error(err);
          setShortlisted([]);
        }
      }
    };

    const fetchNotification = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await fetch(
            `https://learnus.onrender.com/api/users/${currentUser.uid}/fetchNoti`,
          )
            .then((res) => {
              if (!res.ok)
                throw new Error("Failed to fetch user notifications");
              return res.json();
            })
            .then((data) => {
              const notiCount = data.filter(
                (noti: Notification) => !noti.isRead,
              );
              setHasNoti(notiCount == 0 ? false : true);
            });
        } catch (err) {
          console.error(err);
          setShortlisted([]);
        }
      }
    };

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

    fetchFavourite();
    fetchNotification();
    fetchConstants();
    return () => unsubscribe();
  }, []);

  const handleTutorProfile = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setModalVisible(true);
  };

  const handleSettings = (option: string) => {
    switch (option) {
      case "about":
        Alert.alert("Welcome to LearNUS! That's it haha.");
        break;
      case "help":
        router.push("/profile/contact");
        break;
      case "logout":
        logoutUser();
        break;
    }
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem("authToken");
    await auth.signOut();
    router.replace("/login");
  };

  const handleNUSMods = () => {
    Linking.openURL("https://nusmods.com");
  };

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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setSelectedTutor(null);
    setModalVisible(false);
  };

  const handleBooking = () => {
    if (selectedTutor) {
      router.push({
        pathname: "/tutor_find/booking",
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

  const handleContact = async () => {
    if (!selectedTutor) return;
    setContactLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to contact a tutor");
        setContactLoading(false);
        return;
      }
      const token = await currentUser.getIdToken();
      const response = await fetch(
        "https://learnus.onrender.com/api/chat/tutor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tutorId: selectedTutor.tutor,
            postId: selectedTutor.id,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create chat");
      }
      setContactLoading(false);
      router.push({
        pathname: "../chat/chatDetail",
        params: { chatId: data.data.chatId },
      });
    } catch (error) {
      setContactLoading(false);
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
    }
  };

  function formatTime(date: string) {
    const time = new Date(date);
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
      flexDirection: "column",
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 50,
      opacity: modalVisible ? 0.1 : 1,
    },
    notificationBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 20,
      backgroundColor: "red",
    },
    headerLear: {
      fontSize: 22,
      fontWeight: "bold",
      color: text,
      fontFamily: "Itim-Regular",
    },
    headerNUS: {
      fontSize: 22,
      fontWeight: "bold",
      color: "orange",
      fontFamily: "Itim-Regular",
    },
    reminder: {
      height: 150,
      borderRadius: 20,
      backgroundColor: "#c7c7c7ff",
      marginVertical: 30,
    },
    classBox: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 50,
      borderBottomWidth: 1,
      borderColor: "gray",
      justifyContent: "space-around",
      alignItems: "flex-start",
    },
    reminderText: { fontSize: 20, fontWeight: "bold", color: "black" },
    title: { fontSize: 24, fontWeight: "bold", color: text, marginBottom: 5 },
    exploreBar: {
      paddingHorizontal: 0,
      paddingTop: 5,
      paddingBottom: 20,
      flexDirection: "row",
      marginBottom: 25,
    },
    exploreButton: {
      width: (screenWidth - 40) / 4,
      height: 75,
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      borderColor: "#ddd",
    },
    exploreButtonText: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: "semibold",
      textAlign: "center",
      color: text,
    },
    tabBar: {
      paddingHorizontal: 0,
      paddingTop: 10,
      paddingBottom: 20,
    },
    tutorProfile: {
      width: 150,
      height: 250,
      flexDirection: "column",
    },
    tutorName: {
      fontSize: 14,
      color: "gray",
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
    contactButton: {
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
      flexDirection: "row",
      marginTop: 10,
      paddingVertical: 5,
      alignSelf: "stretch",
      borderWidth: isDarkMode ? 0 : 1,
      opacity: contactLoading ? 0.5 : 1,
    },
    contactButtonText: {
      marginHorizontal: 4,
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 2,
      color: "black",
    },
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/**Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <TouchableOpacity
              onPress={() => router.push("/home/notifications")}
            >
              <MaterialIcons name="notifications-none" size={30} color={text} />
            </TouchableOpacity>
            {hasNoti && <View style={styles.notificationBadge} />}
            <View />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 25,
            }}
          >
            <Text style={styles.headerLear}>Lear</Text>
            <Text style={styles.headerNUS}>NUS</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity onPress={() => router.push("/home/favourites")}>
              <AntDesign
                name="hearto"
                size={28}
                style={{ marginRight: 10, alignSelf: "center" }}
                color={text}
              />
            </TouchableOpacity>
            <Menu onSelect={handleSettings}>
              <MenuTrigger>
                <Ionicons name="settings-outline" size={30} color={text} />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    width: 180,
                    borderRadius: 6,
                    backgroundColor: "white",
                    right: 0,
                  },
                }}
              >
                <MenuOption value="about" text="About Us" />
                <MenuOption value="help" text="Help / Support" />
                <MenuOption value="logout" text="Logout" />
              </MenuOptions>
            </Menu>
          </View>
        </View>

        {/**Reminder */}
        <ScrollView
          style={styles.reminder}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "stretch",
            flexDirection: "column",
          }}
        >
          {todayClass.length > 0 ? (
            todayClass.map((cls, index) => (
              <View key={index} style={styles.classBox}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    flexDirection: "row",
                  }}
                >
                  {cls.course}
                </Text>
                <Text style={{ fontSize: 16, flexDirection: "row" }}>
                  {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ alignSelf: "center", marginTop: 30 }}>
              <Text style={styles.reminderText}>
                Currently no classes now...
              </Text>
            </View>
          )}
        </ScrollView>

        {/**Explore */}
        <Text style={styles.title}>Explore</Text>
        <View style={styles.exploreBar}>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/home/tutor_post")}
          >
            <FontAwesome5 name="chalkboard-teacher" size={40} color={text} />
            <Text style={styles.exploreButtonText}>Be a tutor!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={handleNUSMods}
          >
            <Image
              source={require("../../assets/images/nusmods.png")}
              style={{ width: 50, height: 45 }}
            />
            <Text style={styles.exploreButtonText}>NUSMods</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/home/calendar")}
          >
            <AntDesign name="calendar" size={45} color={text} />
            <Text style={styles.exploreButtonText}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/home/forum")}
          >
            <MaterialIcons name="groups" size={45} color={text} />
            <Text style={styles.exploreButtonText}>Discussion Forum</Text>
          </TouchableOpacity>
        </View>

        {/**Suggested tutors */}
        <Text style={styles.title}>Suggested tutors</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {tutors.length === 0 ? (
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                alignSelf: "center",
                color: text,
              }}
            >
              No tutors yet.
            </Text>
          ) : (
            tutors.map((cls: Tutor) => (
              <TouchableOpacity
                key={cls.id}
                style={styles.tutorProfile}
                onPress={() => handleTutorProfile(cls)}
              >
                {tutorProfiles[cls.tutor] ? (
                  <View>
                    <Image
                      source={{ uri: tutorProfiles[cls.tutor].profilePicture }}
                      style={{ width: 120, height: 150 }}
                    />
                    <Text style={styles.tutorName}>
                      {tutorProfiles[cls.tutor].firstName}{" "}
                      {tutorProfiles[cls.tutor].lastName}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        width: 120,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "bold",
                          color: text,
                          marginRight: 5,
                        }}
                      >
                        {cls.course}
                      </Text>
                      <TouchableOpacity
                        style={{ alignSelf: "center" }}
                        onPress={() => toggleFavourite(cls.id)}
                      >
                        <AntDesign
                          name="heart"
                          size={18}
                          color={shortlisted?.includes(cls.id) ? "red" : "gray"}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "500",
                        fontStyle: "italic",
                        color: text,
                      }}
                    >
                      S${cls.rate} hourly
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContent}>
              {selectedTutor && (
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
                            shortlisted?.includes(selectedTutor.id)
                              ? "red"
                              : "gray"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Image
                    source={{
                      uri: tutorProfiles[selectedTutor.tutor].profilePicture,
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
                    {tutorProfiles[selectedTutor.tutor].firstName}{" "}
                    {tutorProfiles[selectedTutor.tutor].lastName}
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
                      {tutorProfiles[selectedTutor.tutor].ratings}/5.0 stars
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
                        style={styles.contactButton}
                        onPress={handleContact}
                        disabled={contactLoading}
                      >
                        <Entypo name="old-phone" size={25} color={"black"} />
                        <Text style={styles.contactButtonText}>
                          Contact me!
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </ThemedView>
  );
}
