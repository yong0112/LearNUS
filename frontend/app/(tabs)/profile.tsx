import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { auth } from "../../lib/firebase";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";

export default function Profile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any | undefined>(null);
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

  const menuItems = [
    { label: "Personal Details", route: "../profile/details" },
    { label: "Tutoring History", route: "../profile/history" },
    { label: "Ratings & Reviews", route: "../profile/ratings" },
    { label: "Achievements & Badges", route: "../profile/achievements" },
    { label: "Payment Methods", route: "../profile/payments" },
    { label: "Security & Privacy", route: "../profile/security" },
    { label: "Contact Us", route: "../profile/contact" },
  ];

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 40,
    },
    circleBackground: {
      position: "absolute",
      top: -450,
      left: -150,
      width: 700,
      height: 650,
      borderRadius: 300,
      backgroundColor: "#FF8C00", // dark orange
      zIndex: -1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 10,
      flex: 1,
      paddingTop: 10,
    },
    headerText: {
      fontSize: 28,
      fontWeight: "bold",
      alignItems: "center",
      justifyContent: "center",
      color: isDarkMode ? "white" : "black",
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: "center",
      marginTop: 20,
    },
    name: {
      fontSize: 30,
      fontWeight: "600",
      alignSelf: "center",
      marginTop: 8,
      marginBottom: 10,
      color: text
    },
    menu: {
      marginTop: 20,
    },
    menuItem: {
      backgroundColor: isDarkMode ? "#222222" : "#f2f2f2",
      padding: 10,
      borderRadius: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    menuText: {
      fontSize: 20,
      fontWeight: "500",
      color: text
    },
    arrow: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#888",
    },
    divider: {
      height: 1,
      backgroundColor: "#ccc",
      marginVertical: 5,
    },
  });

  return (
    <ThemedView style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.circleBackground} />

      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <View>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <View style={{ width: 60, alignItems: "flex-end", paddingRight: 10 }}>
          <Menu onSelect={handleSettings}>
            <MenuTrigger>
              <Ionicons name="settings" size={30} color="white" />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  padding: 10,
                  borderRadius: 6,
                  backgroundColor: "white",
                  right: 0,
                },
              }}
            >
              <MenuOption value="about" text="About" />
              <MenuOption value="help" text="Help / Support" />
              <MenuOption value="logout" text="Logout" />
            </MenuOptions>
          </Menu>
        </View>
      </View>

      <View style={{ flexDirection: "column" }}>
        <Image
          source={{ uri: userProfile?.profilePicture }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{userProfile?.firstName}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>

            {index < menuItems.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </ScrollView>
    </ThemedView>
  );
}