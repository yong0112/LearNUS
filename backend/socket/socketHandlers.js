const { db, admin } = require("../config/firebase");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  handleConnection(socket) {
    console.log("User connected:", socket.id);

    // Handle user authentication and joining
    socket.on("join", async (data) => {
      try {
        const { userId, token } = data;

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (decodedToken.uid === userId) {
          // Store user connection
          this.connectedUsers.set(userId, socket.id);
          this.userSockets.set(socket.id, userId);
          socket.userId = userId;

          // Join user to their chat rooms
          const userChats = await Chat.getUserChats(userId);
          userChats.forEach((chat) => {
            socket.join(chat.id);
          });

          // Emit online status to relevant chats
          this.emitUserOnlineStatus(userId, true);

          socket.emit("joined", { success: true });
          console.log(`User ${userId} joined successfully`);
        }
      } catch (error) {
        console.error("Authentication failed:", error);
        socket.emit("auth_error", { message: "Authentication failed" });
      }
    });

    // Handle joining specific chat room
    socket.on("join_chat", async (data) => {
      try {
        const { chatId } = data;
        const userId = socket.userId;

        if (!userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        // Verify user is participant
        const chat = await Chat.getById(chatId);
        if (chat && chat.isParticipant(userId)) {
          socket.join(chatId);
          console.log(`User ${userId} joined chat ${chatId}`);
        } else {
          socket.emit("error", { message: "Access denied to chat" });
        }
      } catch (error) {
        console.error("Error joining chat:", error);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // Handle leaving chat room
    socket.on("leave_chat", (data) => {
      const { chatId } = data;
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { chatId, message, type = "text" } = data;
        const userId = socket.userId;

        if (!userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        // Verify user is participant
        const chat = await Chat.getById(chatId);
        if (!chat || !chat.isParticipant(userId)) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        // Create message
        const messageData = {
          chatId,
          senderId: userId,
          message,
          type,
        };

        const newMessage = await Message.create(messageData);

        // Update chat's last message
        await chat.updateLastMessage(newMessage);

        // Emit message to all users in the chat room
        this.io.to(chatId).emit("new_message", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      const { chatId } = data;
      const userId = socket.userId;

      if (userId) {
        socket.to(chatId).emit("user_typing", {
          userId,
          isTyping: true,
        });
      }
    });

    socket.on("typing_stop", (data) => {
      const { chatId } = data;
      const userId = socket.userId;

      if (userId) {
        socket.to(chatId).emit("user_typing", {
          userId,
          isTyping: false,
        });
      }
    });

    // Handle message read receipts
    socket.on("mark_messages_read", async (data) => {
      try {
        const { chatId, messageIds } = data;
        const userId = socket.userId;

        if (!userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        await Promise.all(
          messageIds.map((messageId) => Message.markAsRead(messageId, userId)),
        );

        // Emit read receipt to other users in chat
        socket.to(chatId).emit("messages_read", {
          userId,
          messageIds,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle message deletion
    socket.on("delete_message", async (data) => {
      try {
        const { messageId, chatId } = data;
        const userId = socket.userId;

        if (!userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        // Emit delete event to chat room (HTTP DELETE already handled deletion)
        this.io.to(chatId).emit("message_deleted", {
          messageId,
          chatId,
          userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error processing delete message event:", error);
        socket.emit("error", { message: "Failed to process message deletion" });
      }
    });

    // Handle message editing
    socket.on("edit_message", async (data) => {
      try {
        const { messageId, newMessage, chatId } = data;
        const userId = socket.userId;

        if (!userId) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        // Get message and verify ownership
        const messageRef = await db.collection("messages").doc(messageId).get();

        if (!messageRef.exists) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        const messageData = messageRef.data();

        if (messageData.senderId !== userId) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        const message = new Message({ id: messageId, ...messageData });
        await message.edit(newMessage);

        // Emit updated message to chat room
        this.io.to(chatId).emit("message_edited", {
          messageId,
          newMessage,
          editedAt: new Date(),
          userId,
        });
      } catch (error) {
        console.error("Error editing message:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const userId = this.userSockets.get(socket.id);

      if (userId) {
        this.connectedUsers.delete(userId);
        this.userSockets.delete(socket.id);

        // Emit offline status
        this.emitUserOnlineStatus(userId, false);

        console.log(`User ${userId} disconnected`);
      }
    });
  }

  // Emit user online/offline status to relevant chats
  async emitUserOnlineStatus(userId, isOnline) {
    try {
      const userChats = await Chat.getUserChats(userId);

      userChats.forEach((chat) => {
        this.io.to(chat.id).emit("user_status_changed", {
          userId,
          isOnline,
          timestamp: new Date(),
        });
      });
    } catch (error) {
      console.error("Error emitting user status:", error);
    }
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get online users in a chat
  async getOnlineUsersInChat(chatId) {
    try {
      const chat = await Chat.getById(chatId);
      if (!chat) return [];

      return chat.participants.filter((userId) => this.isUserOnline(userId));
    } catch (error) {
      console.error("Error getting online users:", error);
      return [];
    }
  }
}

module.exports = SocketHandlers;
