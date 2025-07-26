const { db, admin } = require("../config/firebase");
const { convertTimeLocally } = require("../utils/timeConverter");

class Chat {
  constructor(data) {
    this.id = data.id;
    this.participants = data.participants || [];
    this.type = data.type || "direct";
    this.lastMessage = data.lastMessage || null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.metadata = data.metadata || {}; // For storing tutor post reference, etc.
  }

  // Create a new chat
  static async create(chatData) {
    try {
      const newChat = {
        participants: chatData.participants,
        type: chatData.type || "direct",
        lastMessage: null,
        createdAt: convertTimeLocally(
          admin.firestore.FieldValue.serverTimestamp(),
        ),
        updatedAt: convertTimeLocally(
          admin.firestore.FieldValue.serverTimestamp(),
        ),
        metadata: chatData.metadata || {},
      };

      const chatRef = await db.collection("chats").add(newChat);
      const chatDoc = await chatRef.get();

      return new Chat({ id: chatDoc.id, ...chatDoc.data() });
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }

  // Find existing chat between users
  static async findBetweenUsers(userId1, userId2) {
    try {
      const chatsRef = db.collection("chats");
      const snapshot = await chatsRef
        .where("participants", "array-contains", userId1)
        .where("type", "==", "direct")
        .get();

      let existingChat = null;
      snapshot.forEach((doc) => {
        const chatData = doc.data();
        if (chatData.participants.includes(userId2)) {
          existingChat = new Chat({ id: doc.id, ...chatData });
        }
      });

      return existingChat;
    } catch (error) {
      throw new Error(`Error finding chat: ${error.message}`);
    }
  }

  // Get user's chats
  static async getUserChats(userId) {
    try {
      const chatsRef = db.collection("chats");
      const snapshot = await chatsRef
        .where("participants", "array-contains", userId)
        .orderBy("updatedAt", "desc")
        .get();

      const chats = [];
      snapshot.forEach((doc) => {
        chats.push(new Chat({ id: doc.id, ...doc.data() }));
      });

      return chats;
    } catch (error) {
      throw new Error(`Error getting user chats: ${error.message}`);
    }
  }

  // Get chat by ID
  static async getById(chatId) {
    try {
      const chatDoc = await db.collection("chats").doc(chatId).get();

      if (!chatDoc.exists) {
        return null;
      }

      return new Chat({ id: chatDoc.id, ...chatDoc.data() });
    } catch (error) {
      throw new Error(`Error getting chat: ${error.message}`);
    }
  }

  // Update last message
  async updateLastMessage(messageData) {
    try {
      await db
        .collection("chats")
        .doc(this.id)
        .update({
          lastMessage: {
            text: messageData.message,
            senderId: messageData.senderId,
            timestamp: messageData.timestamp,
            type: messageData.type,
          },
          updatedAt: convertTimeLocally(
            admin.firestore.FieldValue.serverTimestamp(),
          ),
        });
    } catch (error) {
      throw new Error(`Error updating last message: ${error.message}`);
    }
  }

  // Check if user is participant
  isParticipant(userId) {
    return this.participants.includes(userId);
  }
}

module.exports = Chat;
