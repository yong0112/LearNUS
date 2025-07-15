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
import { Class, Tutor, UserProfile } from "../types";

const screenHeight = Dimensions.get("window").height;

export default function Home() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [todayClass, setTodayClass] = useState<Class[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorProfiles, setTutorProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const [error, setError] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setTutors([]);
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
            setTodayClass(
              classes.filter((cls) => cls.date == new Date().getDay()),
            );
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });
      } else {
        setClasses([]);
        setTodayClass([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setTutors([]);
        fetch(`https://learnus.onrender.com/api/tutors`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch tutors");
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
    router.replace("/login");
  };

  const handleNUSMods = () => {
    Linking.openURL("https://nusmods.com");
  };

  const closeModal = () => {
    setSelectedTutor(null);
    setModalVisible(false);
  };

  const handleProfileSharing = () => {
    Alert.alert("Sorry, feature under development");
  };

  const handleBooking = () => {
    if (selectedTutor) {
      router.push({
      pathname: "/booking",
      params: {
        tutor: selectedTutor.tutor,
        course: selectedTutor.course,
        description: selectedTutor.description,
        location: selectedTutor.location,
        availability: selectedTutor.availability,
        rate: selectedTutor.rate,
      },
    });
    }
  };

  const handleContact = () => {
    Alert.alert("Sorry, feature under development");
  };

  function formatTime(date: string) {
    const time = new Date(date);
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "column",
      paddingHorizontal: 20,
      paddingVertical: 40,
      justifyContent: "flex-start",
    },
    headerLear: {
      fontSize: 25,
      fontWeight: "bold",
      marginLeft: 10,
      color: text,
    },
    headerNUS: { fontSize: 25, fontWeight: "bold", color: "orange" },
    tabBar: {
      paddingHorizontal: 0,
      paddingTop: 10,
      paddingBottom: 20,
    },
    tabButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "gray" : "#f2f2f2",
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 6,
      marginHorizontal: 6,
      borderWidth: 1,
      alignSelf: "center",
    },
    buttonText: { marginLeft: 6, fontSize: 14, fontWeight: "semibold" },
    reminder: {
      width: "auto",
      height: 150,
      borderRadius: 10,
      backgroundColor: "#aaaaaa",
      justifyContent: "center",
      marginBottom: 30,
    },
    classBox: {
      marginBottom: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: "gray",
      flexDirection: "column",
      justifyContent: "space-around",
      alignItems: "baseline",
    },
    reminderText: { fontSize: 20, fontWeight: "bold", color: "black" },
    explore: { fontSize: 24, fontWeight: "bold", marginRight: 10, color: text },
    exploreButton: {
      width: 90,
      height: 75,
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "center",
      borderColor: "#ddd",
      marginRight: 20,
    },
    exploreButtonText: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: "semibold",
      textAlign: "center",
      color: text,
    },
    tutorProfile: {
      width: 100,
      height: "auto",
      flexDirection: "column",
      marginRight: 10,
    },
    image: { width: 50, height: 50, borderRadius: 10 },
    modalOverlay: {
      padding: 20,
      alignItems: "center",
      flex: 1,
    },
    modalContent: {
      width: "97%",
      height: screenHeight * 0.95,
      backgroundColor: isDarkMode ? "#999999" : "white",
      borderRadius: 20,
      padding: 15,
      alignItems: "flex-start",
      overflow: "hidden",
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.8,
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/logo.jpg")}
            style={styles.image}
          />
          <Text style={styles.headerLear}>Lear</Text>
          <Text style={styles.headerNUS}>NUS</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => Alert.alert("Sorry, feature under development")}
          >
            <Ionicons name="heart-outline" size={15} color="black" />
            <Text style={styles.buttonText}>Favourites</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push("/profile/history")}
          >
            <Ionicons name="list" size={15} color="black" />
            <Text style={styles.buttonText}>Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push("/profile/ratings")}
          >
            <MaterialIcons name="stars" size={15} color="black" />
            <Text style={styles.buttonText}>Ratings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => router.push("/profile/security")}
          >
            <MaterialIcons name="security" size={15} color="black" />
            <Text style={styles.buttonText}>Security</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.reminder}>
          {todayClass.length > 0 ? (
            todayClass.map((cls, index) => (
              <View key={index} style={styles.classBox}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {cls.course}
                </Text>
                <Text style={{ fontSize: 16 }}>
                  {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ justifyContent: "flex-start", alignSelf: "center" }}>
              <Text style={styles.reminderText}>
                Currently no classes now...
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.explore}>Explore</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/tutor_post")}
          >
            <FontAwesome5 name="chalkboard-teacher" size={40} color={text} />
            <Text style={styles.exploreButtonText}>Tutoring</Text>
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
            onPress={() => router.push("../wallet")}
          >
            <MaterialIcons name="wallet" size={45} color={text} />
            <Text style={styles.exploreButtonText}>Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/profile/achievements")}
          >
            <SimpleLineIcons name="badge" size={40} color={text} />
            <Text style={styles.exploreButtonText}>Badges</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          style={{ flexDirection: "row", height: 40, alignItems: "center" }}
          onPress={() => router.push("/tutor_find")}
        >
          <Text style={styles.explore}>Looking for tutor?</Text>
          <AntDesign name={"rightcircle"} size={20} color={text} />
        </TouchableOpacity>

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
            tutors.map(
              (cls: Tutor) => (
                <TouchableOpacity
                  key={cls.id}
                  style={styles.tutorProfile}
                  onPress={() => handleTutorProfile(cls)}
                >
                  {tutorProfiles[cls.tutor]?.profilePicture ? (
                    <Image
                      source={{ uri: tutorProfiles[cls.tutor].profilePicture }}
                      style={{ width: 80, height: 100, alignSelf: "center" }}
                    />
                  ) : (
                    <Image
                      source={require("../../assets/images/person.jpg")}
                      style={{ width: 80, height: 100, alignSelf: "center" }}
                    />
                  )}
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: text }}
                  >
                    {cls.course}
                  </Text>
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
                </TouchableOpacity>
              ),
            )
          )}
        </ScrollView>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
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
                      <TouchableOpacity onPress={handleProfileSharing}>
                        <FontAwesome name="share" size={30} color={"orange"} />
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
                    {selectedTutor.availability}
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
                  <TouchableOpacity
                    style={{
                      marginTop: 40,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "orange",
                      alignSelf: "stretch",
                    }}
                    onPress={handleBooking}
                  >
                    <Text
                      style={{
                        marginHorizontal: 4,
                        fontSize: 28,
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
                      marginTop: 20,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                      alignSelf: "stretch",
                      flexDirection: "row",
                      borderWidth: 3,
                    }}
                    onPress={handleContact}
                  >
                    <Entypo name="old-phone" size={25} color={"black"} />
                    <Text
                      style={{
                        marginHorizontal: 4,
                        fontSize: 28,
                        fontWeight: "600",
                        marginBottom: 2,
                        color: "black",
                      }}
                    >
                      Contact me!
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ThemedView>
  );
}
