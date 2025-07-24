import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect, useState, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Image,
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
  const [tutorProfiles, setTutorProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("You must be logged in to chat");
        }
        const token = await currentUser.getIdToken();
        const userId = currentUser.uid;

        const socket = io("https://learnus.onrender.com", {
          transports: ["websocket"],
        });

        socketRef.current = socket;

        return new Promise<void>((resolve, reject) => {
          socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            socket.emit("join", { token, userId });
          });

          socket.on("joined", (res) => {
            console.log("Successfully joined socket:", res);
            socket.emit("join_chat", { chatId });
            resolve();
          });

          socket.on("new_message", (newMessage: Message) => {
            setMessages((prevMessages) => {
              const filteredMessages = prevMessages.filter(
                (msg) => !msg.id.startsWith("temp-"),
              );
              return [...filteredMessages, newMessage];
            });
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          });

          socket.on("user_typing", ({ userId, isTyping }) => {
            if (userId !== auth.currentUser?.uid) {
              setTyping(isTyping);
            }
          });

          socket.on("auth_error", (err) => {
            console.error("Socket auth error:", err);
            reject(new Error("Socket authentication failed"));
          });

          socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            reject(new Error("Failed to connect to socket server"));
          });

          socket.on("error", (err) => {
            console.error("Socket error:", err);
            reject(new Error(err.message || "Socket error occurred"));
          });
        });
      } catch (error) {
        throw error;
      }
    };

    const fetchChatAndMessages = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("You must be logged in to view chats");
        }
        const token = await currentUser.getIdToken();

        // Fetch chat details
        const chatResponse = await fetch(
          `https://learnus.onrender.com/api/chat/${chatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const chatData = await chatResponse.json();
        console.log("Chat data:", chatData);
        if (!chatResponse.ok || !chatData.success) {
          if (chatResponse.status === 403) {
            throw new Error("You do not have access to this chat");
          } else if (chatResponse.status === 404) {
            throw new Error("Chat not found");
          }
          throw new Error(chatData.message || "Failed to fetch chat");
        }
        if (!chatData.data) {
          throw new Error("Chat data is missing");
        }
        setChat(chatData.data);
        console.log("Chat details:", chatData.data);

        // Fetch user profiles
        const profiles: Record<string, UserProfile> = {};
        const participantDetails = chatData.participantDetails || [];
        console.log("Participant details:", participantDetails);
        participantDetails.forEach((participant: any) => {
          profiles[participant.uid] = {
            uid: participant.uid,
            email: participant.email || "",
            firstName: participant.displayName || "Unknown",
            lastName: "",
            profilePicture: participant.photoURL || "",
            ratings: 0,
            favourites: [],
            QR: "",
            major: "",
            teachingMode: "",
            budgetCap: 0,
          };
        });
        setTutorProfiles(profiles);
        console.log("Tutor profiles:", tutorProfiles);

        // Fetch messages
        const messagesResponse = await fetch(
          `https://learnus.onrender.com/api/message/${chatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const messagesData = await messagesResponse.json();
        console.log("Messages data:", messagesData);
        if (!messagesResponse.ok) {
          throw new Error(messagesData.message || "Failed to fetch messages");
        }
        setMessages(messagesData.data || []);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        throw error;
      }
    };

    const setupChat = async () => {
      setLoading(true);
      try {
        await initializeSocket();
        await fetchChatAndMessages();
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

    setupChat();

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
    if (!newMessage.trim() || !socketRef.current || !auth.currentUser) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: chatId as string,
      senderId: auth.currentUser.uid,
      message: newMessage,
      type: "text",
      timestamp: new Date().toISOString(),
      readBy: [auth.currentUser.uid],
      edited: false,
      editedAt: null,
      reactions: {},
    };

    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    socketRef.current.emit("send_message", {
      chatId,
      message: newMessage,
      type: "text",
    });
    setNewMessage("");
    socketRef.current.emit("typing_stop", { chatId });
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    if (!socketRef.current || !text.trim()) return;
    socketRef.current.emit("typing_start", { chatId });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing_stop", { chatId });
    }, 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === auth.currentUser?.uid;
    const senderProfile = tutorProfiles[item.senderId] || {
      firstName: "Unknown",
      lastName: "",
    };
    let timestamp: Date | null = null;
    if (typeof item.timestamp === "string" && item.timestamp) {
      timestamp = new Date(item.timestamp);
    } else if (
      typeof item.timestamp === "object" &&
      item.timestamp !== null &&
      typeof (item.timestamp as any)._seconds === "number" &&
      typeof (item.timestamp as any)._nanoseconds === "number"
    ) {
      // Convert Firestore Timestamp to Date
      const ts = item.timestamp as { _seconds: number; _nanoseconds: number };
      timestamp = new Date(ts._seconds * 1000 + ts._nanoseconds / 1000000);
      console.log("timestamp:", ts._seconds * 1000 + ts._nanoseconds / 1000000);
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.messageText,
              { color: isCurrentUser ? "white" : text },
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: isCurrentUser ? "#ddd" : isDarkMode ? "#888" : "#666" },
            ]}
          >
            {timestamp
              ? timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </Text>
        </View>
      </View>
    );
  };

  const otherParticipantName =
    tutorProfiles[
      chat?.participants.find((p) => p !== auth.currentUser?.uid) || ""
    ]?.firstName;
  console.log(
    "Other participant name:",
    chat?.participants.find((p) => p !== auth.currentUser?.uid),
  );
  const profilePicture =
    tutorProfiles[
      chat?.participants.find((p) => p !== auth.currentUser?.uid) || ""
    ]?.profilePicture;
  console.log("Profile picture URL:", profilePicture);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: bg,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      marginTop: 15,
    },
    headerImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
      backgroundColor: isDarkMode ? "#444" : "#ddd",
    },
    headerText: {
      fontSize: 24,
      fontWeight: "600",
      color: text,
    },
    backButton: {
      marginRight: 10,
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
      flexShrink: 1,
      marginRight: 8,
    },
    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
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
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/chat")}
        >
          <Entypo name="chevron-left" size={30} color="orange" />
        </TouchableOpacity>
        <Image style={styles.headerImage} source={{ uri: profilePicture }} />
        <Text style={styles.headerText}>{otherParticipantName}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="orange" />
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
          />
          {typing && (
            <Text style={styles.typingIndicator}>
              {otherParticipantName} is typing...
            </Text>
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
              disabled={!newMessage.trim()}
            >
              <Entypo
                name="paper-plane"
                size={24}
                color={newMessage.trim() ? "orange" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
