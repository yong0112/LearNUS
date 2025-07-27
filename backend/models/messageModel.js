const { db, admin } = require("../config/firebase");
const { convertTimeLocally } = require("../utils/timeConverter");

class Message {
  constructor(data) {
    this.id = data.id;
    this.chatId = data.chatId;
    this.senderId = data.senderId;
    this.message = data.message;
    this.type = data.type || "text";
    this.timestamp = data.timestamp;
    this.readBy = data.readBy || [];
    this.edited = data.edited || false;
    this.editedAt = data.editedAt || null;
  }

  // Send a new message
  static async create(messageData) {
    try {
      const newMessage = {
        chatId: messageData.chatId,
        senderId: messageData.senderId,
        message: messageData.message,
        type: "text",
        timestamp: convertTimeLocally(
          admin.firestore.FieldValue.serverTimestamp(),
        ),
        readBy: [messageData.senderId],
        edited: false,
      };

      const messageRef = await db.collection("messages").add(newMessage);
      const messageDoc = await messageRef.get();

      return new Message({ id: messageDoc.id, ...messageDoc.data() });
    } catch (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }
  }

  // Get messages for a chat
  static async getChatMessages(chatId, limit = 50, lastMessageId = null) {
    try {
      let query = db
        .collection("messages")
        .where("chatId", "==", chatId)
        .orderBy("timestamp", "desc")
        .limit(limit);

      if (lastMessageId) {
        const lastMessageDoc = await db
          .collection("messages")
          .doc(lastMessageId)
          .get();
        query = query.startAfter(lastMessageDoc);
      }

      const snapshot = await query.get();
      const messages = [];

      snapshot.forEach((doc) => {
        messages.push(new Message({ id: doc.id, ...doc.data() }));
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      throw new Error(`Error getting messages: ${error.message}`);
    }
  }

  // Mark message as read
  static async markAsRead(messageId, userId) {
    try {
      await db
        .collection("messages")
        .doc(messageId)
        .update({
          readBy: admin.firestore.FieldValue.arrayUnion(userId),
        });
    } catch (error) {
      throw new Error(`Error marking message as read: ${error.message}`);
    }
  }

  // Edit message
  async edit(newMessage) {
    try {
      await db
        .collection("messages")
        .doc(this.id)
        .update({
          message: newMessage,
          edited: true,
          editedAt: convertTimeLocally(
            admin.firestore.FieldValue.serverTimestamp(),
          ),
        });

      this.message = newMessage;
      this.edited = true;
    } catch (error) {
      throw new Error(`Error editing message: ${error.message}`);
    }
  }

  // Delete message
  async delete() {
    try {
      await db.collection("messages").doc(this.id).delete();
    } catch (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  }

static async getLatestMessage(chatId, excludeMessageId = null) {
    try {
      let query = db
        .collection("messages")
        .where("chatId", "==", chatId)
        .orderBy("timestamp", "desc")
        .limit(1);

      if (excludeMessageId) {
        query = query.where(admin.firestore.FieldPath.documentId(), "!=", excludeMessageId);
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new Message({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error(`Error getting latest message: ${error.message}`);
    }
  }
}

module.exports = Message;
