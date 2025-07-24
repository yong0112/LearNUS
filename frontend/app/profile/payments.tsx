import { Class, UserProfile } from "@/constants/types";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  Asset,
  launchImageLibrary,
  MediaType,
  PhotoQuality,
} from "react-native-image-picker";

export default function payments() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>();
  const [classes, setClasses] = useState<Class[]>();
  const [otherProfiles, setOtherProfiles] =
    useState<Record<string, UserProfile>>();
  const [filteredClasses, setFilteredClasses] = useState<Class[]>();
  const [selectedImage, setSelectedImage] = useState<Asset>();
  const [uploading, setUploading] = useState<boolean>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetch(`https://learnus.onrender.com/api/users/${currentUser.uid}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
          })
          .then((data) => {
            console.log("User profile", data);
            setProfile(data);
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        setProfile(undefined);
      }
    });

    const fetchClasses = () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        fetch(
          `https://learnus.onrender.com/api/users/${currentUser.uid}/classes`,
        )
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch classes");
            return res.json();
          })
          .then(async (data) => {
            console.log("Classes", data);
            setClasses(data);
            const profiles: Record<string, UserProfile> = {};
            await Promise.all(
              data.map(async (cls: any) => {
                try {
                  const res = await fetch(
                    `https://learnus.onrender.com/api/users/${cls.people}`,
                  );
                  if (!res.ok) throw new Error("Failed to fetch profiles");
                  const userData = await res.json();
                  profiles[cls.people] = userData;
                } catch (err) {
                  console.error(err);
                }
              }),
            );
            setOtherProfiles(profiles);
          });
      } else {
        setClasses([]);
      }
    };

    fetchClasses();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (classes) {
      const filtered = classes.filter((cls) => {
        return cls.status == "Confirmed";
      });
      const sorted = filtered.sort(
        (x, y) =>
          new Date(x.updatedAt).getTime() - new Date(y.updatedAt).getTime(),
      );
      console.log(sorted);
      setFilteredClasses(sorted);
    } else {
      setFilteredClasses([]);
    }
  }, [classes]);

  const handleUpload = () => {
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
      formData.append("upload_preset", "paynow_qr");
      formData.append("public_id", `user_${currUser?.uid}_qr`);

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
            `https://learnus.onrender.com/api/update-qr`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                uid: currUser?.uid,
                QR: url,
              }),
            },
          );

          if (!response.ok) {
            const text = await response.text();
            console.log("Error");
            return console.error("Error", text);
          }
          Alert.alert("Payment QR uploaded successfully");
        } catch (err) {
          console.error("Upload error", err);
          Alert.alert("Error: Failed to upload database");
        }

        router.replace("/profile/payments");
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
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
      marginTop: 20,
    },
    content: {
      flexDirection: "column",
    },
    detailBox: {
      flexDirection: "row",
      paddingVertical: 10,
      paddingHorizontal: 5,
      borderTopWidth: 1,
      borderTopColor: "gray",
      justifyContent: "space-between",
      alignItems: "center",
    },
    paymentDetailContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    paymentDetail: {
      fontSize: 15,
      marginLeft: 5,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 50,
      alignSelf: "center",
    },
    amountPaid: {
      fontSize: 18,
      fontStyle: "italic",
      fontWeight: "300",
      color: "red",
      alignSelf: "center",
    },
    amountReceived: {
      fontSize: 18,
      fontStyle: "italic",
      fontWeight: "bold",
      color: "green",
      alignSelf: "center",
    },
    paymentMethod: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    paymentMethodText: {
      fontSize: 15,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 5,
    },
    qr: {
      alignSelf: "center",
      width: 300,
      height: 300,
    },
    noQR: {
      marginVertical: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    noQRText: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 10,
    },
    button: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f4ab6a",
      borderRadius: 10,
      flexDirection: "row",
      paddingVertical: 10,
      marginHorizontal: 15,
      marginTop: 10,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "semibold",
      color: "white",
    },
  });

  return (
    <View style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Finance</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Transaction History */}
      <View>
        <Text style={styles.title}>Transaction History</Text>
        <ScrollView style={styles.content}>
          {filteredClasses && otherProfiles && filteredClasses.length ? (
            filteredClasses.map((cls: Class) => {
              if (cls.role == "Student") {
                return (
                  <View key={cls.id} style={styles.detailBox}>
                    <View style={styles.paymentDetailContainer}>
                      <Image
                        style={styles.avatar}
                        source={{
                          uri: otherProfiles[cls.people].profilePicture,
                        }}
                      />
                      <Text style={styles.paymentDetail}>
                        Payment made to {otherProfiles[cls.people].firstName}{" "}
                        {otherProfiles[cls.people].lastName}
                      </Text>
                    </View>
                    <Text style={styles.amountPaid}>-S${cls.rate}</Text>
                  </View>
                );
              } else {
                return (
                  <View key={cls.id} style={styles.detailBox}>
                    <View style={styles.paymentDetailContainer}>
                      <Image
                        style={styles.avatar}
                        source={{
                          uri: otherProfiles[cls.people].profilePicture,
                        }}
                      />
                      <Text style={styles.paymentDetail}>
                        Payment received from{" "}
                        {otherProfiles[cls.people].firstName}{" "}
                        {otherProfiles[cls.people].lastName}
                      </Text>
                    </View>
                    <Text style={styles.amountReceived}>+S${cls.rate}</Text>
                  </View>
                );
              }
            })
          ) : (
            <View style={styles.noQR}>
              <Text style={styles.noQRText}>No transactions yet.</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/**QR */}
      <View>
        <Text style={styles.title}>Payment Method</Text>
        <View style={styles.content}>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodText}>PayNow QR code</Text>
            <MaterialIcons name="qr-code-2" size={30} color={"black"} />
          </View>
          <Text style={styles.subtitle}>QR code</Text>
          <View style={styles.qr}>
            {profile && profile.QR ? (
              <Image style={styles.qr} source={{ uri: profile.QR }} />
            ) : (
              <View style={styles.noQR}>
                <Text style={styles.noQRText}>
                  No PayNow QR code uploaded yet.
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpload}>
            <Text style={styles.buttonText}>Upload QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
