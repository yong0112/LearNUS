const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware"); // Your existing auth middleware

router.use(authMiddleware);

router.get("/:chatId", messageController.getChatMessages);
router.post("/", messageController.sendMessage);
router.put("/read", messageController.markAsRead);
router.put("/:messageId", messageController.editMessage);
router.delete("/:messageId", messageController.deleteMessage);

module.exports = router;
