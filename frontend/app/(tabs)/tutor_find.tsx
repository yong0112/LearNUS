import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
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
import {
  Tutor,
  UserProfile,
  Day,
  Favourite,
  Session,
} from "../../constants/types";
import SearchBar from "../../components/SearchBar";

const screenHeight = Dimensions.get("window").height;

export default function tutoring() {
  const router = useRouter();
  const [searching, setSearching] = useState("");
  const [searchText, setSearchText] = useState("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorProfile, setTutorProfiles] = useState<
    Record<string, UserProfile | undefined>
  >({});
  const [error, setError] = useState(null);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [dayOptions, setDayOptions] = useState<Day[]>([]);
  const [shortlisted, setShortlisted] = useState<string[]>();
  const [modalVisible, setModalVisible] = useState(false);
  const { location, ratings, minRate, maxRate } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const displayedTutors = filteredTutors.filter((tutor: Tutor) => {
    const profile = tutorProfile[tutor.tutor];
    if (!profile) return null;

    return (
      profile.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      profile.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      tutor.course.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleFilter = () => {
    if (isFiltered) {
      setFilteredTutors(tutors);
      setIsFiltered(false);
      return;
    }

    router.push("/tutor_find/tutor_find_filter");
  };

  const handleSort = (option: string) => {
    switch (option) {
      case "rating-asc":
        sortTutors("rating", "asc");
        break;
      case "rating-desc":
        sortTutors("rating", "desc");
        break;
      case "rate-asc":
        sortTutors("rate", "asc");
        break;
      case "rate-desc":
        sortTutors("rate", "desc");
        break;
    }
  };

  useEffect(() => {
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
    fetchFavourite();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setTutors([]);
        setFilteredTutors([]);
        fetch(`https://learnus.onrender.com/api/tutors`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch tutors");
            return res.json();
          })
          .then(async (data: Tutor[]) => {
            console.log("Tutors:", data);
            const filtered = data.filter((tutor) => {
              return !tutor.booked;
            });
            setTutors(filtered);
            const tutorProfile: Record<string, UserProfile | undefined> = {};
            await Promise.all(
              data.map(async (cls: any) => {
                try {
                  const res = await fetch(
                    `https://learnus.onrender.com/api/users/${cls.tutor}`,
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
        setFilteredTutors([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!tutors.length || Object.keys(tutorProfile).length === 0) return;

    const filtered = tutors.filter((tutor: Tutor) => {
      const locationValue = location ?? "Any";
      const profile = tutorProfile[tutor.tutor];
      if (!profile) return null;

      const locationMatch =
        locationValue === "Any"
          ? true
          : typeof locationValue === "string"
            ? tutor.location.toLowerCase().includes(locationValue.toLowerCase())
            : tutor.location
                .toLowerCase()
                .includes(locationValue[0].toLowerCase());

      return (
        locationMatch &&
        (!ratings ||
          (profile.ratings !== undefined &&
            profile.ratings >= Number(parseFloat(ratings as string)))) &&
        (!minRate || tutor.rate >= Number(parseInt(minRate as string))) &&
        (!maxRate || tutor.rate <= Number(parseInt(maxRate as string)))
      );
    });
    setFilteredTutors(filtered);

    if (
      !location &&
      (!ratings || ratings == "0") &&
      (!minRate || minRate == "0") &&
      (!maxRate || maxRate == "100")
    ) {
      setIsFiltered(false);
    } else {
      setIsFiltered(true);
    }
  }, [location, ratings, minRate, maxRate, tutors, tutorProfile]);

  const sortTutors = (criteria: "rating" | "rate", order: "asc" | "desc") => {
    const sorted = [...tutors].sort((x, y) => {
      let xValue: number;
      let yValue: number;

      switch (criteria) {
        case "rating":
          xValue = tutorProfile[x.tutor]?.ratings ?? 0;
          yValue = tutorProfile[y.tutor]?.ratings ?? 0;
          break;
        case "rate":
          xValue = x.rate;
          yValue = y.rate;
          break;
        default:
          return 0;
      }

      if (xValue < yValue) return order === "asc" ? -1 : 1;
      if (xValue > yValue) return order === "asc" ? 1 : -1;
      return 0;
    });

    setTutors(sorted);
    setIsSorted(true);
  };

  const handleTutorProfile = (tutor: Tutor) => {
    if (!tutorProfile[tutor.tutor]) {
      return;
    }
    setSelectedTutor(tutor);
    setModalVisible(true);
  };

  const toggleFavourite = async (sessionId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const response = await fetch(
          `https:/learnus.onrender.com/api/update-favourite`,
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
    if (!selectedTutor) return;
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
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 10,
      justifyContent: "flex-start",
      opacity: modalVisible ? 0.1 : 1,
    },
    searchBar: {
      flex: 1,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: "#d1d5db",
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
      justifyContent: "space-between",
    },
    filterButton: {
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 2,
      borderColor: isFiltered ? "#b35d02ff" : "gray",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 6,
    },
    sortButton: {
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 2,
      borderColor: isSorted ? "#b35d02ff" : "gray",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 6,
    },
    buttonBadge: {
      position: "absolute",
      top: 4,
      left: 23,
      width: 10,
      height: 10,
      borderRadius: 20,
      backgroundColor: "#b35d02ff",
    },
    filterText: {
      marginHorizontal: 4,
      fontSize: 14,
      fontWeight: "400",
      marginBottom: 2,
      color: isFiltered ? "#b35d02ff" : "gray",
    },
    sortText: {
      marginHorizontal: 4,
      fontSize: 14,
      fontWeight: "400",
      marginBottom: 2,
      color: isSorted ? "#b35d02ff" : "gray",
    },
    buttonSelectedText: {
      marginHorizontal: 4,
      fontSize: 14,
      fontWeight: "400",
      marginBottom: 2,
      color: "white",
    },
    tutorCard: {
      marginBottom: 20,
      flexDirection: "column",
      borderBottomWidth: 2,
      borderBottomColor: "gray",
    },
    image: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "flex-start",
      paddingTop: 5,
      paddingHorizontal: 5,
      borderBottomWidth: 2,
      borderBottomColor: "#444444",
      height: 225,
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
      shadowColor: "#999999",
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
        {/*Search Bar*/}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <SearchBar
            placeholder="Search by tutors name or course code"
            onSearch={handleSearch}
            fontSize={15}
            style={{ flex: 1, justifyContent: "space-between" }}
          />
        </View>

        {/*Filter and Sort*/}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
            <MaterialCommunityIcons
              name="filter-outline"
              size={20}
              color={isFiltered ? "#b35d02ff" : "gray"}
            />
            {isFiltered && <View style={styles.buttonBadge} />}
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>

          <Menu onSelect={handleSort}>
            <MenuTrigger style={styles.sortButton}>
              <MaterialCommunityIcons
                name="sort"
                size={20}
                color={isSorted ? "#b35d02ff" : "gray"}
              />
              <Text style={styles.sortText}>Sort</Text>
              {isSorted && <View style={styles.buttonBadge} />}
              <FontAwesome
                name="angle-down"
                size={20}
                color={isSorted ? "#b35d02ff" : "gray"}
              />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  width: 220,
                  borderRadius: 6,
                  backgroundColor: "white",
                  right: 0,
                },
              }}
            >
              <MenuOption value="rating-asc" text="Rating (Low to High)" />
              <MenuOption value="rating-desc" text="Rating (High to Low)" />
              <MenuOption
                value="rate-asc"
                text="Hourly Rate (Cheap to Expensive)"
              />
              <MenuOption
                value="rate-desc"
                text="Hourly Rate (Expensive to Cheap)"
              />
            </MenuOptions>
          </Menu>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {displayedTutors.length === 0 ? (
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
            displayedTutors.map((tutor: Tutor) => {
              const profile = tutorProfile[tutor.tutor];
              if (!profile) return null;

              return (
                <TouchableOpacity
                  key={tutor.id}
                  style={styles.tutorCard}
                  onPress={() => handleTutorProfile(tutor)}
                >
                  <ImageBackground
                    style={styles.image}
                    source={
                      profile.profilePicture
                        ? { uri: profile.profilePicture }
                        : require("../../assets/images/person.jpg")
                    }
                  >
                    <TouchableOpacity onPress={() => toggleFavourite(tutor.id)}>
                      <AntDesign
                        name="heart"
                        size={25}
                        color={shortlisted?.includes(tutor.id) ? "red" : "gray"}
                      />
                    </TouchableOpacity>
                  </ImageBackground>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{ fontSize: 24, fontWeight: "800", color: text }}
                    >
                      {profile.firstName}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign name="star" size={20} color={"yellow"} />
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "800",
                          color: text,
                        }}
                      >
                        {profile.ratings ?? "N/A"}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#888888",
                    }}
                  >
                    {tutor.course} - {tutor.description}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      fontStyle: "italic",
                      color: "#444444",
                    }}
                  >
                    S${tutor.rate} per hour
                  </Text>
                </TouchableOpacity>
              );
            })
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
              {selectedTutor &&
                (() => {
                  const profile = tutorProfile[selectedTutor.tutor];
                  if (!profile) return null;
                  return (
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
                        source={
                          profile.profilePicture
                            ? { uri: profile.profilePicture }
                            : require("../../assets/images/person.jpg")
                        }
                        style={styles.modalImage}
                      />
                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: "600",
                          alignSelf: "center",
                        }}
                      >
                        {profile.firstName} {profile.lastName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "600",
                          marginTop: 25,
                        }}
                      >
                        {selectedTutor.course}
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          color: isDarkMode ? "#222222" : "#888888",
                          marginTop: 10,
                        }}
                      >
                        {selectedTutor.description}
                      </Text>
                      <Text
                        style={{
                          fontSize: 22,
                          fontWeight: "600",
                          marginTop: 15,
                        }}
                      >
                        Availability
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          color: isDarkMode ? "#222222" : "#888888",
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
                            color: "gray",
                            marginHorizontal: 10,
                          }}
                        >
                          {profile.ratings}/5.0 stars
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
                          <FontAwesome
                            name="dollar"
                            size={30}
                            color={"black"}
                          />
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
                            <Entypo
                              name="old-phone"
                              size={25}
                              color={"black"}
                            />
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
                  );
                })()}
            </View>
          </View>
        </Modal>
      </View>
    </ThemedView>
  );
}
