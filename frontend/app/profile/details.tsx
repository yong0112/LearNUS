import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
  MediaType,
  PhotoQuality,
} from "react-native-image-picker";

export default function Details() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any | undefined>(null);
  const [selectedImage, setSelectedImage] = useState<Asset>();
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUserProfile(null);
        fetch(`https://learnus.onrender.com/api/users/${currentUser.uid}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch user profile");
            return res.json();
          })
          .then((data) => {
            console.log("User profile data:", data);
            setUserProfile(data);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
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

        try {
          const response = await fetch(
            `https://learnus.onrender.com/api/update-profile-pic`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                uid: currUser?.uid,
                profilePicture: url,
              }),
            },
          );

          if (!response.ok) {
            const text = await response.text();
            console.log("Error");
            return console.error("Error", text);
          }
          Alert.alert("Profile picture uploaded successfully");
        } catch (err) {
          console.error("Upload error", err);
          Alert.alert("Error: Failed to upload database");
        }

        router.replace("/profile/details");
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

  const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20 },
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
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: "center",
      marginTop: 20,
    },
    info: { marginHorizontal: 20 },
    label: { fontSize: 24, fontWeight: 500, marginBottom: 10, color: text },
    field: {
      fontSize: 16,
      marginHorizontal: 8,
      color: "#666666",
      borderBottomColor: "#aaaaaa",
      borderBottomWidth: 2,
    },
    menu: {
      alignItems: "flex-end",
      width: 60,
      alignSelf: "center",
      marginLeft: 50,
    },
    option: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 0.5,
      borderBottomColor: "gray",
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
          }}
        >
          <Ionicons
            name="arrow-back-circle"
            size={40}
            color={isDarkMode ? "white" : "orange"}
            onPress={() => router.push("/(tabs)/profile")}
          />
          <Text style={styles.headerText}>Personal Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/*Avatar*/}
        <View style={{ paddingVertical: 20, marginBottom: 40 }}>
          <Image
            source={{ uri: userProfile?.profilePicture }}
            style={styles.avatar}
          />
          <View style={styles.menu}>
            <Menu onSelect={handleChangeProfilePic}>
              <MenuTrigger>
                <MaterialCommunityIcons
                  name="progress-pencil"
                  size={30}
                  color={text}
                />
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

        {/*Info List*/}
        <View style={styles.info}>
          <View style={{ paddingBottom: 35 }}>
            <Text style={styles.label}>First Name</Text>
            <Text style={styles.field}>{userProfile?.firstName}</Text>
          </View>
          <View style={{ paddingBottom: 35 }}>
            <Text style={styles.label}>Last Name</Text>
            <Text style={styles.field}>{userProfile?.lastName}</Text>
          </View>
          <View style={{ paddingBottom: 35 }}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.field}>Unknown</Text>
          </View>
          <View style={{ paddingBottom: 35 }}>
            <Text style={styles.label}>Email</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomColor: "#aaaaaa",
                borderBottomWidth: 2,
              }}
            >
              <Text
                style={{ fontSize: 16, marginHorizontal: 5, color: "#666666" }}
              >
                {userProfile?.email}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}
