// chatDetail.tsx
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useState, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth } from "../../lib/firebase";
import { Chat, Message, UserProfile } from "../../constants/types";
import { io } from "socket.io-client";
import { Entypo } from "@expo/vector-icons";

export default function ChatDetail() {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tutorProfiles, setTutorProfiles] = useState<Record<string, UserProfile>>({});
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("Error", "You must be logged in to chat");
          return;
        }
        const token = await currentUser.getIdToken();
        socketRef.current = io("ws://192.168.1.5:5000", {
          auth: { userId: currentUser.uid, token },
        });

        socketRef.current.on("connect", () => {
          socketRef.current.emit("join", { userId: currentUser.uid, token });
          socketRef.current.emit("join_chat", chatId);
        });

        socketRef.current.on("new_message", (message: Message) => {
          setMessages((prev) => [...prev, message]);
        });

        socketRef.current.on("user_typing", ({ userId }: { userId: string }) => {
          if (userId !== currentUser.uid) {
            setTyping(true);
          }
        });

        socketRef.current.on("user_stopped_typing", ({ userId }: { userId: string }) => {
          if (userId !== currentUser.uid) {
            setTyping(false);
          }
        });

        socketRef.current.on("auth_error", (error: { message: string }) => {
          Alert.alert("Socket Error", error.message);
        });

        socketRef.current.on("error", (error: { message: string }) => {
          Alert.alert("Socket Error", error.message);
        });
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert("Error", error.message);
        } else {
          Alert.alert("Error", "An unknown error occurred");
        }
      }
    };

    const fetchChatAndMessages = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("Error", "You must be logged in to view chats");
          return;
        }
        const token = await currentUser.getIdToken();

        // Fetch chat details
        const chatResponse = await fetch(
          `http://192.168.1.5:5000/api/chat/${chatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const chatData = await chatResponse.json();
        if (!chatResponse.ok) {
          throw new Error(chatData.message || "Failed to fetch chat");
        }
        setChat(chatData.data);

        // Fetch user profiles
        const profiles: Record<string, UserProfile> = {};
        await Promise.all(
          chatData.data.participantDetails.map(async (participant: any) => {
            if (!profiles[participant.uid]) {
              try {
                const res = await fetch(
                  `http://192.168.1.5:5000/api/users/${participant.uid}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (res.ok) {
                  profiles[participant.uid] = await res.json();
                }
              } catch (err) {
                console.error(err);
              }
            }
          })
        );
        setTutorProfiles(profiles);

        // Fetch messages
        const messagesResponse = await fetch(
          `http://192.168.1.5:5000/api/message/${chatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const messagesData = await messagesResponse.json();
        if (!messagesResponse.ok) {
          throw new Error(messagesData.message || "Failed to fetch messages");
        }
        setMessages(messagesData.data || []);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert("Error", error.message);
        } else {
          Alert.alert("Error", "An unknown error occurred");
        }   
      } finally {
        setLoading(false);
      }
    };

    initializeSocket();
    fetchChatAndMessages();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;
    socketRef.current.emit("send_message", {
      chatId,
      message: newMessage,
      type: "text",
    });
    setNewMessage("");
    socketRef.current.emit("user_stopped_typing", { chatId });
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    if (!socketRef.current) return;
    socketRef.current.emit("typing_start", { chatId });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("user_stopped_typing", { chatId });
    }, 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === auth.currentUser?.uid;
    const senderProfile = tutorProfiles[item.senderId] || { firstName: "Unknown", lastName: "" };

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser
            ? styles.currentUserMessage
            : styles.otherUserMessage,
        ]}
      >
        <Text style={[styles.messageText, { color: isCurrentUser ? "white" : text }]}>
          {item.message}
        </Text>
        <Text
          style={[
            styles.timestamp,
            { color: isCurrentUser ? "#ddd" : isDarkMode ? "#888" : "#666" },
          ]}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  const otherParticipantName = chat?.participantDetails
    ? tutorProfiles[
        chat.participantDetails.find((p) => p.uid !== auth.currentUser?.uid)?.uid || ""
      ]?.firstName || "Chat"
    : "Chat";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: bg,
    },
    header: {
      fontSize: 24,
      fontWeight: "600",
      color: text,
      marginBottom: 10,
    },
    backButton: {
      marginBottom: 10,
    },
    messageContainer: {
      maxWidth: "70%",
      padding: 10,
      borderRadius: 10,
      marginVertical: 5,
    },
    currentUserMessage: {
      backgroundColor: "orange",
      alignSelf: "flex-end",
    },
    otherUserMessage: {
      backgroundColor: isDarkMode ? "#444" : "#ddd",
      alignSelf: "flex-start",
    },
    messageText: {
      fontSize: 16,
    },
    timestamp: {
      fontSize: 12,
      fontStyle: "italic",
      alignSelf: "flex-end",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#444" : "#ddd",
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDarkMode ? "#444" : "#ddd",
      borderRadius: 20,
      padding: 10,
      marginRight: 10,
      color: text,
    },
    sendButton: {
      padding: 10,
    },
    typingIndicator: {
      fontSize: 14,
      fontStyle: "italic",
      color: isDarkMode ? "#888" : "#666",
      marginBottom: 5,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/chat")}
      >
        <Entypo name="chevron-left" size={30} color="orange" />
      </TouchableOpacity>
      <Text style={styles.header}>{otherParticipantName}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="orange" />
      ) : (
        <>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
          />
          {typing && (
            <Text style={styles.typingIndicator}>typing...</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={handleTyping}
              placeholder="Type a message..."
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Entypo name="paper-plane" size={24} color="orange" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}