// chat.tsx
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../lib/firebase";
import { Chat, UserProfile } from "../../constants/types";
import { useTheme } from "@/components/ThemedContext";

export default function ChatMessage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorProfiles, setTutorProfiles] = useState<
    Record<string, UserProfile>
  >({});

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("Error", "You must be logged in to view chats");
          return;
        }
        const token = await currentUser.getIdToken();
        const response = await fetch("https://learnus.onrender.com/api/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log("Fetched chats:", data);
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch chats");
        }
        setChats(data.data || []);

        // Fetch user profiles for participants
        const profiles: Record<string, UserProfile> = {};
        await Promise.all(
          data.data.flatMap((chat: Chat) =>
            chat.participantDetails.map(async (participant) => {
              if (!profiles[participant.uid]) {
                try {
                  const res = await fetch(
                    `https://learnus.onrender.com/api/users/${participant.uid}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  );
                  if (res.ok) {
                    profiles[participant.uid] = await res.json();
                  }
                } catch (err) {
                  console.error(err);
                }
              }
            }),
          ),
        );
        setTutorProfiles(profiles);
        console.log("Fetched tutor profiles:", profiles);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const renderChat = ({ item }: { item: Chat }) => {
    const currentUser = auth.currentUser?.uid;
    const otherParticipant = item.participantDetails.find(
      (p) => p.uid !== currentUser,
    );
    const name = otherParticipant
      ? tutorProfiles[otherParticipant.uid]?.firstName || "Unknown"
      : "Unknown";
    console.log("Rendering chat for:", otherParticipant?.displayName);
    const profilePicture =
      otherParticipant && otherParticipant.uid
        ? tutorProfiles[otherParticipant.uid]?.profilePicture || ""
        : "";
    console.log("Profile picture URL:", profilePicture);

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          router.push({
            pathname: "../chat/chatDetail",
            params: { chatId: item.id },
          })
        }
      >
        <Image source={{ uri: profilePicture }} style={styles.chatImage} />
        <View style={styles.chatInfo}>
          <Text style={[styles.chatName, { color: text }]}>{name}</Text>
          <Text
            style={[
              styles.lastMessage,
              { color: isDarkMode ? "#888" : "#666" },
            ]}
          >
            {item.lastMessage?.text || "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: bg,
    },
    header: {
      fontSize: 30,
      fontWeight: "600",
      color: text,
      marginBottom: 20,
    },
    chatItem: {
      flexDirection: "row",
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#444" : "#ddd",
      alignItems: "center",
    },
    chatImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    chatInfo: {
      flex: 1,
    },
    chatName: {
      fontSize: 18,
      fontWeight: "600",
    },
    lastMessage: {
      fontSize: 14,
      fontStyle: "italic",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      {loading ? (
        <ActivityIndicator size="large" color="orange" />
      ) : chats.length === 0 ? (
        <Text
          style={[styles.lastMessage, { color: text, textAlign: "center" }]}
        >
          No chats yet
        </Text>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}
