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
  View,
} from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { auth } from "../../lib/firebase";

const screenHeight = Dimensions.get("window").height;

export default function Home() {
  const router = useRouter();
  const [tutors, setTutors] = useState<any>([]);
  const [tutorProfiles, setTutorProfiles] = useState<
    Record<string, any | undefined>
  >({});
  const [error, setError] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setTutors([]);
        fetch(`http://192.168.1.9:5000/api/tutors`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch tutors");
            return res.json();
          })
          .then(async (data) => {
            console.log("Tutors:", data);
            setTutors(data);
            const tutorProfile: Record<string, string> = {};
            await Promise.all(
              data.map(async (cls: any) => {
                try {
                  const res = await fetch(
                    `http://192.168.1.9:5000/api/users/${cls.tutor}`,
                  );
                  if (!res.ok) throw new Error("Failed to fetch tutor");
                  const userData = await res.json();
                  tutorProfile[cls.tutor] = userData;
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

  const handleTutorProfile = (tutor: {
    id: React.Key | null | undefined;
    tutor: string;
    course: string;
    location: string;
    description: string;
    availability: string;
    rate: number;
  }) => {
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

  const handleBooking = () => {
    console.log("Booking in progress");
  };

  const handleContact = () => {
    console.log("Contact in progress");
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={require("../../assets/images/logo.jpg")}
          style={styles.image}
        />
        <Text style={styles.headerLear}>Lear</Text>
        <Text style={styles.headerNUS}>NUS</Text>
        <View
          style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}
        >
          <Menu onSelect={handleSettings}>
            <MenuTrigger>
              <Ionicons name="settings-outline" size={30} color="black" />
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
          onPress={() => router.push("/+not-found")}
        >
          <Ionicons name="heart-outline" size={15} color="black" />
          <Text style={styles.buttonText}>Favourites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/+not-found")}
        >
          <Ionicons name="list" size={15} color="black" />
          <Text style={styles.buttonText}>Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/+not-found")}
        >
          <Octicons name="history" size={15} color="black" />
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/+not-found")}
        >
          <MaterialIcons name="stars" size={15} color="black" />
          <Text style={styles.buttonText}>Ratings</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.reminder}>
        <Text style={styles.reminderText}>Currently no classes now...</Text>
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
          <FontAwesome5 name="chalkboard-teacher" size={40} color="black" />
          <Text style={styles.exploreButtonText}>Tutoring</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exploreButton} onPress={handleNUSMods}>
          <Image
            source={require("../../assets/images/nusmods.png")}
            style={{ width: 50, height: 45 }}
          />
          <Text style={styles.exploreButtonText}>NUSMods</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push("/+not-found")}
        >
          <MaterialIcons name="wallet" size={45} color="black" />
          <Text style={styles.exploreButtonText}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push("/+not-found")}
        >
          <SimpleLineIcons name="badge" size={40} color="black" />
          <Text style={styles.exploreButtonText}>Badges</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={{ flexDirection: "row", height: 40, alignItems: "center" }}
        onPress={() => router.push("/tutor_find")}
      >
        <Text style={styles.explore}>Looking for tutor?</Text>
        <AntDesign name={"rightcircle"} size={20} color={"black"} />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {tutors.length === 0 ? (
          <Text
            style={{ fontSize: 24, fontWeight: "bold", alignSelf: "center" }}
          >
            No tutors yet.
          </Text>
        ) : (
          tutors.map(
            (cls: {
              id: React.Key | null | undefined;
              tutor: string;
              availability: string;
              course: string;
              description: string;
              location: string;
              rate: number;
            }) => (
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
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {cls.course}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    fontStyle: "italic",
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
                      <AntDesign name="arrowleft" size={30} color={"orange"} />
                    </TouchableOpacity>
                  </View>
                  <View>
                    <TouchableOpacity>
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
                <Text style={{ fontSize: 18, color: "#888888", marginTop: 10 }}>
                  {selectedTutor.description}
                </Text>
                <Text
                  style={{ fontSize: 22, fontWeight: "600", marginTop: 15 }}
                >
                  Availability
                </Text>
                <Text style={{ fontSize: 18, color: "#888888", marginTop: 5 }}>
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
                      backgroundColor: "lightgray",
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
                      color: "gray",
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
                      backgroundColor: "#f0f0f0",
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
                      color: "gray",
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "flex-start",
    flexDirection: "column",
  },
  headerLear: { fontSize: 25, fontWeight: "bold", marginLeft: 10 },
  headerNUS: { fontSize: 25, fontWeight: "bold", color: "orange" },
  tabBar: {
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 20,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  buttonText: { marginLeft: 6, fontSize: 14, fontWeight: "semibold" },
  reminder: {
    width: "auto",
    height: 150,
    borderRadius: 10,
    backgroundColor: "#aaaaaa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  reminderText: { fontSize: 20, fontWeight: "bold", color: "black" },
  explore: { fontSize: 24, fontWeight: "bold", marginRight: 10 },
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
    backgroundColor: "white",
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
