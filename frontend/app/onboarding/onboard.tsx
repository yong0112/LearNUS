import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import {
  Entypo,
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  CourseOption,
  LocationOption,
  Day,
  Major,
} from "../../constants/types";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
  MediaType,
  PhotoQuality,
} from "react-native-image-picker";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
const screenWidth = Dimensions.get("window").width;

function convertTimeLocally(current: Date) {
  const newDate = new Date();
  const formatted = newDate.setHours(current.getHours() + 8);
  return new Date(formatted);
}

export default function onboard() {
  const router = useRouter();
  const hasFetched = useRef(false);
  const [majorOptions, setMajorOptions] = useState<Major[]>([]);
  const [selectedMajor, setSelectedMajor] = useState("");
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [budget, setBudget] = useState<number[]>();
  const [selectedImage, setSelectedImage] = useState<Asset>();
  const [selectedImageURL, setSelectedImageURL] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchConstants = async () => {
      try {
        const response = await fetch(
          "https://learnus.onrender.com/api/constants",
        );
        if (!response.ok) throw new Error("Failed to fetch constants");
        const data = await response.json();
        setMajorOptions(data.MAJORS || []);
        setLocationOptions(data.FORMATS || []);
        hasFetched.current = true;
      } catch (err) {
        console.error(err);
        setLocationOptions([]);
        setMajorOptions([]);
      }
    };

    fetchConstants();
  }, []);

  const useCamera = () => {
    const options: {
      mediaType: MediaType;
      quality: PhotoQuality;
      maxWidth: number;
      maxHeight: number;
    } = {
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.errorMessage) return;

      if (response.assets && response.assets[0]) {
        const imageFile = response.assets[0];
        setSelectedImage(imageFile);
        uploadToCloud(imageFile);
      }
    });
  };

  const openGallery = () => {
    const options: {
      mediaType: MediaType;
      quality: PhotoQuality;
      maxWidth: number;
      maxHeight: number;
    } = {
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) return;

      if (response.assets && response.assets[0]) {
        const imageFile = response.assets[0];
        setSelectedImage(imageFile);
        uploadToCloud(imageFile);
      }
    });
  };

  const uploadToCloud = async (imageFile: Asset) => {
    setUploading(true);

    try {
      const currUser = auth.currentUser;
      const formData = new FormData();

      if (imageFile && imageFile.uri && imageFile.type && imageFile.fileName) {
        formData.append("file", {
          uri: imageFile.uri,
          type: imageFile.type,
          name: imageFile.fileName || `image_${Date.now()}.jpg`,
        } as any);
      }
      formData.append("upload_preset", "profile_pictures");
      formData.append("public_id", `user_${currUser?.uid}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/difdq7lmt/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();
      console.log("Cloudinary response:", result);

      if (response.ok) {
        const url = result.secure_url;
        console.log("Image URL", url);
        setSelectedImageURL(url);
      } else {
        throw new Error(result.error.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error", err);
      Alert.alert("Error: Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleChangeProfilePic = (option: string) => {
    switch (option) {
      case "camera":
        useCamera();
        break;
      case "gallery":
        openGallery();
        break;
    }
  };

  const handlePosting = () => {
    router.push({
      pathname: "/onboarding/confirmation",
      params: {
        selectedMajor: selectedMajor,
        selectedLocation: selectedLocation,
        budget: budget,
        selectedImageURL: selectedImageURL,
      },
    });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          paddingVertical: 40,
          paddingHorizontal: 20,
        },
        header: {
          flexDirection: "row",
          justifyContent: "center",
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
        reminder: {
          paddingHorizontal: 8,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: "#ffdda7ff",
        },
        reminderText: {
          fontSize: 14,
          fontWeight: "semibold",
        },
        content: {
          justifyContent: "flex-start",
          flexDirection: "column",
          paddingTop: 10,
          paddingHorizontal: 10,
        },
        title: {
          fontSize: 20,
          fontWeight: "500",
          marginBottom: 5,
          color: text,
        },
        searchBar: {
          borderRadius: 20,
          backgroundColor: "#d1d5db",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 8,
        },
        dropdown: {
          height: 50,
          flex: 1,
          paddingRight: 8,
        },
        placeholderStyle: {
          fontSize: 17,
          marginLeft: 10,
          color: "#888888",
        },
        selectedTextStyle: {
          fontSize: 17,
          marginLeft: 10,
          color: "#222222",
        },
        option: {
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 0.5,
          borderBottomColor: "gray",
        },
        uploadButton: {
          marginTop: 8,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: selectedImageURL ? "#ecb34aff" : "orange",
          marginHorizontal: 40,
          paddingVertical: 5,
        },
        uploadButtonText: {
          fontSize: 18,
          fontWeight: "600",
          color: selectedImageURL ? "#ffffffbd" : "white",
        },
        postButton: {
          marginTop: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "orange",
          marginHorizontal: 30,
          paddingVertical: 8,
        },
        buttonText: {
          marginHorizontal: 4,
          fontSize: 24,
          fontWeight: "600",
          marginBottom: 2,
          color: "white",
        },
      }),
    [text, selectedImageURL],
  );

  return (
    <ThemedView style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Onboarding</Text>
      </View>

      <ScrollView>
        {/**Content */}
        <View style={styles.content}>
          <View style={styles.reminder}>
            <Text style={styles.reminderText}>
              *Please provide the information below for us to recommend you with
              some our tutors upon onboarded!
            </Text>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Major</Text>
            <TouchableOpacity style={styles.searchBar}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={majorOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Select your major"}
                value={selectedMajor}
                onChange={(item) => {
                  setSelectedMajor(item.value);
                }}
                renderLeftIcon={() => (
                  <Ionicons color={"gray"} name="search-sharp" size={20} />
                )}
                renderItem={(item) => {
                  if (item.isHeader) {
                    return (
                      <View style={{ padding: 10, backgroundColor: "#f0f0f0" }}>
                        <Text style={{ fontWeight: "bold", color: "#333" }}>
                          {item.label}
                        </Text>
                      </View>
                    );
                  }
                  return (
                    <View style={{ padding: 10 }}>
                      <Text>{item.label}</Text>
                    </View>
                  );
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Preferred Teaching Mode</Text>
            <View style={styles.searchBar}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={locationOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Physical / Online"}
                value={selectedLocation}
                onChange={(item) => {
                  setSelectedLocation(item.value);
                }}
                renderLeftIcon={() => (
                  <Ionicons color={"gray"} name="search-sharp" size={20} />
                )}
              />
            </View>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Preferred Budget Cap</Text>
            <MultiSlider
              values={budget}
              sliderLength={screenWidth * 0.8}
              onValuesChange={setBudget}
              min={0}
              max={100}
              step={1}
              selectedStyle={{ backgroundColor: "orange" }}
              unselectedStyle={{ backgroundColor: "#e0e0e0" }}
              markerStyle={{
                backgroundColor: "orange",
                height: 24,
                width: 24,
              }}
            />

            <View style={{ padding: 20, justifyContent: "flex-start" }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: text }}>
                Budget capped at S${budget ? budget[0].toFixed(1) : "0.0"}
              </Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Profile Picture</Text>
            <View>
              <Menu onSelect={handleChangeProfilePic}>
                <MenuTrigger>
                  <View style={styles.uploadButton}>
                    <Text style={styles.uploadButtonText}>
                      {selectedImageURL ? "Edit upload" : "Upload image"}
                    </Text>
                  </View>
                </MenuTrigger>
                <MenuOptions
                  customStyles={{
                    optionsContainer: {
                      padding: 10,
                      borderRadius: 6,
                      backgroundColor: "white",
                    },
                  }}
                  optionsContainerStyle={{
                    marginLeft: 130,
                    marginTop: 20,
                  }}
                >
                  <MenuOption style={styles.option} value="camera">
                    <Text>Use camera</Text>
                    <Entypo name="camera" size={20} />
                  </MenuOption>
                  <MenuOption style={styles.option} value="gallery">
                    <Text>Open Gallery</Text>
                    <FontAwesome name="photo" size={20} />
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
          </View>

          {/**Posting */}
          <TouchableOpacity style={styles.postButton} onPress={handlePosting}>
            <Text style={styles.buttonText}>Submit!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
