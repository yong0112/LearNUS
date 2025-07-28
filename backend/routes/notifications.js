const express = require("express");
const router = express.Router();
const {
  uploadUserNoti,
  fetchUserNoti,
  updateUserNoti,
} = require("../controllers/notificationController");

router.post("/:uid/uploadNoti", uploadUserNoti);
router.get("/:uid/fetchNoti", fetchUserNoti);
router.post("/:uid/updateNoti", updateUserNoti);

module.exports = router;
