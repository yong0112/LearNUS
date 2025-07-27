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
  Modal,
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedText, setEditedText] = useState("");
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

        const socket = io("http://192.168.1.3:5000", {
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

          socket.on("message_deleted", ({ messageId, chatId }) => {
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.id !== messageId),
            );
            fetchChatDetails();
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

    const fetchChatDetails = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("You must be logged in to view chats");
        }
        const token = await currentUser.getIdToken();

        const chatResponse = await fetch(
          `http://192.168.1.3:5000/api/chat/${chatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const chatData = await chatResponse.json();
        if (!chatResponse.ok || !chatData.success) {
          throw new Error(chatData.message || "Failed to fetch chat");
        }
        setChat(chatData.data);

        const profiles: Record<string, UserProfile> = {};
        const participantDetails = chatData.participantDetails || [];
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
      } catch (error) {
        console.error("Error fetching chat details:", error);
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
        await fetchChatDetails();

        // Fetch messages
        const messagesResponse = await fetch(
          `http://192.168.1.3:5000/api/message/${chatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const messagesData = await messagesResponse.json();
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

  const handleDeleteMessage = async (messageId: string) => {
    if (!auth.currentUser || !socketRef.current) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `http://192.168.1.3:5000/api/message/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete message");
      }

      socketRef.current.emit("delete_message", { messageId, chatId });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to delete message",
      );
      console.error("Delete message error:", error);
    }
  };

  const handleEditMessage = async (messageId: string, newMessage: string) => {
    if (!auth.currentUser || !socketRef.current || !newMessage.trim()) return;

    try {
      // Optimistically update the message in the UI
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                message: newMessage,
                edited: true,
                editedAt: new Date().toISOString(),
              }
            : msg,
        ),
      );

      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `http://192.168.1.3:5000/api/message/${messageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: newMessage }),
        },
      );

      const text = await response.text();
      console.log("Raw edit response:", text);

      socketRef.current.emit("edit_message", {
        messageId,
        newMessage,
        chatId,
      });
    } catch (error) {
      console.error("Edit message error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to edit message",
      );
    }
  };

  const handleLongPress = (message: Message) => {
    if (message.senderId !== auth.currentUser?.uid) return;

    Alert.alert(
      "Message Options",
      "Choose an action for this message:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit",
          onPress: () => {
            setEditingMessage(message);
            setEditedText(message.message);
            setEditModalVisible(true);
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteMessage(message.id),
        },
      ],
      { cancelable: true },
    );
  };

  const handleSaveEdit = () => {
    if (editingMessage && editedText.trim()) {
      handleEditMessage(editingMessage.id, editedText);
      setEditModalVisible(false);
      setEditingMessage(null);
      setEditedText("");
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingMessage(null);
    setEditedText("");
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
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        disabled={!isCurrentUser}
      >
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
            <View style={styles.messageMeta}>
              {item.edited && (
                <Text
                  style={[
                    styles.editedLabel,
                    {
                      color: isCurrentUser
                        ? "#ddd"
                        : isDarkMode
                          ? "#888"
                          : "#666",
                    },
                  ]}
                >
                  Edited
                </Text>
              )}
              <Text
                style={[
                  styles.timestamp,
                  {
                    color: isCurrentUser
                      ? "#ddd"
                      : isDarkMode
                        ? "#888"
                        : "#666",
                  },
                ]}
              >
                {timestamp
                  ? timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Singapore",
                    })
                  : ""}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
    messageMeta: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    editedLabel: {
      fontSize: 12,
      fontStyle: "italic",
      marginRight: 5,
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
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: bg,
      borderRadius: 10,
      padding: 20,
      width: "80%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: text,
      marginBottom: 15,
    },
    modalInput: {
      width: "100%",
      borderWidth: 1,
      borderColor: isDarkMode ? "#444" : "#ddd",
      borderRadius: 10,
      padding: 10,
      marginBottom: 15,
      color: text,
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    modalButton: {
      padding: 10,
      borderRadius: 5,
      width: "45%",
      alignItems: "center",
    },
    modalSaveButton: {
      backgroundColor: "orange",
    },
    modalCancelButton: {
      backgroundColor: isDarkMode ? "#444" : "#ddd",
    },
    modalButtonText: {
      fontSize: 16,
      color: text,
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
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Message</Text>
            <TextInput
              style={styles.modalInput}
              value={editedText}
              onChangeText={setEditedText}
              placeholder="Enter new message text..."
              placeholderTextColor={isDarkMode ? "#888" : "#666"}
              multiline
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEdit}
                disabled={!editedText.trim()}
              >
                <Text style={[styles.modalButtonText, { color: "white" }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
