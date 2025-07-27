const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const { db } = require("../config/firebase");

const messageController = {
  // Get messages for a chat
  getChatMessages: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { limit = 50, lastMessageId } = req.query;
      const userId = req.user.uid;

      // Verify user is participant of the chat
      const chat = await Chat.getById(chatId);
      if (!chat || !chat.isParticipant(userId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const messages = await Message.getChatMessages(
        chatId,
        parseInt(limit),
        lastMessageId,
      );

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Send a message
  sendMessage: async (req, res) => {
    try {
      const { chatId, message, type = "text" } = req.body;
      const userId = req.user.uid;

      // Verify user is participant of the chat
      const chat = await Chat.getById(chatId);
      if (!chat || !chat.isParticipant(userId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const messageData = {
        chatId,
        senderId: userId,
        message,
        type,
      };

      const newMessage = await Message.create(messageData);

      // Update chat's last message
      await chat.updateLastMessage(newMessage);

      res.status(201).json({
        success: true,
        data: newMessage,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Mark messages as read
  markAsRead: async (req, res) => {
    try {
      const { messageIds } = req.body;
      const userId = req.user.uid;

      await Promise.all(
        messageIds.map((messageId) => Message.markAsRead(messageId, userId)),
      );

      res.status(200).json({
        success: true,
        message: "Messages marked as read",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Edit message
  editMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const { message: newMessage } = req.body;
      const userId = req.user.uid;

      // Get message and verify ownership
      const messageRef = await db.collection("messages").doc(messageId).get();

      if (!messageRef.exists) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      const messageData = messageRef.data();

      if (messageData.senderId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const message = new Message({ id: messageId, ...messageData });
      await message.edit(newMessage);

      res.status(200).json({
        success: true,
        message: "Message updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.uid;

      // Get message and verify ownership
      const messageRef = await db.collection("messages").doc(messageId).get();

      if (!messageRef.exists) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      const messageData = messageRef.data();

      if (messageData.senderId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const message = new Message({ id: messageId, ...messageData });
      const chat = await Chat.getById(messageData.chatId);

      // Check if this is the last message
      let isLastMessage = false;
      if (chat.lastMessage && chat.lastMessage.timestamp && messageData.timestamp) {
        isLastMessage = chat.lastMessage.timestamp.toMillis() === messageData.timestamp.toMillis();
      }

      // Delete the message
      await message.delete();

      // If deleted message was the last message, update chat's last message
      if (isLastMessage) {
        const recentMessages = await Message.getChatMessages(messageData.chatId, 1);
        const newLastMessage = recentMessages.length > 0 ? recentMessages[0] : null;
        await chat.updateLastMessage(newLastMessage || { message: "", senderId: "", timestamp: null, type: "text" });
      }

      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = messageController;
