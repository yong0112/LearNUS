const Chat = require("../models/chatModel");
const { db, admin } = require("../config/firebase");

const chatController = {
  // Get all chats for a user
  getUserChats: async (req, res) => {
    try {
      const userId = req.user.uid; // From auth middleware
      const chats = await Chat.getUserChats(userId);

      // Get participant details for each chat
      const chatsWithDetails = await Promise.all(
        chats.map(async (chat) => {
          const participantDetails = await Promise.all(
            chat.participants
              .filter((id) => id !== userId) // Exclude current user
              .map(async (participantId) => {
                try {
                  const userRecord = await admin.auth().getUser(participantId);
                  return {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    photoURL: userRecord.photoURL,
                  };
                } catch (error) {
                  return { uid: participantId, displayName: "Unknown User" };
                }
              }),
          );

          return {
            ...chat,
            participantDetails,
          };
        }),
      );

      res.status(200).json({
        success: true,
        data: chatsWithDetails,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Create or get existing chat
  createOrGetChat: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { participantId, tutorPostId } = req.body;

      if (!participantId) {
        return res.status(400).json({
          success: false,
          message: "Participant ID is required",
        });
      }

      // Check if chat already exists
      let chat = await Chat.findBetweenUsers(userId, participantId);

      if (!chat) {
        // Create new chat
        const chatData = {
          participants: [userId, participantId],
          type: "direct",
          metadata: tutorPostId ? { tutorPostId } : {},
        };

        chat = await Chat.create(chatData);
      }

      res.status(200).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get specific chat
  getChat: async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.uid;

      const chat = await Chat.getById(chatId);

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      // Check if user is participant
      if (!chat.isParticipant(userId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.status(200).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Create chat with tutor based on post
  createChatWithTutor: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { tutorId, postId } = req.body;

      // Validate input
      if (!tutorId || !postId) {
        return res.status(400).json({
          success: false,
          message: "Tutor ID and post ID are required",
        });
      }

      // Verify the tutor post exists
      const tutorDoc = await db.collection("tutors").doc(postId).get();
      if (!tutorDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Tutor post not found",
        });
      }

      const tutorData = tutorDoc.data();
      if (tutorData.tutor !== tutorId) {
        return res.status(400).json({
          success: false,
          message: "Tutor ID does not match post creator",
        });
      }

      // Check if chat already exists
      let chat = await Chat.findBetweenUsers(userId, tutorId);
      if (!chat) {
        const chatData = {
          participants: [userId, tutorId],
          type: "direct",
          metadata: {
            tutorPostId: postId,
            course: tutorData.course || "Unknown Course",
            description: tutorData.description || "",
          },
        };
        chat = await Chat.create(chatData);
      }

      res.status(200).json({
        success: true,
        data: {
          chatId: chat.id,
          message: "Chat created successfully",
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = chatController;
