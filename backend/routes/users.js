const express = require("express");
const router = express.Router();
const {
  fetchUserProfile,
  updateUserProfilePic,
  updateUserQR,
  updateRating,
} = require("../controllers/userController");

router.get("/users/:uid", fetchUserProfile);
router.post("/update-profile-pic", updateUserProfilePic);
router.post("/update-qr", updateUserQR);
router.post("/update-rating", updateRating);

module.exports = router;
