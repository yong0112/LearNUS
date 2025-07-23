const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.get("/", chatController.getUserChats);
router.post("/", chatController.createOrGetChat);
router.get("/:chatId", chatController.getChat);
router.post("/tutor", chatController.createChatWithTutor);

module.exports = router;
