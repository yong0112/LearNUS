const express = require("express");
const router = express.Router();
const {
  fetchUserProfile,
  updateUserProfilePic,
  updateUserQR,
} = require("../controllers/userController");

router.get("/users/:uid", fetchUserProfile);
router.post("/update-profile-pic", updateUserProfilePic);
router.post("/update-qr", updateUserQR);

module.exports = router;
